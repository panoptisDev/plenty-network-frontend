//TODO: Merge this file's functions to index.ts under votes when all developers have finished with their respective api development.
import { BigNumber } from "bignumber.js";
import axios from "axios";
import { connectedNetwork, voterAddress as voterContractAddress } from "../../common/walletconnect";
import Config from "../../config/config";
import { getStorage, getTzktBigMapData } from "../util/storageProvider";
import { voterStorageType } from "./data";
import {
  IAllVotesData,
  IAllVotesResponse,
  IMyAmmVotesBigMap,
  ITotalAmmVotesBigMap,
  IVeNFTData,
  IVeNFTListResponse,
  IVotesData,
  IVotesResponse,
} from "./types";
import { PLY_DECIMAL_MULTIPLIER, VOTES_CHART_LIMIT } from "../../constants/global";
import { store } from "../../redux";
import { IVotes } from "../../operations/types";
import { fetchEpochData } from "../util/epoch";
import { IEpochData } from "../util/types";


/**
 * Returns the list of veNFT tokens for a particular user address.
 * @param userTezosAddress - Tezos wallet address of the user
 */
export const getVeNFTsList = async (
  userTezosAddress: string,
  epochNumber: number
): Promise<IVeNFTListResponse> => {
  try {
    if (!userTezosAddress || !epochNumber) {
      throw new Error("Invalid or empty arguments.");
    }
    const epochDataResponse = await fetchEpochData(epochNumber);
    if (!epochDataResponse.success) {
      throw new Error(epochDataResponse.error as string);
    }
    const epochData = epochDataResponse.epochData as IEpochData;
    const epochTimestamp = epochData.epochEndTimestamp - 10; // Timestamp within the epoch.

    const locksResponse = await axios.get(
      `${Config.VE_INDEXER}locks?address=${userTezosAddress}&epoch=${epochNumber}&timestamp=${epochTimestamp}`
    );
    const locksData = locksResponse.data.result;
    const initalLocksArray: IVeNFTData[] = [];

    const finalVeNFTData: IVeNFTData[] = locksData.reduce(
      (finalLocks: IVeNFTData[], lock: any): IVeNFTData[] => {
        if (
          new BigNumber(lock.epochtVotingPower).isFinite() &&
          new BigNumber(lock.epochtVotingPower).isGreaterThan(0)
        ) {
          finalLocks.push({
            tokenId: new BigNumber(lock.id),
            baseValue: new BigNumber(lock.baseValue).dividedBy(PLY_DECIMAL_MULTIPLIER),
            votingPower: new BigNumber(lock.availableVotingPower).dividedBy(PLY_DECIMAL_MULTIPLIER),
          });
        }
        return finalLocks;
      },
      initalLocksArray
    );

    return {
      success: true,
      veNFTData: finalVeNFTData,
    };
  } catch (error: any) {
    return {
      success: false,
      veNFTData: [],
      error: error.message,
    };
  }
};

/**
 * Returns the total AMM votes allocation chart data in selected epoch.
 * @param epochNumber - Numeric value of the epoch for which the data is to be fetched
 */
