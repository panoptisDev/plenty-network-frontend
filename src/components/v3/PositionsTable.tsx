import Image from "next/image";
import * as React from "react";

import { useMemo, useRef, useState } from "react";

import { Position, ToolTip } from "../Tooltip/TooltipAdvanced";

import info from "../../../src/assets/icon/common/infoIcon.svg";
import PositionsData from "./PositionsData";

interface IPositionsProps {}
function PositionsTable(props: IPositionsProps) {
  return (
    <>
      <div className="flex  my-[24px] ml-10 ">
        <div className="w-[152px] text-text-250 font-body2 flex">
          Liquidity
          <div className="relative top-[2px] ml-1 cursor-pointer">
            <ToolTip
              id="tooltip2"
              disable={false}
              position={Position.top}
              toolTipChild={<div className="w-[100px] md:w-[150px]">Instructions for airdrop</div>}
            >
              <Image alt={"alt"} src={info} />
            </ToolTip>
          </div>
        </div>
        <div className="w-[152px] text-text-250 font-body2 flex">
          Min price
          <div className="relative top-[2px] ml-1 cursor-pointer">
            <ToolTip
              id="tooltip2"
              disable={false}
              position={Position.top}
              toolTipChild={<div className="w-[100px] md:w-[150px]">Instructions for airdrop</div>}
            >
              <Image alt={"alt"} src={info} />
            </ToolTip>
          </div>
        </div>
        <div className="w-[152px] text-text-250 font-body2 flex">
          Max price
          <div className="relative top-[2px] ml-1 cursor-pointer">
            <ToolTip
              id="tooltip2"
              disable={false}
              position={Position.top}
              toolTipChild={<div className="w-[100px] md:w-[150px]">Instructions for airdrop</div>}
            >
              <Image alt={"alt"} src={info} />
            </ToolTip>
          </div>
        </div>
      </div>
      <PositionsData />
    </>
  );
}

export default PositionsTable;
