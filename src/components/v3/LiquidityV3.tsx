import Image from "next/image";
import * as React from "react";
import settings from "../../../src/assets/icon/swap/settings.svg";
import { useMemo, useRef, useState } from "react";
import TransactionSettingsLiquidity from "../TransactionSettings/TransactionSettingsLiq";
import infoOrangeBig from "../../assets/icon/poolsv3/infoOrangeBig.svg";
import infoblue from "../../../src/assets/icon/pools/InfoBlue.svg";
import info from "../../../src/assets/icon/swap/info.svg";
import { BigNumber } from "bignumber.js";
import Button from "../Button/Button";
import { SwitchWithIcon } from "../SwitchCheckbox/switchWithIcon";

import wallet from "../../../src/assets/icon/pools/wallet.svg";
import { AppDispatch, useAppSelector } from "../../redux";

import { ISwapData, tokenParameterLiquidity } from "../Liquidity/types";
import AddLiquidityV3 from "./AddliquidityV3";
import FeeTierMain from "./FeeTierMain";

interface ILiquidityProps {
  userBalances: {
    [key: string]: string;
  };
  firstTokenAmount: string | number;
  secondTokenAmount: string | number;
  setFirstTokenAmount: React.Dispatch<React.SetStateAction<string | number>>;
  setSecondTokenAmount: React.Dispatch<React.SetStateAction<string | number>>;
  inputRef?: any;
  value?: string | "";
  onChange?: any;
  tokenIn: tokenParameterLiquidity;
  tokenOut: tokenParameterLiquidity;

  setScreen: React.Dispatch<React.SetStateAction<string>>;
  setIsAddLiquidity: React.Dispatch<React.SetStateAction<boolean>>;
  isAddLiquidity: boolean;
  swapData: ISwapData;
  pnlpBalance: string;

  setSlippage: React.Dispatch<React.SetStateAction<string>>;
  slippage: string;
  lpTokenPrice: BigNumber;
  feeTier: string;
  isLoading: boolean;
}
function LiquidityV3(props: ILiquidityProps) {
  const tokenPrice = useAppSelector((state) => state.tokenPrice.tokenPrice);
  const walletAddress = useAppSelector((state) => state.wallet.address);
  const [settingsShow, setSettingsShow] = useState(false);
  const refSettingTab = useRef(null);
  const [selectedFeeTier, setSelectedFeeTier] = useState("0.05");
  const handleRemoveLiquidity = () => {
    props.setScreen("3");
  };

  return (
    <>
      <div className=" w-[546px] rounded-2xl border-text-800 px-[10px] md:px-3.5  pb-4  ">
        <FeeTierMain
          setSelectedFeeTier={setSelectedFeeTier}
          selectedFeeTier={selectedFeeTier}
          feeTier={props.feeTier}
        />

        <AddLiquidityV3
          tokenIn={props.tokenIn}
          tokenOut={props.tokenOut}
          firstTokenAmount={props.firstTokenAmount}
          secondTokenAmount={props.secondTokenAmount}
          userBalances={props.userBalances}
          setSecondTokenAmount={props.setSecondTokenAmount}
          setFirstTokenAmount={props.setFirstTokenAmount}
          swapData={props.swapData}
          tokenPrice={tokenPrice}
        />
        {props.feeTier !== selectedFeeTier && (
          <div className="h-[56px] mt-[10px] flex items-center  px-2 bg-error-300/[0.1]  rounded-lg	">
            <Image src={infoOrangeBig} />
            <span className="ml-3 text-error-300 text-[13px] leading-[20px] ">
              Your position will not earn fees or be used in trades until the market price moves
              into your range.
            </span>
          </div>
        )}
      </div>
    </>
  );
}

export default LiquidityV3;