export const getTotalAmmVotes = async (epochNumber: number): Promise<IVotesResponse> => {
  try {
    const state = store.getState();
    const AMM = state.config.AMMs;
    const voterContractAddress: string = Config.VOTER[connectedNetwork];
    // const voterContractAddress: string = "KT1PexY3Jn8BCJmVpVLNN944YpVLM2LWTMMV";
    const voterStorageResponse = await getStorage(voterContractAddress, voterStorageType);
    const totalAmmVotesBigMapId: string = voterStorageResponse.total_amm_votes;
    const totalEpochVotesBigMapId: string = voterStorageResponse.total_epoch_votes;
    const totalEpochVotesResponse = await getTzktBigMapData(
      totalEpochVotesBigMapId,
      `key=${epochNumber}&select=key,value`
    );
    if (totalEpochVotesResponse.data.length === 0) {
      throw new Error("No votes in this epoch yet");
    }
    const totalEpochVotes: BigNumber = new BigNumber(totalEpochVotesResponse.data[0].value);

    const totalAmmVotesResponse = await getTzktBigMapData(
      totalAmmVotesBigMapId,
      `key.epoch=${epochNumber}&select=key,value`
    );
    const totalAmmVotesBigMapData: ITotalAmmVotesBigMap[] = totalAmmVotesResponse.data;
    if (totalAmmVotesBigMapData.length === 0) {
      throw new Error("No votes data for AMMS in this epoch yet");
    }
    // Sort the list to get top votes with highest first.
    totalAmmVotesBigMapData.sort(compareBigMapData);

    const totalAmmVotesData: IVotesData[] = totalAmmVotesBigMapData.map(
      (voteData): IVotesData => ({
        dexContractAddress: voteData.key.amm,
        votePercentage: new BigNumber(voteData.value).multipliedBy(100).dividedBy(totalEpochVotes),
        votes: new BigNumber(voteData.value).dividedBy(PLY_DECIMAL_MULTIPLIER),
        tokenOneSymbol: AMM[voteData.key.amm].token1.symbol,
        tokenTwoSymbol: AMM[voteData.key.amm].token2.symbol,
      })
    );
    // Return the existing list if the gauges count is 9 or less.
    if (totalAmmVotesData.length <= VOTES_CHART_LIMIT) {
      return {
        success: true,
        isOtherDataAvailable: false,
        allData: totalAmmVotesData,
        topAmmData: totalAmmVotesData,
        otherData: {},
      };
    }
    // Create a list of top 9 gauges and sum up the remaining others from the main list.
    const [topAmmData, summedData] = createOtherAmmsData(totalAmmVotesData);

    return {
      success: true,
      isOtherDataAvailable: true,
      allData: totalAmmVotesData,
      topAmmData,
      otherData: summedData,
    };
  } catch (error: any) {
    console.log(error.message);
    return {
      success: false,
      isOtherDataAvailable: false,
      allData: [],
      topAmmData: [],
      otherData: {},
      error: error.message,
    };
  }
};

/**
 * Returns the total AMM votes allocation chart data for a particular veNFT in selected epoch
 * @param epochNumber - Numeric value of the epoch for which the data is to be fetched
 * @param tokenId - veNFT token ID for which the data is to be fetched
 */
export const getMyAmmVotes = async (
  epochNumber: number,
  tokenId: number
): Promise<IVotesResponse> => {
  try {
    const state = store.getState();
    const AMM = state.config.AMMs;
    const voterContractAddress: string = Config.VOTER[connectedNetwork];
    // const voterContractAddress: string = "KT1PexY3Jn8BCJmVpVLNN944YpVLM2LWTMMV";
    const voterStorageResponse = await getStorage(voterContractAddress, voterStorageType);
    const tokenAmmVotesBigMapId: string = voterStorageResponse.token_amm_votes;
    const totalTokenVotesBigMapId: string = voterStorageResponse.total_token_votes;
    const totalTokenVotesResponse = await getTzktBigMapData(
      totalTokenVotesBigMapId,
      `key.epoch=${epochNumber}&key.token_id=${tokenId}&select=key,value`
    );
    if (totalTokenVotesResponse.data.length === 0) {
      throw new Error("No votes in this epoch yet");
    }
    const totalTokenVotes: BigNumber = new BigNumber(totalTokenVotesResponse.data[0].value);
    
    const tokenAmmVotesResponse = await getTzktBigMapData(
      tokenAmmVotesBigMapId,
      `key.epoch=${epochNumber}&key.token_id=${tokenId}&select=key,value`
    );
    const tokenAmmVotesBigMapData: IMyAmmVotesBigMap[] = tokenAmmVotesResponse.data;
    if (tokenAmmVotesBigMapData.length === 0) {
      throw new Error("No votes data for AMMS in this epoch yet");
    }
    // Sort the list to get top votes with highest first.
    tokenAmmVotesBigMapData.sort(compareBigMapData);
    
    const myAmmVotesData: IVotesData[] = tokenAmmVotesBigMapData.map(
      (voteData): IVotesData => ({
        dexContractAddress: voteData.key.amm,
        votePercentage: new BigNumber(voteData.value).multipliedBy(100).dividedBy(totalTokenVotes),
        votes: new BigNumber(voteData.value).dividedBy(PLY_DECIMAL_MULTIPLIER),
        tokenOneSymbol: AMM[voteData.key.amm].token1.symbol,
        tokenTwoSymbol: AMM[voteData.key.amm].token2.symbol,
      })
    );
    // Return the existing list if the gauges count is 9 or less.
    if (myAmmVotesData.length <= VOTES_CHART_LIMIT) {
      return {
        success: true,
        isOtherDataAvailable: false,
        allData: myAmmVotesData,
        topAmmData: myAmmVotesData,
        otherData: {},
      };
    }
    // Create a list of top 9 gauges and sum up the remaining others from the main list.
    const [topAmmData, summedData] = createOtherAmmsData(myAmmVotesData);

    return {
      success: true,
      isOtherDataAvailable: true,
      allData: myAmmVotesData,
      topAmmData,
      otherData: summedData,
    };
  } catch (error: any) {
    console.log(error.message);
    return {
      success: false,
      isOtherDataAvailable: false,
      allData: [],
      topAmmData: [],
      otherData: {},
      error: error.message,
    };
  }
};

