import Image from "next/image";
import * as React from "react";
import loadingLogo from "../../assets/icon/common/loadingLogo.svg";
import settingLogo from "../../assets/icon/common/settingLogo.svg";
import walletIcon from "../../assets/icon/common/walletIcon.svg";
import copy from "copy-to-clipboard";
import truncateMiddle from "truncate-middle";
import copyLogo from "../../assets/icon/common/copyLogo.svg";

import switchLogo from "../../assets/icon/navigation/copy.svg";
import fiatLogo from "../../assets/icon/common/fiatLogo.svg";
import nodeSelectorLogo from "../../assets/icon/common/nodeSelectorLogo.svg";
import disconnectLogo from "../../assets/icon/common/disconnectLogo.svg";
import { useAppDispatch, useAppSelector } from "../../redux/index";
import { switchWallet, walletConnection, walletDisconnection } from "../../redux/wallet/wallet";
import { useOutsideClick } from "../../utils/outSideClickHook";
import { useRouter } from "next/router";
import Link from "next/link";
import WertWidgetPopup from "../Wert";
import { Position, ToolTip, TooltipType } from "../Tooltip/TooltipAdvanced";
import close from "../../assets/icon/swap/closeIcon.svg";
import ReactTooltip from "react-tooltip";
import { BUY_CRYPTO } from "../../constants/localStorage";

