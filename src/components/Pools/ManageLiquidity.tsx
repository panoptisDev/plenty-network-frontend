import { BigNumber } from "bignumber.js";
import Image from "next/image";
import * as React from "react";
import { useEffect, useState } from "react";
import { getPnlpOutputEstimate, getPoolShareForPnlp } from "../../api/liquidity";
import { ELiquidityProcess } from "../../api/liquidity/types";
import { getDepositedAmounts, getRewards } from "../../api/rewards";
import { getVePLYListForUser } from "../../api/stake";
import { IVePLYData } from "../../api/stake/types";
import { loadSwapDataWrapper } from "../../api/swap/wrappers";
import { getPnlpBalance, getStakedBalance, getUserBalanceByRpc } from "../../api/util/balance";
import { getLPTokenPrice } from "../../api/util/price";
import { ELocksState } from "../../api/votes/types";
import playBtn from "../../assets/icon/common/playBtn.svg";
import {
  FIRST_TOKEN_AMOUNT,
  SECOND_TOKEN_AMOUNT,
  TOKEN_A,
  TOKEN_B,
} from "../../constants/localStorage";
import { addLiquidity } from "../../operations/addLiquidity";
import { removeLiquidity } from "../../operations/removeLiquidity";
import { harvestRewards } from "../../operations/rewards";
import { stakePnlpTokens } from "../../operations/stake";
import { unstakePnlpTokens } from "../../operations/unstake";
import { useAppDispatch, useAppSelector } from "../../redux";
import { setFlashMessage } from "../../redux/flashMessage";
import { setIsLoadingWallet } from "../../redux/walletLoading";
import ConfirmTransaction from "../ConfirmTransaction";
import { Flashtype } from "../FlashScreen";
import Liquidity from "../Liquidity";
import ConfirmAddLiquidity from "../Liquidity/ConfirmAddLiquidity";
import ConfirmRemoveLiquidity from "../Liquidity/ConfirmRemoveLiquidity";
import { ISwapData, tokenParameterLiquidity } from "../Liquidity/types";
import { PopUpModal } from "../Modal/popupModal";
import { VideoModal } from "../Modal/videoModal";
import { InfoIconToolTip } from "../Tooltip/InfoIconTooltip";
import TransactionSubmitted from "../TransactionSubmitted";
import { ConfirmStakeLiquidity } from "./ConfirmStaking";
import { ConfirmUnStakeLiquidity } from "./ConfirmUnstake";
import { ActiveLiquidity, ManageLiquidityHeader } from "./ManageLiquidityHeader";
import { RewardsScreen } from "./RewardsScreen";
import { StakingScreen, StakingScreenType } from "./StakingScreen";

export interface IManageLiquidityProps {
  closeFn: React.Dispatch<React.SetStateAction<boolean>>;
  tokenIn: tokenParameterLiquidity;
  tokenOut: tokenParameterLiquidity;
  setActiveState: React.Dispatch<React.SetStateAction<string>>;
  activeState: string;
}