/**
 * Fetch all votes data in an epoch for a particular veNFT or for all.
 * @param epochNumber - Numeric value of the epoch for which the data is to be fetched
 * @param tokenId - veNFT token ID for which the data is to be fetched
 */
export const getAllVotesData = async (
  epochNumber: number,
  tokenId: number | undefined
): Promise<IAllVotesResponse> => {
  try {
    const state = store.getState();
    const AMM = state.config.AMMs;
    // const voterContractAddress: string = "KT1PexY3Jn8BCJmVpVLNN944YpVLM2LWTMMV";
    const voterStorageResponse = await getStorage(voterContractAddress, voterStorageType);
    const tokenAmmVotesBigMapId: string = voterStorageResponse.token_amm_votes;
    const totalTokenVotesBigMapId: string = voterStorageResponse.total_token_votes;
    const totalAmmVotesBigMapId: string = voterStorageResponse.total_amm_votes;
    const totalEpochVotesBigMapId: string = voterStorageResponse.total_epoch_votes;

    const totalVotesData: IAllVotesData = {};
    const myVotesData: IAllVotesData = {};

    const totalEpochVotesResponse = await getTzktBigMapData(
      totalEpochVotesBigMapId,
      `key=${epochNumber}&select=key,value`
    );
    if (totalEpochVotesResponse.data.length === 0) {
      throw new Error("No votes in this epoch yet");
    }
    const totalEpochVotes: BigNumber = new BigNumber(totalEpochVotesResponse.data[0].value);

    const totalAmmVotesResponse = await getTzktBigMapData(
      totalAmmVotesBigMapId,
      `key.epoch=${epochNumber}&select=key,value`
    );
    const totalAmmVotesBigMapData: ITotalAmmVotesBigMap[] = totalAmmVotesResponse.data;
    if (totalAmmVotesBigMapData.length === 0) {
      throw new Error("No votes data for AMMS in this epoch yet");
    }

    totalAmmVotesBigMapData.forEach((voteData) => {
      totalVotesData[voteData.key.amm] = {
        dexContractAddress: voteData.key.amm,
        votePercentage: new BigNumber(voteData.value).multipliedBy(100).dividedBy(totalEpochVotes),
        votes: new BigNumber(voteData.value).dividedBy(PLY_DECIMAL_MULTIPLIER),
        tokenOneSymbol: AMM[voteData.key.amm].token1.symbol,
        tokenTwoSymbol: AMM[voteData.key.amm].token2.symbol,
      };
    });

    if (tokenId !== undefined) {
      const totalTokenVotesResponse = await getTzktBigMapData(
        totalTokenVotesBigMapId,
        `key.epoch=${epochNumber}&key.token_id=${tokenId}&select=key,value`
      );
      if (totalTokenVotesResponse.data.length > 0) {
        const totalTokenVotes: BigNumber = new BigNumber(totalTokenVotesResponse.data[0].value);

        const tokenAmmVotesResponse = await getTzktBigMapData(
          tokenAmmVotesBigMapId,
          `key.epoch=${epochNumber}&key.token_id=${tokenId}&select=key,value`
        );
        const tokenAmmVotesBigMapData: IMyAmmVotesBigMap[] = tokenAmmVotesResponse.data;
        if (tokenAmmVotesBigMapData.length > 0) {
          tokenAmmVotesBigMapData.forEach((voteData) => {
            myVotesData[voteData.key.amm] = {
              dexContractAddress: voteData.key.amm,
              votePercentage: new BigNumber(voteData.value)
                .multipliedBy(100)
                .dividedBy(totalTokenVotes),
              votes: new BigNumber(voteData.value).dividedBy(PLY_DECIMAL_MULTIPLIER),
              tokenOneSymbol: AMM[voteData.key.amm].token1.symbol,
              tokenTwoSymbol: AMM[voteData.key.amm].token2.symbol,
            };
          });
        }
      }
    }

    return {
      success: true,
      totalVotesData,
      myVotesData,
    };
  } catch (error: any) {
    return {
      success: false,
      totalVotesData: {},
      myVotesData: {},
      error: error.message,
    };
  }
};