export interface IConnectWalletBtnDeskTopProps {
  setNodeSelector: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ConnectWalletBtnDeskTop(props: IConnectWalletBtnDeskTopProps) {
  const userAddress = useAppSelector((state) => state.wallet.address);
  const isConnectWalletLoading = useAppSelector((state) => state.walletLoading.isLoading);
  const router = useRouter();

  const dispatch = useAppDispatch();
  const reff = React.useRef(null);
  const connectTempleWallet = () => {
    return dispatch(walletConnection());
  };
  const disconnectUserWallet = async () => {
    setShowMenu(false);
    if (userAddress) {
      return dispatch(walletDisconnection());
    }
  };
  const switchWalletFunction = async () => {
    setShowMenu(false);
    if (userAddress) {
      return dispatch(switchWallet());
    }
  };
  const [showMenu, setShowMenu] = React.useState(false);
  useOutsideClick(reff, () => {
    setShowMenu(false);
  });
  const [showFiat, setShowFiat] = React.useState(false);
  const handleFiat = () => {
    setShowMenu(false);
    setShowFiat(true);
  };
  React.useEffect(() => {
    setTimeout(() => {
      userAddress !== "" && localStorage.setItem(BUY_CRYPTO, "true");
    }, 80000);
  }, []);
  const [showCryptoTooltip, setShowCryptoTooltip] = React.useState(
    localStorage.getItem(BUY_CRYPTO)
  );

  const handleClick = () => {
    setShowCryptoTooltip("true");
    localStorage.setItem(BUY_CRYPTO, "true");
  };
  if (userAddress) {
    return (
      <>
        <div className="relative flex items-center" ref={reff}>
          <button
            onClick={() => {
              handleClick();
              setShowMenu((sow) => !sow);
            }}
            className="flex flex-row justify-center items-center gap-2 bg-primary-500/10 py-2 px-4 hover:bg-opacity-95 rounded-2xl border border-primary-500/30"
          >
            <Image alt={"alt"} src={walletIcon} />
            <p
              className="text-f14 "
              style={{
                textOverflow: "ellipsis",
                width: "76px",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {truncateMiddle(userAddress, 4, 4, "...")}
            </p>
            {isConnectWalletLoading && <Image alt={"alt"} src={loadingLogo} className="spin" />}
            <Image alt={"alt"} src={settingLogo} />
          </button>
          {(localStorage.getItem(BUY_CRYPTO) !== "true" || showCryptoTooltip !== "true") && (
            <div className="w-[310px] absolute top-[61px] cryptoTooltip">
              <div className="flex mr-1">
                <div className="text-white font-subtitle4">Buy crypto</div>
                <div className="ml-auto cursor-pointer relative -top-[3px] " onClick={handleClick}>
                  <Image src={close} alt="close" width="13px" height="13px" />
                </div>
              </div>
              <div className="font-body1 text-white mt-2 ">
                Get tokens at the best price in web3 on plenty.network, with credit card or apple
                pay.
              </div>
            </div>
          )}

          {showMenu && (
            <div className="absolute w-[320px] fade-in-3  right-0 top-[55px] mt-2 border z-50 bg-primary-750 rounded-2xl border-muted-50 py-3.5 flex flex-col">
              {/* <p className="bg-primary-755 text-f14 p-4 flex gap-2">
                <span className="text-text-400">Temple wallet</span>(
                <span className="text-text-50">{truncateMiddle(userAddress, 4, 4, "...")}</span>)
              </p> */}
              <p
                className="flex gap-2 px-4  py-4 hover:bg-primary-755  cursor-pointer text-white text-f14"
                onClick={() => copy(userAddress)}
              >
                <Image alt={"alt"} src={copyLogo} />
                <span>Copy address</span>
              </p>
              <p
                className="flex gap-2 px-4  py-4 hover:bg-primary-755  cursor-pointer text-white text-f14"
                onClick={handleFiat}
              >
                <Image alt={"alt"} src={fiatLogo} />
                <span>Fiat</span>
              </p>
              <p
                className="flex gap-2 px-4  py-4 hover:bg-primary-755  cursor-pointer text-white text-f14"
                onClick={switchWalletFunction}
              >
                <Image alt={"alt"} src={switchLogo} />
                <span>Switch account</span>
              </p>

              <p
                className="flex gap-2 px-4  py-4 hover:bg-primary-755  cursor-pointer text-white text-f14"
                onClick={() => props.setNodeSelector(true)}
              >
                <Image alt={"alt"} src={nodeSelectorLogo} />
                <span>Node Selector</span>
              </p>
              <p>
                {router.pathname.includes("myportfolio") ? (
                  <Link className={``} href={"/swap"}>
                    <p
                      onClick={disconnectUserWallet}
                      className="flex gap-2 px-4  py-4 hover:bg-primary-755  cursor-pointer text-white text-f14"
                    >
                      <Image alt={"alt"} src={disconnectLogo} />
                      <span>Disconnect</span>
                    </p>
                  </Link>
                ) : (
                  <p
                    onClick={disconnectUserWallet}
                    className="flex gap-2 px-4  py-4 hover:bg-primary-755  cursor-pointer text-white text-f14"
                  >
                    <Image alt={"alt"} src={disconnectLogo} />
                    <span>Disconnect</span>
                  </p>
                )}
              </p>
            </div>
          )}
        </div>
        {showFiat && <WertWidgetPopup hide={setShowFiat} />}
      </>
    );
  }
  return (
    <div className="flex items-center">
      <button
        onClick={connectTempleWallet}
        className="bg-primary-500/5 py-2 px-4 hover:bg-opacity-95 rounded-2xl border border-primary-500/100  text-f14 "
      >
        Connect wallet
      </button>
      {(localStorage.getItem(BUY_CRYPTO) !== "true" || showCryptoTooltip !== "true") && (
        <div className="w-[310px] absolute top-[61px] cryptoTooltip">
          <div className="flex mr-1">
            <div className="text-white font-subtitle4">Buy crypto</div>
            <div className="ml-auto cursor-pointer relative -top-[3px] " onClick={handleClick}>
              <Image src={close} alt="close" width="13px" height="13px" />
            </div>
          </div>
          <div className="font-body1 text-white mt-2 ">
            Get tokens at the best price in web3 on plenty.network, with credit card or apple pay.
          </div>
        </div>
      )}
    </div>
  );
}
