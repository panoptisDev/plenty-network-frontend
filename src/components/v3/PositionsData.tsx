import Image from "next/image";
import * as React from "react";
import { useEffect, useState } from "react";

import info from "../../../src/assets/icon/common/infoIcon.svg";
import { Position, ToolTip } from "../Tooltip/TooltipAdvanced";

import infoOrange from "../../../src/assets/icon/poolsv3/infoOrange.svg";
import infoGreen from "../../../src/assets/icon/poolsv3/infoGreen.svg";
import clsx from "clsx";
import { tokenParameterLiquidity } from "../Liquidity/types";
import { nFormatterWithLesserNumber, tEZorCTEZtoUppercase } from "../../api/util/helpers";
import { ActivePopUp } from "./ManageTabV3";
import { getPositions } from "../../api/v3/positions";
import { useAppDispatch, useAppSelector } from "../../redux";
import { IV3PositionObject } from "../../api/v3/types";
import { setSelectedPosition } from "../../redux/poolsv3";

interface IPositionsProps {
  tokenIn: tokenParameterLiquidity;
  handleCollectFeeOperation: () => void;
  tokenOut: tokenParameterLiquidity;
  feeTier: string;
  setScreen: React.Dispatch<React.SetStateAction<ActivePopUp>>;
}
function PositionsData(props: IPositionsProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const tokenPrice = useAppSelector((state) => state.tokenPrice.tokenPrice);
  const walletAddress = useAppSelector((state) => state.wallet.address);
  const [data, setData] = useState<IV3PositionObject[] | undefined>([]);

  useEffect(() => {
    if (
      Object.keys(tokenPrice).length !== 0 &&
      Object.prototype.hasOwnProperty.call(props.tokenIn, "symbol") &&
      Object.prototype.hasOwnProperty.call(props.tokenOut, "symbol") &&
      walletAddress
    ) {
      setIsLoading(true);
      getPositions(
        props.tokenIn.symbol,
        props.tokenOut.symbol,
        props.feeTier,
        walletAddress,
        tokenPrice
      ).then((res) => {
        setData(res);
        setIsLoading(false);
      });
      if (walletAddress === null) {
        setIsLoading(false);
      }
    }
  }, [props.tokenIn.symbol, props.tokenOut.symbol, Object.keys(tokenPrice).length, walletAddress]);
  return (
    <div className="overflow-x-auto md:overflow-x-hidden ">
      <div className="flex fade-in-light my-[24px] ml-8 min-w-[724px] ">
        <div className="w-[125px] text-text-250 font-body2 flex">
          Liquidity
          <div className="relative top-[2px] ml-1 cursor-pointer">
            <ToolTip
              id="tooltip2"
              disable={false}
              position={Position.top}
              toolTipChild={
                <div className="w-[100px] md:w-[150px]">Total value locked in the position</div>
              }
            >
              <Image alt={"alt"} src={info} />
            </ToolTip>
          </div>
        </div>
        <div className="lg:w-[176px] w-[135px] text-text-250 font-body2 flex">
          Min/Max price
          <div className="relative top-[2px] ml-1 cursor-pointer">
            <ToolTip
              id="tooltip2"
              disable={false}
              position={Position.top}
              toolTipChild={
                <div className="w-[100px] md:w-[150px]">
                  Lower and upper price boundaries of the position
                </div>
              }
            >
              <Image alt={"alt"} src={info} />
            </ToolTip>
          </div>
        </div>
        <div className="w-[122px] text-text-250 font-body2 flex">
          Fees collected
          <div className="relative top-[2px] ml-1 cursor-pointer">
            <ToolTip
              id="tooltip2"
              disable={false}
              position={Position.top}
              toolTipChild={
                <div className="w-[100px] md:w-[150px]">Fees accrued by the position</div>
              }
            >
              <Image alt={"alt"} src={info} />
            </ToolTip>
          </div>
        </div>
      </div>

      <div className="h-[300px] overflow-y-auto swap min-w-[724px] ">
        {walletAddress === null ? (
          <span className="fade-in-light flex items-center justify-center h-[280px] text-border-600 font-title3">
            please connect your wallet
          </span>
        ) : !isLoading && data ? (
          data?.length === 0 ? (
            <span className="fade-in-light flex items-center justify-center h-[280px] text-border-600 font-title3">
              No new positions
            </span>
          ) : (
            data.map((d, index) => {
              return (
                <div
                  key={index}
                  className={clsx(
                    index % 2 === 0 ? "bg-secondary-600" : "bg-card-500",
                    "flex   h-[64px] items-center pl-10 min-w-[724px] fade-in-light"
                  )}
                >
                  <div className="w-[125px] text-white font-subtitle3 flex">
                    {" "}
                    <ToolTip
                      id="tooltipj"
                      position={Position.top}
                      toolTipChild={
                        <>
                          {" "}
                          <div
                            className="text-text-500 text-f14 font-normal flex gap-1 mt-1 justify-end "
                            key={index}
                          >
                            <div className={`text-white font-medium pr-1 `}>
                              {nFormatterWithLesserNumber(d.liquidity.x)}
                            </div>
                            <div className="">{props.tokenIn.name}</div>
                          </div>
                          <div
                            className="text-text-500 text-f14 font-normal flex gap-1 mt-1 justify-end "
                            key={index}
                          >
                            <div className={`text-white font-medium pr-1 `}>
                              {nFormatterWithLesserNumber(d.liquidity.y)}
                            </div>
                            <div className="">{props.tokenOut.name}</div>
                          </div>
                        </>
                      }
                    >
                      ${nFormatterWithLesserNumber(d.liquidityDollar)}{" "}
                    </ToolTip>
                  </div>

                  <div className="lg:w-[176px] w-[155px] text-text-50 font-subtitle4 ">
                    {nFormatterWithLesserNumber(d.minPrice)} /{" "}
                    {d.isMaxPriceInfinity ? "∞" : nFormatterWithLesserNumber(d.maxPrice)}
                    <div className="font-body3 text-text-500">
                      {tEZorCTEZtoUppercase(props.tokenOut.symbol)} per{" "}
                      {tEZorCTEZtoUppercase(props.tokenIn.symbol)}
                    </div>
                  </div>
                  <div className="w-[122px] text-white font-subtitle3 flex">
                    ${nFormatterWithLesserNumber(d.feesDollar)}
                  </div>
                  <div className="lg:w-[180px] w-[135px]">
                    {!d.isInRange ? (
                      <span className="w-fit h-[28px] px-3 flex items-center font-caption2 gap-1 rounded-lg	 text-error-300 bg-error-300/[0.1] ">
                        <Image src={infoOrange} />
                        Out of range
                      </span>
                    ) : (
                      <div className="w-fit h-[28px] px-3 flex items-center font-caption2 gap-1  rounded-lg	text-success-500 bg-success-500/[0.1]">
                        <Image src={infoGreen} />
                        In Range
                      </div>
                    )}
                  </div>
                  <div
                    className={clsx(
                      d.feesDollar.isEqualTo(0) ? "cursor-not-allowed" : "cursor-pointer",
                      "w-[120px] flex items-center font-subtitle4 text-primary-500 "
                    )}
                    onClick={d.feesDollar.isEqualTo(0) ? () => {} : props.handleCollectFeeOperation}
                  >
                    Collect fees
                    <span className=" h-[28px] border-r border-card-700 ml-auto"></span>
                  </div>
                  <div
                    className=" font-subtitle4 text-primary-500 text-right pr-2 w-[110px] cursor-pointer"
                    onClick={() => {
                      dispatch(setSelectedPosition(d));
                      props.setScreen(ActivePopUp.ManageExisting);
                    }}
                  >
                    Manage
                  </div>
                </div>
              );
            })
          )
        ) : (
          Array(4)
            .fill(1)
            .map((_, i) => (
              <div
                key={`simmerEffect_${i}`}
                className={` border border-borderCommon h-16 bg-secondary-600 flex px-5 mx-3 py-3 items-center justify-between rounded-lg animate-pulse-table mt-2`}
              ></div>
            ))
        )}{" "}
      </div>
    </div>
  );
}

export default PositionsData;
