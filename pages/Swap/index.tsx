import type { NextPage } from "next";
import PropTypes from "prop-types";
import Head from "next/head";
import { SideBarHOC } from "../../src/components/Sidebar/SideBarHOC";
import Swap from "../../src/components/Swap";
import { AppDispatch } from "../../src/redux/index";

import { useAppSelector } from "../../src/redux/index";
import { fetchWallet, walletConnection, walletDisconnection } from "../../src/redux/wallet/wallet";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { getConfig } from "../../src/redux/config/config";
import { getTokenPrice } from "../../src/redux/tokenPrice/tokenPrice";
import { getTotalVotingPower } from "../../src/redux/pools";
import { useInterval } from "../../src/hooks/useInterval";
import { getEpochData } from "../../src/redux/epoch/epoch";

const Home: NextPage = (props) => {
  const userAddress = useAppSelector((state) => state.wallet.address);
  const token = useAppSelector((state) => state.config.tokens);
  const totalVotingPowerError = useAppSelector((state) => state.pools.totalVotingPowerError);
  const epochError = useAppSelector((state) => state.epoch).epochFetchError;

  const dispatch = useDispatch<AppDispatch>();

  const connectTempleWallet = () => {
    return dispatch(walletConnection());
  };
  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(getConfig());
    //dispatch(getTotalVotingPower());
  }, []);
  useEffect(() => {
    if (epochError) {
      dispatch(getEpochData());
    }
  }, [epochError]);

  useInterval(() => {
    dispatch(getEpochData());
  }, 60000);
  useEffect(() => {
    if (userAddress) {
      dispatch(getTotalVotingPower());
    }
  }, [userAddress]);
  useEffect(() => {
    if (totalVotingPowerError) {
      dispatch(getTotalVotingPower());
    }
  }, [totalVotingPowerError]);
  useEffect(() => {
    Object.keys(token).length !== 0 && dispatch(getTokenPrice());
  }, [token]);
  const disconnectUserWallet = async () => {
    if (userAddress) {
      return dispatch(walletDisconnection());
    }
  };
  const otherPageProps = {
    connectWallet: connectTempleWallet,
    disconnectWallet: disconnectUserWallet,
    walletAddress: userAddress,
  };
  return (
    <>
      <Head>
        <title className="font-medium1">Plenty network</title>
        <meta name="description" content="plenty network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SideBarHOC>
        <Swap otherProps={otherPageProps} />
      </SideBarHOC>
    </>
  );
};
Home.propTypes = {
  connectWallet: PropTypes.any,
  disconnectWallet: PropTypes.any,
  fetchWalletAddress: PropTypes.any,
  userAddress: PropTypes.any,
};

export default Home;
