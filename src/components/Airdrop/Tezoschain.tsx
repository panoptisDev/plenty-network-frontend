import { AppDispatch, useAppSelector } from "../../redux";
import Button from "../Button/Button";
import clsx from "clsx";
import { useState, useMemo } from "react";
import { ChainAirdrop } from "./Disclaimer";
import Progress from "./Progress";
import Steps from "./Steps";
import { useDispatch } from "react-redux";
import { walletConnection } from "../../redux/wallet/wallet";
import { FIRST_TOKEN_AMOUNT, TOKEN_A } from "../../constants/localStorage";
import { setIsLoadingWallet } from "../../redux/walletLoading";
import { claimAirdrop } from "../../operations/airdrop";
import { Flashtype } from "../FlashScreen";
import { setFlashMessage } from "../../redux/flashMessage";
import ConfirmTransaction from "../ConfirmTransaction";
import TransactionSubmitted from "../TransactionSubmitted";
import { useAirdropClaimData } from "../../hooks/useAirdropClaimData";
export interface ITezosChain {
  setChain: React.Dispatch<React.SetStateAction<ChainAirdrop>>;
}

function TezosChain(props: ITezosChain) {
  const userAddress = useAppSelector((state) => state.wallet.address);
  const tweetedAccounts = useAppSelector((state) => state.airdropTransactions.tweetedAccounts);
  const dispatch = useDispatch<AppDispatch>();
  const connectTempleWallet = () => {
    return dispatch(walletConnection());
  };
  const [showTransactionSubmitModal, setShowTransactionSubmitModal] = useState(false);
  const [showConfirmTransaction, setShowConfirmTransaction] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const res = useAirdropClaimData();

  const transactionSubmitModal = (id: string) => {
    setTransactionId(id);
    setShowTransactionSubmitModal(true);
  };
  const handleAirdropOperation = () => {
    localStorage.setItem(
      FIRST_TOKEN_AMOUNT,

      tweetedAccounts.includes(userAddress)
        ? res.airdropClaimData.pendingClaimableAmount.toFixed(2)
        : res.airdropClaimData.pendingClaimableAmount
            .minus(res.airdropClaimData.perMissionAmount)
            .toFixed(2)
    );
    setShowConfirmTransaction(true);
    dispatch(setIsLoadingWallet({ isLoading: true, operationSuccesful: false }));

    claimAirdrop(
      res.airdropClaimData.claimData,
      tweetedAccounts.includes(userAddress),
      transactionSubmitModal,
      undefined,
      setShowConfirmTransaction,
      {
        flashType: Flashtype.Info,
        headerText: "Transaction submitted",
        trailingText: `Claim airdrop ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} PLY`,
        linkText: "View in Explorer",
        isLoading: true,
        transactionId: "",
      }
    ).then((response) => {
      if (response.success) {
        setTimeout(() => {
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Success,
              headerText: "Success",
              trailingText: `Claim airdrop ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} PLY`,
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

        setTimeout(() => {
          setShowTransactionSubmitModal(false);
        }, 2000);

        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
      } else {
        setShowConfirmTransaction(false);

        setTimeout(() => {
          setShowTransactionSubmitModal(false);
          dispatch(
            setFlashMessage({
              flashType: Flashtype.Rejected,
              transactionId: "",
              headerText: "Rejected",
              trailingText: `claim airdrop ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} PLY`,
              linkText: "",
              isLoading: true,
            })
          );
        }, 2000);

        dispatch(setIsLoadingWallet({ isLoading: false, operationSuccesful: true }));
      }
    });
  };
  const ClaimButton = useMemo(() => {
    if (userAddress) {
      if (res.fetching) {
        return (
          <Button color="disabled" width="w-full">
            Fetching data...
          </Button>
        );
      } else if (res.airdropClaimData.eligible && res.airdropClaimData.success) {
        if (
          res.airdropClaimData.pendingClaimableAmount.isGreaterThan(0) &&
          tweetedAccounts.includes(userAddress)
        ) {
          return (
            <button
              className={clsx(
                "bg-primary-500 h-13 text-black w-full rounded-2xl font-title3-bold cursor-pointer"
              )}
              onClick={handleAirdropOperation}
            >
              Claim {res.airdropClaimData.pendingClaimableAmount.toFixed(2)} PLY
            </button>
          );
        } else if (
          res.airdropClaimData.pendingClaimableAmount
            .minus(res.airdropClaimData.perMissionAmount)
            .isGreaterThan(0) &&
          !tweetedAccounts.includes(userAddress)
        ) {
          return (
            <button
              className={clsx(
                "bg-primary-500 text-black  h-13  w-full rounded-2xl font-title3-bold cursor-pointer"
              )}
              onClick={handleAirdropOperation}
            >
              Claim{" "}
              {res.airdropClaimData.pendingClaimableAmount
                .minus(res.airdropClaimData.perMissionAmount)
                .toFixed(2)}{" "}
              PLY
            </button>
          );
        } else if (res.airdropClaimData.pendingClaimableAmount.isEqualTo(0)) {
          return (
            <button
              className={clsx(
                "bg-primary-600 text-text-600 h-13  w-full rounded-2xl font-title3-bold"
              )}
            >
              All claimed
            </button>
          );
        } else if (
          res.airdropClaimData.pendingClaimableAmount
            .minus(res.airdropClaimData.perMissionAmount)
            .isEqualTo(0) &&
          !tweetedAccounts.includes(userAddress)
        ) {
          return (
            <button
              className={clsx(
                "bg-primary-600 text-text-600 h-13  w-full rounded-2xl font-title3-bold cursor-pointer"
              )}
            >
              Claim
            </button>
          );
        }
      } else if (
        res.airdropClaimData.eligible === false ||
        res.airdropClaimData.success === false
      ) {
        if (res.airdropClaimData.message === "GET_TEZ_FOR_FEES") {
          return (
            <Button
              color="primary"
              onClick={() => window.open("https://tezos.com/tez/#buy-tez", "_blank")}
              width="w-full"
            >
              Get some XTZ for fees
            </Button>
          );
        } else {
          return (
            <Button color="disabled" width="w-full">
              Not eligible
            </Button>
          );
        }
      }
    } else {
      return (
        <Button color="primary" onClick={connectTempleWallet} width="w-full">
          Connect wallet
        </Button>
      );
    }
  }, [props, userAddress, res, tweetedAccounts]);

  return (
    <>
      <div className="mt-3 border border-muted-300 bg-muted-400 rounded-xl py-5">
        <Progress
          res={res.airdropClaimData}
          claimData={res.airdropClaimData.claimData}
          fetching={res.fetching}
        />
        <div className="border-t border-text-800 my-3"></div>
        <Steps claimData={res.airdropClaimData} fetching={res.fetching} />
      </div>
      <div className="mt-[18px]">{ClaimButton}</div>
      {showConfirmTransaction && (
        <ConfirmTransaction
          show={showConfirmTransaction}
          setShow={setShowConfirmTransaction}
          content={`claim airdrop ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} PLY`}
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
          content={`claim airdrop ${localStorage.getItem(FIRST_TOKEN_AMOUNT)} PLY`}
        />
      )}
    </>
  );
}

export default TezosChain;