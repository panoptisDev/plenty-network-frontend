import Image from "next/image";
import * as React from "react";
import clsx from "clsx";

import lighting from "../../assets/icon/vote/lighting.svg";
import arrow from "../../assets/icon/vote/arrowNFT.svg";
import { useOutsideClick } from "../../utils/outSideClickHook";
import { IVeNFTData } from "../../api/votes/types";
import { useDispatch } from "react-redux";
import { AppDispatch, store } from "../../redux";
import { setisMyportfolio, setSelectedDropDown } from "../../redux/veNFT";

export interface IDropdownProps {
  Options: IVeNFTData[];
  onClick: Function;
  title: string;
  className?: string;
  isConfirmStake?: boolean;
}

export function VeNFT(props: IDropdownProps) {
  const selectedDropDown = store.getState().veNFT.selectedDropDown;
  const [isDropDownActive, setIsDropDownActive] = React.useState(false);
  const reff = React.useRef(null);
  useOutsideClick(reff, () => {
    setIsDropDownActive(false);
  });
  return (
    <div
      className={`relative w-[150px] md:min-w-[200px] md:w-[170px] ${props.className}`}
      ref={reff}
    >
      <div
        className={clsx(
          "bg-text-800/[0.25]   flex gap-1 md:gap-2 md:gap-4 py-3 md:py-2 px-2 md:px-3 justify-between border hover:border-text-700 rounded-lg",
          props.Options.length === 0
            ? "border-border-200 bg-card-200 hover:bg-card-200 hover:border-border-200"
            : isDropDownActive
            ? "border-muted-50 bg-muted-500 hover:border-muted-50 hover:bg-muted-500"
            : selectedDropDown.votingPower === ""
            ? "border-[0.8px] border-primary-500 bg-card-500 text-text-400"
            : "border-text-800 bg-text-800/[0.25]",

          props.Options.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
        )}
        {...(props.Options.length === 0
          ? {}
          : { onClick: () => setIsDropDownActive(!isDropDownActive) })}
      >
        <p
          className={clsx(
            " flex gap-1",
            isDropDownActive && "text-text-500",

            props.Options.length === 0
              ? "text-text-700"
              : selectedDropDown.votingPower === ""
              ? "text-text-600"
              : "text-text-500"
          )}
        >
          {selectedDropDown.votingPower !== "" && selectedDropDown.tokenId !== "" ? (
            <>
              <Image src={lighting} />
              <span className="ml-1 font-body4 text-white">
                {Number(selectedDropDown.votingPower) > 0
                  ? Number(selectedDropDown.votingPower) < 0.001
                    ? `<0.001`
                    : Number(selectedDropDown.votingPower).toFixed(3)
                  : "0"}
              </span>
              <span className="font-body3 text-text-500">(#{selectedDropDown.tokenId})</span>
            </>
          ) : (
            <>
              <span className={clsx("hidden md:block  md:font-body4")}>{props.title}</span>{" "}
              <span className="block md:hidden font-subtitle1 md:font-body4">
                Select your veNFT
              </span>
            </>
          )}
        </p>
        <Image
          src={arrow}
          width={"18px"}
          height={"18px"}
          className={!isDropDownActive ? "rotate-0" : "rotate-180"}
        />
      </div>
      {isDropDownActive && props.Options.length > 0 && (
        <div
          className={clsx(
            "absolute  max-h-[210px] overflow-y-auto z-20 w-[150px] min-w-[180px] md:w-[200px] mt-2 py-2 w-full bg-card-500 border-border-500 border rounded-lg flex flex-col gap-1"
          )}
        >
          {props.Options.map((text, i) => (
            <Options
              onClick={props.onClick}
              key={`${text.tokenId}_${i}`}
              votingPower={text.votingPower.toString()}
              tokenId={text.tokenId.toString()}
            />
          ))}
        </div>
      )}
    </div>
  );

  function Options(props: { onClick: Function; votingPower: string; tokenId: string }) {
    const dispatch = useDispatch<AppDispatch>();
    return (
      <div
        onClick={() => {
          dispatch(
            setSelectedDropDown({
              votingPower: props.votingPower,
              tokenId: props.tokenId,
            })
          );
          dispatch(setisMyportfolio(false));
          props.onClick({
            votingPower: props.votingPower,
            tokenId: props.tokenId,
          });
          setIsDropDownActive(false);
        }}
        className="  hover:bg-muted-500 px-4 flex items-center h-[36px] cursor-pointer flex py-2.5"
      >
        <Image src={lighting} />
        <span className="ml-1 font-body4 text-white">
          {Number(props.votingPower) > 0
            ? Number(props.votingPower) < 0.001
              ? `< ${Number(props.votingPower).toFixed(3)}`
              : Number(props.votingPower).toFixed(3)
            : "0"}
        </span>
        <span className="ml-auto font-body3 text-text-500">#{props.tokenId}</span>
      </div>
    );
  }
}
