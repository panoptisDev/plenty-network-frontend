import { PopUpModal } from "../Modal/popupModal";
import React, { useState, useMemo } from "react";
import lockPurple from "../../../src/assets/icon/vote/lockPurple.svg";

import Image from "next/image";

import arrowLeft from "../../../src/assets/icon/pools/arrowLeft.svg";

import info from "../../../src/assets/icon/common/infoIcon.svg";
import Button from "../Button/Button";
import { IConfirmLockingProps } from "./types";
import { store } from "../../redux";

function ConfirmLocking(props: IConfirmLockingProps) {
  const epochData = store.getState().epoch.currentEpoch;
  const closeModal = () => {
    props.setShow(false);
  };
  const dateFormat = useMemo(() => {
    var date = new Date(epochData.endTimestamp);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Decr",
    ];

    return `${date.getUTCDate()}/${
      monthNames[date.getUTCMonth()]
    }/${date.getUTCFullYear()}, ${date.getUTCHours()}:${date.getUTCMinutes()}`;
  }, [epochData.endTimestamp]);

  return (
    <>
      <div className="flex">
        <div className="cursor-pointer" onClick={() => props.setScreen("1")}>
          <Image src={arrowLeft} />
        </div>
        <div className="mx-2 text-white font-title3">Confirm locking </div>
      </div>
      <div className="rounded-lg mt-5 border border-text-800 bg-card-200 py-5">
        <div className="text-text-250 font-subtitle1 md:font-subtitle3 px-3 md:px-5">
          Your will receive a veNFT with a voting power of{" "}
        </div>
        <div className="mt-1 font-title2 text-white px-3 md:px-5">2500</div>
        <div className="border-t mt-5 border-text-800/[0.5]"></div>
        <div className="mt-3 px-3 md:px-5 flex items-center">
          <span className="hidden md:block flex">
            <span className="text-text-250 font-body2 mr-1">You can claim your rewards after</span>
            <span className="relative top-0.5">
              <Image src={info} />
            </span>
            <span className="text-white ml-1 font-subtitle2 ">{dateFormat} UTC</span>
          </span>
          <span className="block md:hidden">
            <div className="text-text-250 font-body2 mr-1">You can start voting after </div>
            <div>
              <span className="relative top-0.5">
                <Image src={info} />
              </span>
              <span className="text-white ml-1 font-subtitle2 block">28/07/2021, 12 AM UTC</span>
            </div>
          </span>
          <span className="ml-auto flex rounded-lg bg-primary-500/[0.2] h-[32px] items-center px-3">
            <Image src={lockPurple} />
            <span className="font-subtitle2 text-primary-500 ml-1">21/07/2024</span>
          </span>
        </div>
      </div>

      <div className="mt-[18px]">
        <Button color="primary" onClick={props.handleLockOperation}>
          Create lock
        </Button>
      </div>
    </>
  );
}

export default ConfirmLocking;