export function ManageLiquidity(props: IManageLiquidityProps) {
  const [stakingScreen, setStakingScreen] = useState(StakingScreenType.Staking);
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const [slippage, setSlippage] = useState<string>("0.5");
  const TOKEN = useAppSelector((state) => state.config.tokens);
  const tokenPrice = useAppSelector((state) => state.tokenPrice.tokenPrice);
  const walletAddress = useAppSelector((state) => state.wallet.address);
  const [screen, setScreen] = React.useState("1");
  const [firstTokenAmountLiq, setFirstTokenAmountLiq] = React.useState<string | number>("");
  const [secondTokenAmountLiq, setSecondTokenAmountLiq] = React.useState<number | string>("");

  const [userBalances, setUserBalances] = useState<{ [key: string]: string }>({});
  const [selectedDropDown, setSelectedDropDown] = useState<IVePLYData>({
    tokenId: "",
    boostValue: "",
    votingPower: "",
    lockState: 0 as ELocksState,
  });
  const [isAddLiquidity, setIsAddLiquidity] = useState(true);
  const [showConfirmTransaction, setShowConfirmTransaction] = useState(false);
  const [burnAmount, setBurnAmount] = React.useState<string | number>("");
  const [transactionId, setTransactionId] = useState("");
  const swapData = React.useRef<ISwapData>({
    tokenInSupply: new BigNumber(0),
    tokenOutSupply: new BigNumber(0),
    lpToken: "",
    lpTokenSupply: new BigNumber(0),
    isloading: true,
  });
  const [removeTokenAmount, setRemoveTokenAmount] = useState({
    tokenOneAmount: "",
    tokenTwoAmount: "",
  });

  const dispatch = useAppDispatch();
  const [pnlpEstimates, setPnlpEstimates] = useState("");
  const transactionSubmitModal = (id: string) => {
    setTransactionId(id);
    setShowTransactionSubmitModal(true);
  };
  const [sharePool, setSharePool] = useState("");
  const [showTransactionSubmitModal, setShowTransactionSubmitModal] = useState(false);
  const [balanceUpdate, setBalanceUpdate] = useState(false);
  const [pnlpBalance, setPnlpBalance] = useState("");
  const [stakeInput, setStakeInput] = useState<string | number>("");
  const [unStakeInput, setUnStakeInput] = useState<string | number>("");
  const [lpTokenPrice, setLpTokenPrice] = useState(new BigNumber(0));
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInAmountHarvest, setTokenInAmountHarvest] = useState("");
  const [tokenOutAmountHarvest, setTokenOutAmountHarvest] = useState("");
  const [rewardToken, setRewardToken] = useState("");
  const [stakedToken, setStakedToken] = useState("");
  const stakedTokenLp = React.useRef<string>("");
  const [contentTransaction, setContentTransaction] = useState("");
  const [vePLYOptions, setVePLYOptions] = useState<IVePLYData[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);

  useEffect(() => {
    if (walletAddress || (screen === "2" && props.activeState === ActiveLiquidity.Staking)) {
      setIsListLoading(true);
      getVePLYListForUser(
        props.tokenIn.symbol,
        props.tokenOut.symbol,
        stakeInput === "" ? undefined : stakeInput.toString(),
        walletAddress
      ).then((res) => {
        setIsListLoading(false);
        const veplyData = res.vePLYData;
        setVePLYOptions(veplyData);
      });
    }
  }, [stakeInput, walletAddress, screen, props.activeState]);

  useEffect(() => {
    if (vePLYOptions.length > 0) {
      vePLYOptions.map((id, i) => {
        if (id.tokenId === selectedDropDown.tokenId) {
          setSelectedDropDown(id);
        }
      });
    } else {
      setSelectedDropDown({
        tokenId: "",
        boostValue: "",
        votingPower: "",
        lockState: 0 as ELocksState,
      });
    }
  }, [vePLYOptions]);
  useEffect(() => {
    getLPTokenPrice(props.tokenIn.name, props.tokenOut.name, {
      [props.tokenIn.name]: tokenPrice[props.tokenIn.name],
      [props.tokenOut.name]: tokenPrice[props.tokenOut.name],
    }).then((res) => {
      setLpTokenPrice(res.lpTokenPrice);
    });
    if (walletAddress) {
      const updateBalance = async () => {
        const balancePromises = [];

        Object.keys(props.tokenIn).length !== 0 &&
          balancePromises.push(getUserBalanceByRpc(props.tokenIn.name, walletAddress));
        Object.keys(props.tokenOut).length !== 0 &&
          balancePromises.push(getUserBalanceByRpc(props.tokenOut.name, walletAddress));
        getPnlpBalance(props.tokenIn.name, props.tokenOut.name, walletAddress).then((res) => {
          setPnlpBalance(res.balance);
        });

        getStakedBalance(props.tokenIn.name, props.tokenOut.name, walletAddress).then((res) => {
          setStakedToken(res.balance);
          stakedTokenLp.current = res.balance;
          const response = getDepositedAmounts(
            res.balance,
            props.tokenIn.name,
            props.tokenOut.name,
            swapData.current.tokenInSupply,
            swapData.current.tokenOutSupply,
            swapData.current.lpTokenSupply
          );

          setTokenInAmountHarvest(response.tokenOneAmount);
          setTokenOutAmountHarvest(response.tokenTwoAmount);
        });
        getRewards(props.tokenIn.name, props.tokenOut.name, walletAddress).then((res) => {
          setRewardToken(res.rewards);
        });

        const balanceResponse = await Promise.all(balancePromises);

        setUserBalances((prev) => ({
          ...prev,
          ...balanceResponse.reduce(
            (acc, cur) => ({
              ...acc,
              [cur.identifier]: cur.balance.toNumber(),
            }),
            {}
          ),
        }));
      };
      updateBalance();
    }
  }, [
    props.tokenIn,
    props.tokenOut,
    props,
    tokenPrice[props.tokenIn.name],
    tokenPrice[props.tokenOut.name],
    TOKEN,
    balanceUpdate,
    swapData.current,
  ]);
  useEffect(() => {
    if (
      Object.prototype.hasOwnProperty.call(props.tokenIn, "name") &&
      Object.prototype.hasOwnProperty.call(props.tokenOut, "name")
    ) {
      setIsLoading(true);
      loadSwapDataWrapper(props.tokenIn.name, props.tokenOut.name).then((response) => {
        swapData.current = {
          tokenInSupply: response.tokenInSupply as BigNumber,
          tokenOutSupply: response.tokenOutSupply as BigNumber,
          lpToken: response.lpToken?.symbol,
          lpTokenSupply: response.lpTokenSupply,
          isloading: false,
        };
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (firstTokenAmountLiq > 0 && secondTokenAmountLiq > 0 && isAddLiquidity) {
      const res = getPnlpOutputEstimate(
        props.tokenIn.symbol,
        props.tokenOut.symbol,
        firstTokenAmountLiq.toString(),
        secondTokenAmountLiq.toString(),
        swapData.current.tokenInSupply as BigNumber,
        swapData.current.tokenOutSupply as BigNumber,
        swapData.current.lpTokenSupply,
        swapData.current.lpToken
      );
      setPnlpEstimates(res.pnlpEstimate);
      const sharePool = getPoolShareForPnlp(
        res.pnlpEstimate,
        swapData.current.lpTokenSupply,
        ELiquidityProcess.ADD
      );
      setSharePool(sharePool.pnlpPoolShare);
    } else if (burnAmount > 0 && !isAddLiquidity) {
      const sharePool = getPoolShareForPnlp(
        burnAmount.toString(),
        swapData.current.lpTokenSupply,
        ELiquidityProcess.REMOVE
      );
      setSharePool(sharePool.pnlpPoolShare);
    }
  }, [firstTokenAmountLiq, secondTokenAmountLiq, screen, burnAmount]);
  const resetAllValues = () => {
    setFirstTokenAmountLiq("");
    setSecondTokenAmountLiq("");
    setBurnAmount("");
    setStakeInput("");
    setUnStakeInput("");
    setBalanceUpdate(false);
  };

  const handleAddLiquidityOperation = () => {
    setContentTransaction(
      `Mint ${Number(firstTokenAmountLiq).toFixed(2)} ${
        props.tokenIn.name === "tez"
          ? "TEZ"
          : props.tokenIn.name === "ctez"
          ? "CTEZ"
          : props.tokenIn.name
      } / ${Number(secondTokenAmountLiq).toFixed(4)} ${
        props.tokenOut.name === "tez"
          ? "TEZ"
          : props.tokenOut.name === "ctez"
          ? "CTEZ"
          : props.tokenOut.name
      } `
    );
    localStorage.setItem(
      TOKEN_A,
      props.tokenIn.name === "tez"
        ? "TEZ"
        : props.tokenIn.name === "ctez"
        ? "CTEZ"
        : props.tokenIn.name
    );
    localStorage.setItem(
      TOKEN_B,
      props.tokenOut.name === "tez"
        ? "TEZ"
        : props.tokenOut.name === "ctez"
        ? "CTEZ"
        : props.tokenOut.name
    );
    localStorage.setItem(FIRST_TOKEN_AMOUNT, Number(firstTokenAmountLiq).toFixed(2));
    localStorage.setItem(SECOND_TOKEN_AMOUNT, Number(secondTokenAmountLiq).toFixed(2));
    dispatch(setIsLoadingWallet({ isLoading: true, operationSuccesful: false }));
    setShowConfirmTransaction(true);
    setScreen("1");

    addLiquidity(
      props.tokenIn.symbol,
      props.tokenOut.symbol,
      firstTokenAmountLiq.toString(),
      secondTokenAmountLiq.toString(),
      walletAddress,
      transactionSubmitModal,
      resetAllValues,
      setShowConfirmTransaction,
      props.setActiveState,
      {
        flashType: Flashtype.Info,
        headerText: "Transaction submitted",
        trailingText: `Add ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} ${localStorage.getItem(
          TOKEN_A
        )} and ${localStorage.getItem(SECOND_TOKEN_AMOUNT)} ${localStorage.getItem(TOKEN_B)}.`,
        linkText: "View in Explorer",
        isLoading: true,

        transactionId: "",
      }
    ).then((response) => {
      if (response.success) {
        setBalanceUpdate(true);
        //resetAllValues();
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Success,
              headerText: "Success",
              trailingText: `Add ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} ${localStorage.getItem(
                TOKEN_A
              )} and ${localStorage.getItem(SECOND_TOKEN_AMOUNT)} ${localStorage.getItem(TOKEN_B)}`,
              linkText: "View in Explorer",
              isLoading: true,
              onClick: () => {
                window.open(
                  `https://ghostnet.tzkt.io/${response.operationId ? response.operationId : ""}`,
                  "_blank"
                );
              },
              transactionId: response.operationId ? response.operationId : "",
            })
          );
        }, 6000);
        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      } else {
        setBalanceUpdate(true);
        //resetAllValues();
        setShowConfirmTransaction(false);
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Rejected,
              transactionId: "",
              headerText: "Rejected",
              trailingText: `Add ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} ${localStorage.getItem(
                TOKEN_A
              )} and ${localStorage.getItem(SECOND_TOKEN_AMOUNT)} ${localStorage.getItem(TOKEN_B)}`,
              linkText: "",
              isLoading: true,
            })
          );
        }, 2000);

        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      }
    });
  };
  const handleStakeOperation = () => {
    localStorage.setItem(
      TOKEN_A,
      props.tokenIn.name === "tez"
        ? "TEZ"
        : props.tokenIn.name === "ctez"
        ? "CTEZ"
        : props.tokenIn.name
    );
    localStorage.setItem(
      TOKEN_B,
      props.tokenOut.name === "tez"
        ? "TEZ"
        : props.tokenOut.name === "ctez"
        ? "CTEZ"
        : props.tokenOut.name
    );
    localStorage.setItem(FIRST_TOKEN_AMOUNT, Number(stakeInput).toFixed(2));
    localStorage.setItem(SECOND_TOKEN_AMOUNT, selectedDropDown.tokenId.toString());
    setContentTransaction(
      stakeInput !== ""
        ? `Stake ${Number(stakeInput).toFixed(2)} PNLP`
        : `Boost ${localStorage.getItem(TOKEN_A)}/${localStorage.getItem(
            TOKEN_B
          )} pool stake with # ${localStorage.getItem(SECOND_TOKEN_AMOUNT)}`
    );
    dispatch(setIsLoadingWallet({ isLoading: true, operationSuccesful: false }));
    setShowConfirmTransaction(true);
    setScreen("1");

    stakePnlpTokens(
      props.tokenIn.symbol,
      props.tokenOut.symbol,
      stakeInput !== "" ? stakeInput.toString() : "0",
      selectedDropDown.tokenId ? Number(selectedDropDown.tokenId) : undefined,
      walletAddress,
      transactionSubmitModal,
      resetAllValues,
      setShowConfirmTransaction,
      props.setActiveState,
      {
        flashType: Flashtype.Info,
        headerText: "Transaction submitted",
        trailingText:
          stakeInput !== ""
            ? `Stake ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} ${localStorage.getItem(
                TOKEN_A
              )} / ${localStorage.getItem(TOKEN_B)} PNLP `
            : `Boost ${localStorage.getItem(TOKEN_A)}/${localStorage.getItem(
                TOKEN_B
              )} pool stake with # ${localStorage.getItem(SECOND_TOKEN_AMOUNT)} `,
        linkText: "View in Explorer",
        isLoading: true,

        transactionId: "",
      }
    ).then((response) => {
      if (response.success) {
        setBalanceUpdate(true);
        //resetAllValues();
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Success,
              headerText: "Success",
              trailingText:
                stakeInput !== ""
                  ? `Stake ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} ${localStorage.getItem(
                      TOKEN_A
                    )} / ${localStorage.getItem(TOKEN_B)} PNLP`
                  : `Boost ${localStorage.getItem(TOKEN_A)}/${localStorage.getItem(
                      TOKEN_B
                    )} pool stake with # ${localStorage.getItem(SECOND_TOKEN_AMOUNT)}`,
              linkText: "View in Explorer",
              isLoading: true,
              onClick: () => {
                window.open(
                  `https://ghostnet.tzkt.io/${response.operationId ? response.operationId : ""}`,
                  "_blank"
                );
              },
              transactionId: response.operationId ? response.operationId : "",
            })
          );
        }, 6000);
        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      } else {
        setBalanceUpdate(true);
        //resetAllValues();
        setShowConfirmTransaction(false);
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Rejected,
              transactionId: "",
              headerText: "Rejected",
              trailingText:
                stakeInput !== ""
                  ? `Stake ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} ${localStorage.getItem(
                      TOKEN_A
                    )} / ${localStorage.getItem(TOKEN_B)} PNLP`
                  : `Boost ${localStorage.getItem(TOKEN_A)}/${localStorage.getItem(
                      TOKEN_B
                    )} pool stake with # ${localStorage.getItem(SECOND_TOKEN_AMOUNT)}`,
              linkText: "",
              isLoading: true,
            })
          );
        }, 2000);

        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      }
    });
  };
  const handleUnStakeOperation = () => {
    setContentTransaction(`Unstake ${Number(unStakeInput).toFixed(2)} PNLP`);
    dispatch(setIsLoadingWallet({ isLoading: true, operationSuccesful: false }));
    setShowConfirmTransaction(true);
    // setStakingScreen(StakingScreenType.Unstaking);
    setScreen("1");
    setIsAddLiquidity(false);
    localStorage.setItem(
      TOKEN_A,
      props.tokenIn.name === "tez"
        ? "TEZ"
        : props.tokenIn.name === "ctez"
        ? "CTEZ"
        : props.tokenIn.name
    );
    localStorage.setItem(
      TOKEN_B,
      props.tokenOut.name === "tez"
        ? "TEZ"
        : props.tokenOut.name === "ctez"
        ? "CTEZ"
        : props.tokenOut.name
    );
    localStorage.setItem(FIRST_TOKEN_AMOUNT, Number(unStakeInput).toFixed(2));
    unstakePnlpTokens(
      props.tokenIn.symbol,
      props.tokenOut.symbol,
      unStakeInput.toString(),
      transactionSubmitModal,
      resetAllValues,
      setShowConfirmTransaction,
      props.setActiveState,
      {
        flashType: Flashtype.Info,
        headerText: "Transaction submitted",
        trailingText: `Unstake ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} ${localStorage.getItem(
          TOKEN_A
        )} / ${localStorage.getItem(TOKEN_B)} PNLP`,
        linkText: "View in Explorer",
        isLoading: true,

        transactionId: "",
      }
    ).then((response) => {
      if (response.success) {
        setBalanceUpdate(true);
        //resetAllValues();
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Success,
              headerText: "Success",
              trailingText: `Unstake ${localStorage.getItem(
                FIRST_TOKEN_AMOUNT
              )} ${localStorage.getItem(TOKEN_A)} / ${localStorage.getItem(TOKEN_B)} PNLP`,
              linkText: "View in Explorer",
              isLoading: true,
              onClick: () => {
                window.open(
                  `https://ghostnet.tzkt.io/${response.operationId ? response.operationId : ""}`,
                  "_blank"
                );
              },
              transactionId: response.operationId ? response.operationId : "",
            })
          );
        }, 6000);
        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      } else {
        setBalanceUpdate(true);
        //resetAllValues();
        setShowConfirmTransaction(false);
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Rejected,
              transactionId: "",
              headerText: "Rejected",
              trailingText: `Unstake ${localStorage.getItem(
                FIRST_TOKEN_AMOUNT
              )} ${localStorage.getItem(TOKEN_A)} / ${localStorage.getItem(TOKEN_B)} PNLP`,
              linkText: "",
              isLoading: true,
            })
          );
        }, 2000);

        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      }
    });
  };
  const handleRewardsOperation = () => {
    setContentTransaction(`Harvest `);
    dispatch(setIsLoadingWallet({ isLoading: true, operationSuccesful: false }));
    localStorage.setItem(FIRST_TOKEN_AMOUNT, Number(rewardToken).toFixed(2));
    setShowConfirmTransaction(true);
    setScreen("1");
    harvestRewards(
      props.tokenIn.symbol,
      props.tokenOut.symbol,
      transactionSubmitModal,
      resetAllValues,
      setShowConfirmTransaction,
      {
        flashType: Flashtype.Info,
        headerText: "Transaction submitted",
        trailingText: `Claim ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} PLY `,
        linkText: "View in Explorer",
        isLoading: true,

        transactionId: "",
      }
    ).then((response) => {
      if (response.success) {
        setBalanceUpdate(true);
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Success,
              headerText: "Success",
              trailingText: `Claim ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} PLY`,
              linkText: "View in Explorer",
              isLoading: true,
              onClick: () => {
                window.open(
                  `https://ghostnet.tzkt.io/${response.operationId ? response.operationId : ""}`,
                  "_blank"
                );
              },
              transactionId: response.operationId ? response.operationId : "",
            })
          );
        }, 6000);
        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      } else {
        setBalanceUpdate(true);
        setShowConfirmTransaction(false);
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Rejected,
              transactionId: "",
              headerText: "Rejected",
              trailingText: `Claim ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} PLY`,
              linkText: "",
              isLoading: true,
            })
          );
        }, 2000);

        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      }
    });
  };
  const handleRemoveLiquidityOperation = () => {
    setContentTransaction(`Burn ${Number(burnAmount).toFixed(2)} PNLP`);
    localStorage.setItem(
      TOKEN_A,
      props.tokenIn.name === "tez"
        ? "TEZ"
        : props.tokenIn.name === "ctez"
        ? "CTEZ"
        : props.tokenIn.name
    );
    localStorage.setItem(
      TOKEN_B,
      props.tokenOut.name === "tez"
        ? "TEZ"
        : props.tokenOut.name === "ctez"
        ? "CTEZ"
        : props.tokenOut.name
    );
    localStorage.setItem(FIRST_TOKEN_AMOUNT, Number(firstTokenAmountLiq).toFixed(2));
    localStorage.setItem(SECOND_TOKEN_AMOUNT, Number(secondTokenAmountLiq).toFixed(2));
    dispatch(setIsLoadingWallet({ isLoading: true, operationSuccesful: false }));
    setShowConfirmTransaction(true);
    setScreen("1");
    removeLiquidity(
      props.tokenIn.symbol,
      props.tokenOut.symbol,
      swapData.current.lpToken as string,
      removeTokenAmount.tokenOneAmount.toString(),
      removeTokenAmount.tokenTwoAmount.toString(),
      burnAmount.toString(),
      walletAddress,
      transactionSubmitModal,
      resetAllValues,
      setShowConfirmTransaction,
      undefined,
      {
        flashType: Flashtype.Info,
        headerText: "Transaction submitted",
        trailingText: `Remove ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} ${localStorage.getItem(
          TOKEN_A
        )} and ${localStorage.getItem(SECOND_TOKEN_AMOUNT)} ${localStorage.getItem(TOKEN_B)} `,
        linkText: "View in Explorer",
        isLoading: true,
        transactionId: "",
      }
    ).then((response) => {
      if (response.success) {
        setBalanceUpdate(true);
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Success,
              headerText: "Success",
              trailingText: `Remove ${localStorage.getItem(
                FIRST_TOKEN_AMOUNT
              )} ${localStorage.getItem(TOKEN_A)} and ${localStorage.getItem(
                SECOND_TOKEN_AMOUNT
              )} ${localStorage.getItem(TOKEN_B)}`,
              linkText: "View in Explorer",
              isLoading: true,
              onClick: () => {
                window.open(
                  `https://ghostnet.tzkt.io/${response.operationId ? response.operationId : ""}`,
                  "_blank"
                );
              },
              transactionId: response.operationId ? response.operationId : "",
            })
          );
        }, 6000);
        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      } else {
        setBalanceUpdate(true);

        setShowConfirmTransaction(false);
        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Rejected,
              transactionId: "",
              headerText: "Rejected",
              trailingText: `Remove ${localStorage.getItem(
                FIRST_TOKEN_AMOUNT
              )} ${localStorage.getItem(TOKEN_A)} and ${localStorage.getItem(
                SECOND_TOKEN_AMOUNT
              )} ${localStorage.getItem(TOKEN_B)}`,
              linkText: "",
              isLoading: true,
            })
          );
        }, 2000);

        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
        setContentTransaction("");
      }
    });
  };

  return (
    <>
      <PopUpModal
        onhide={props.closeFn}
        className="w-[390px] max-w-[390px] md:w-[620px] md:max-w-[620px] rounded-none md:rounded-3xl "
        footerChild={
          <div className="flex justify-center items-center gap-2 md:gap-4 px-4 md:px-0">
            <p className="font-subtitle1 md:text-f16 text-text-150">
              {props.activeState === ActiveLiquidity.Liquidity &&
                "Add liquidity, stake, and earn PLY"}
              {props.activeState === ActiveLiquidity.Staking &&
                "Add liquidity, stake, and earn PLY"}
              {props.activeState === ActiveLiquidity.Rewards &&
                "Lock PLY, and vote to earn trading fees & bribes"}
            </p>
            <Image
              className="cursor-pointer hover:opacity-90"
              //onClick={() => setShowVideoModal(true)}
              src={playBtn}
            />
          </div>
        }
      >
        {screen === "1" && (
          <>
            <div className="flex gap-1">
              <p className="text-white">
                {props.activeState === ActiveLiquidity.Liquidity && "Manage liquidity"}
                {props.activeState === ActiveLiquidity.Staking && "Stake liquidity"}
                {props.activeState === ActiveLiquidity.Rewards && "Your positions & rewards"}
              </p>
              <p className="ml-1 relative top-[6px]">
                <InfoIconToolTip
                  message={
                    props.activeState === ActiveLiquidity.Liquidity
                      ? "Add or remove liquidity from the selected pool."
                      : props.activeState === ActiveLiquidity.Staking
                      ? "Stake your liquidity tokens to get rewarded in PLY. Optionally, attach a veNFT to your stake and boost your rewards by up to 2.5x."
                      : "View and harvest the PLY reward accrued by your stake."
                  }
                />
              </p>
            </div>
            <ManageLiquidityHeader
              className="mt-5 mb-6"
              activeStateTab={props.activeState}
              setActiveStateTab={props.setActiveState}
            />

            {props.activeState === ActiveLiquidity.Liquidity && (
              <div className="">
                <Liquidity
                  setScreen={setScreen}
                  firstTokenAmount={firstTokenAmountLiq}
                  secondTokenAmount={secondTokenAmountLiq}
                  userBalances={userBalances}
                  setSecondTokenAmount={setSecondTokenAmountLiq}
                  setFirstTokenAmount={setFirstTokenAmountLiq}
                  tokenIn={props.tokenIn}
                  tokenOut={props.tokenOut}
                  setIsAddLiquidity={setIsAddLiquidity}
                  isAddLiquidity={isAddLiquidity}
                  swapData={swapData.current}
                  pnlpBalance={pnlpBalance}
                  setBurnAmount={setBurnAmount}
                  burnAmount={burnAmount}
                  setRemoveTokenAmount={setRemoveTokenAmount}
                  removeTokenAmount={removeTokenAmount}
                  setSlippage={setSlippage}
                  slippage={slippage}
                  lpTokenPrice={lpTokenPrice}
                  isLoading={isLoading}
                />
              </div>
            )}
            {props.activeState === ActiveLiquidity.Staking && (
              <StakingScreen
                tokenIn={props.tokenIn}
                tokenOut={props.tokenOut}
                lpTokenPrice={lpTokenPrice}
                pnlpBalance={pnlpBalance}
                unStakeInput={unStakeInput}
                stakeInput={stakeInput}
                setStakeInput={setStakeInput}
                setUnStakeInput={setUnStakeInput}
                setScreen={setScreen}
                stakedToken={stakedToken}
                setStakingScreen={setStakingScreen}
                stakingScreen={stakingScreen}
                setSelectedDropDown={setSelectedDropDown}
                selectedDropDown={selectedDropDown}
                vePLYOptions={vePLYOptions}
                isListLoading={isListLoading}
              />
            )}
            {props.activeState === ActiveLiquidity.Rewards && (
              <RewardsScreen
                tokenIn={props.tokenIn}
                tokenOut={props.tokenOut}
                tokenInAmount={tokenInAmountHarvest}
                tokenOutAmount={tokenOutAmountHarvest}
                rewardToken={rewardToken}
                handleOperation={handleRewardsOperation}
              />
            )}
          </>
        )}
        {props.activeState === ActiveLiquidity.Liquidity && screen === "2" && (
          <>
            <ConfirmAddLiquidity
              setScreen={setScreen}
              firstTokenAmount={firstTokenAmountLiq}
              secondTokenAmount={secondTokenAmountLiq}
              tokenIn={props.tokenIn}
              tokenOut={props.tokenOut}
              tokenPrice={tokenPrice}
              pnlpEstimates={pnlpEstimates}
              sharePool={sharePool}
              slippage={slippage}
              handleAddLiquidityOperation={handleAddLiquidityOperation}
            />
          </>
        )}
        {props.activeState === ActiveLiquidity.Staking && screen === "2" && (
          <>
            <ConfirmStakeLiquidity
              setScreen={setScreen}
              tokenIn={props.tokenIn}
              tokenOut={props.tokenOut}
              stakeInput={stakeInput}
              handleOperation={handleStakeOperation}
              setSelectedDropDown={setSelectedDropDown}
              selectedDropDown={selectedDropDown}
              vePLYOptions={vePLYOptions}
            />
          </>
        )}
        {props.activeState === ActiveLiquidity.Staking && screen === "3" && (
          <>
            <ConfirmUnStakeLiquidity
              setScreen={setScreen}
              tokenIn={props.tokenIn}
              tokenOut={props.tokenOut}
              unStakeInput={unStakeInput}
              handleOperation={handleUnStakeOperation}
            />
          </>
        )}
        {props.activeState === ActiveLiquidity.Liquidity && screen === "3" && (
          <>
            <ConfirmRemoveLiquidity
              setScreen={setScreen}
              tokenIn={props.tokenIn}
              tokenOut={props.tokenOut}
              tokenPrice={tokenPrice}
              burnAmount={burnAmount}
              pnlpEstimates={pnlpEstimates}
              sharePool={sharePool}
              handleRemoveLiquidityOperation={handleRemoveLiquidityOperation}
              removeTokenAmount={removeTokenAmount}
            />
          </>
        )}
      </PopUpModal>
      {showVideoModal && <VideoModal closefn={setShowVideoModal} linkString={"Bh5zuEI4M9o"} />}
      {showConfirmTransaction && (
        <ConfirmTransaction
          show={showConfirmTransaction}
          setShow={setShowConfirmTransaction}
          content={contentTransaction}
        />
      )}
      {showTransactionSubmitModal && (
        <TransactionSubmitted
          show={showTransactionSubmitModal}
          setShow={setShowTransactionSubmitModal}
          onBtnClick={
            transactionId
              ? () => window.open(`https://ghostnet.tzkt.io/${transactionId}`, "_blank")
              : null
          }
          content={contentTransaction}
        />
      )}
    </>
  );
}