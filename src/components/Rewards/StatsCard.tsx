import clsx from "clsx";
import Image from "next/image";
import { IStatsCardProps } from "./types";
import info from "../../assets/icon/common/infoIcon.svg";

import claim from "../../assets/icon/myPortfolio/claim.svg";
import Button from "../Button/Button";

function StatsCard(props: IStatsCardProps) {
  return (
    <>
      <div
        className={clsx(
          "h-[96px] py-4 px-4 w-[277px] border border-text-800/[0.5] flex bg-primary-150 rounded-xl"
        )}
      >
        <p>
          <div className="flex gap-1 ">
            <Image src={info} />
            <p className="text-white font-body1 ">{props.title}</p>
          </div>
          <div className="font-input-text1 text-white mt-2">
            {props.value}{" "}
            {props.subValue && (
              <span className="font-subtitle5 text-border-400">{props.subValue}</span>
            )}
          </div>
        </p>
        <p className="ml-auto">
          <div className="flex items-center md:font-title3-bold font-subtitle4 text-primary-500  h-[50px] px-5 bg-primary-500/[0.1] rounded-xl   justify-center">
            Claim
          </div>
        </p>
      </div>
    </>
  );
}

export default StatsCard;
