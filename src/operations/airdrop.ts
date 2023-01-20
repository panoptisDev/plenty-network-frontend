import { OpKind, ParamsWithKind, WalletParamsWithKind } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import { IClaimAPIData, Mission } from "../api/airdrop/types";
import { connectedNetwork, dappClient } from "../common/walletconnect";
import Config from "../config/config";
import { GAS_LIMIT_EXCESS, STORAGE_LIMIT_EXCESS } from "../constants/global";
import { store } from "../redux";
import { setFlashMessage } from "../redux/flashMessage";
import { IFlashMessageProps } from "../redux/flashMessage/type";
import { TResetAllValues, TSetShowConfirmTransaction, TTransactionSubmitModal } from "./types";

/**
 * Performs claim operation of airdrop.
 * @param airdropClaimData - Claim data received from api
 * @param transactionSubmitModal - Callback to open modal when transaction is submiited
 * @param resetAllValues - Callback to reset values when transaction is submitted
 * @param setShowConfirmTransaction - Callback to show transaction confirmed
 * @param flashMessageContent - Content for the flash message object(optional)
 */
export const claimAirdrop = async (
  airdropClaimData: IClaimAPIData[],
  hasUserTweeted: boolean,
  transactionSubmitModal: TTransactionSubmitModal | undefined,
  resetAllValues: TResetAllValues | undefined,
  setShowConfirmTransaction: TSetShowConfirmTransaction | undefined,
  flashMessageContent?: IFlashMessageProps
) => {
  try {
    if (airdropClaimData.length <= 0) {
      throw new Error("Nothing to claim");
    }
    const { CheckIfWalletConnected } = dappClient();
    const walletResponse = await CheckIfWalletConnected();
    if (!walletResponse.success) {
      throw new Error("Wallet connection failed.");
    }
    const Tezos = await dappClient().tezos();
    const airdropContract: string = Config.AIRDROP[connectedNetwork];

    const airdropInstance = await Tezos.wallet.at(airdropContract);

    const allBatchOperations: WalletParamsWithKind[] = [];

    for(const claimData of airdropClaimData) {
      if (!claimData.claimed) {
        if(!hasUserTweeted && claimData.mission === Mission.ELIGIBLE) {
          continue;
        } else {
          const op = airdropInstance.methods
            .claim(claimData.packedMessage, claimData.signature)
            .toTransferParams();
          // const limits = await Tezos.estimate.transfer(op);
          // const gasLimit = new BigNumber(limits.gasLimit)
          //   .plus(new BigNumber(limits.gasLimit).multipliedBy(GAS_LIMIT_EXCESS))
          //   .decimalPlaces(0,1)
          //   .toNumber();
          // const storageLimit = new BigNumber(limits.storageLimit)
          //   .plus(new BigNumber(limits.storageLimit).multipliedBy(STORAGE_LIMIT_EXCESS))
          //   .decimalPlaces(0,1)
          //   .toNumber();
          allBatchOperations.push({
            kind: OpKind.TRANSACTION,
            ...op,
            // gasLimit,
            // storageLimit,
          });
        }
      }
    }

    if (allBatchOperations.length <= 0) {
      throw new Error("Nothing to claim");
    }

    const limits = await Tezos.estimate
      .batch(allBatchOperations as ParamsWithKind[])
      .then((limits) => limits)
      .catch((err) => {
        console.log(err);
        return undefined;
      });
    const updatedBatchOperations: WalletParamsWithKind[] = [];
    if(limits !== undefined) {
      allBatchOperations.forEach((op, index) => {
        const gasLimit = new BigNumber(limits[index].gasLimit)
          .plus(new BigNumber(limits[index].gasLimit).multipliedBy(GAS_LIMIT_EXCESS))
          .decimalPlaces(0, 1)
          .toNumber();
        const storageLimit = new BigNumber(limits[index].storageLimit)
          .plus(new BigNumber(limits[index].storageLimit).multipliedBy(STORAGE_LIMIT_EXCESS))
          .decimalPlaces(0, 1)
          .toNumber();

        updatedBatchOperations.push({
          ...op,
          gasLimit,
          storageLimit,
        });
      });
    } else {
      throw new Error("Failed to create batch");
    }

    // const batch = Tezos.wallet.batch(allBatchOperations);
    const batch = Tezos.wallet.batch(updatedBatchOperations);
    const batchOperation = await batch.send();

    setShowConfirmTransaction && setShowConfirmTransaction(false);
    transactionSubmitModal && transactionSubmitModal(batchOperation.opHash as string);
    resetAllValues && resetAllValues();
    if (flashMessageContent) {
      store.dispatch(setFlashMessage(flashMessageContent));
    }

    await batchOperation.confirmation(1);

    console.log(batchOperation.status());

    const status = await batchOperation.status();
    if (status === "applied") {
      return {
        success: true,
        operationId: batchOperation?.opHash,
      };
    } else {
      throw new Error(status);
    }
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      operationId: undefined,
      error: error.message,
    };
  }
};