/**
 * Returns votes data array with the remianing voting power dust added to the votes of last pool in the input votes array.
 * @param votingPower - Total available voting power for the selected veNFT
 * @param totalVotesPercentage - Percentage of votes selected by the user across all pools
 * @param votesData - The votes data array formed after voting for all pools is done
 */
export const addRemainingVotesDust = (
  votingPower: string | BigNumber,
  totalVotesPercentage: number,
  votesData: IVotes[]
): IVotes[] => {
  try {
    const finalVotesData = [...votesData];
    const availableVotingPower = new BigNumber(votingPower).multipliedBy(PLY_DECIMAL_MULTIPLIER);
    
    const currentVotesSum = finalVotesData.reduce((sum, vote) => {
      sum = sum.plus(vote.votes);
      return sum;
    }, new BigNumber(0));
    const remainingVotesDust = availableVotingPower.minus(currentVotesSum);
    
    if (remainingVotesDust.isGreaterThan(0) && new BigNumber(totalVotesPercentage).isEqualTo(100)) {
      finalVotesData[finalVotesData.length - 1].votes =
        finalVotesData[finalVotesData.length - 1].votes.plus(remainingVotesDust);
        console.log('Dust added');
    }
    return finalVotesData;
  } catch (error: any) {
    return [...votesData];
  }
};

/**
 * Function used as a callback for sorting the AMM votes allocation data in descending order of the votes count.
 */
const compareBigMapData = (
  valueOne: ITotalAmmVotesBigMap | IMyAmmVotesBigMap,
  valueTwo: ITotalAmmVotesBigMap | IMyAmmVotesBigMap
): number => {
  if (new BigNumber(valueOne.value).isGreaterThan(new BigNumber(valueTwo.value))) {
    return -1;
  } else if (new BigNumber(valueOne.value).isLessThan(new BigNumber(valueTwo.value))) {
    return 1;
  } else {
    return 0;
  }
};

/**
 * Function to slice the votes allocation data list into 2 lists of TOP 'N' and remaining,
 * and further sum up the remaining data into one object. Returns the TOP 'N' AMM array and 
 * the summed object of other AMM votes.
 * @param allAmmVotesData - Array of vote allocation data for all the AMMs
 */
const createOtherAmmsData = (allAmmVotesData: IVotesData[]): [IVotesData[], IVotesData] => {
  const topAmmData = allAmmVotesData.slice(0, VOTES_CHART_LIMIT);
  const dataToBeSummed = allAmmVotesData.slice(VOTES_CHART_LIMIT);
  const initialSummedObject: IVotesData = {
    dexContractAddress: undefined,
    votePercentage: new BigNumber(0),
    votes: new BigNumber(0),
    tokenOneSymbol: undefined,
    tokenTwoSymbol: undefined,
  };
  const summedData = dataToBeSummed.reduce(
    (summedObject: IVotesData, data: IVotesData): IVotesData => ({
      ...summedObject,
      votePercentage: summedObject.votePercentage.plus(data.votePercentage),
      votes: summedObject.votes.plus(data.votes),
    }),
    initialSummedObject
  );
  return [topAmmData, summedData];
};
