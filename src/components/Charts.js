import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Requester } from "../requester";
import { Chart } from "./widgets/chart/Chart";
import { Info } from "./widgets/chart/Info";
import { LatestTrades } from "./widgets/LatestTrades";
import { Exchange } from "./widgets/exchange/Exchange";
import linq from "linq";
import networks from "./../networks";
import { ethers } from "ethers";

async function getInfo(address, network, pairAddress) {
  const pairs = await Requester.getAsync(
    "http://135.181.152.229:3001/api/Charts/GetPairs",
    { address: address, network: network.Name }
  );
  if (pairAddress == null) {
    var pair = pairs[0];
  } else {
    const filter = pairs.filter(
      (x) => x.smartContract.address.address === pairAddress
    );
    if (filter.length) {
      pair = filter[0];
    }
  }
  const info = {
    address: address,
    pairs: pairs,
    pair: pair,
    title: `${pair.buyCurrency.symbol}/${pair.sellCurrency.symbol} (${pair.exchange.fullName})`,
  };

  const cmc = await Requester.getAsync(
    "http://135.181.152.229:3001/api/Charts/GetCMCInfo",
    { address: ethers.utils.getAddress(address), network: network.Name }
  );

  if (cmc != null && cmc.id) {
    info.cmc = cmc;
  }

  return info;
}

const Charts = (props) => {
  const exchangeContainerRef = useRef();
  const exchangeRef = useRef();
  const hideExchangeRef = useRef();
  const [info, setInfo] = useState();
  const params = useParams();
  params.networkName = params.networkName || "bsc";
  params.address =
    params.address || "0x293c3ee9abacb08bb8ced107987f00efd1539288";
  const [currentParams, setParams] = useState();
  const network = linq
    .from(networks)
    .where((x) => x.Name === params.networkName)
    .single();

  if (params !== currentParams && info) {
    setInfo();
  }

  useEffect(() => {
    const fetchData = async () => {
      if (params !== currentParams) {
        setParams(params);
        const info = await getInfo(params.address, network, params.pairAddress);
        setInfo(info);
      }
    };
    fetchData();
  }, [params, currentParams, network]);

  if (!info) {
    return (
      <div className="text-center p-5 w-100">
        <span className="spinner-border" role="status"></span>
      </div>
    );
  }

  const onHideExchange = () => {
    if (exchangeRef.current.style.display === "none") {
      exchangeRef.current.style.display = "block";
      exchangeContainerRef.current.className = "mb-4 mb-xl-0 order-1 col-xl-7";
      hideExchangeRef.current.className =
        "d-none d-xl-block col-auto hider fa fa-arrow-right";
    } else {
      exchangeRef.current.style.display = "none";
      exchangeContainerRef.current.className = "mb-4 mb-xl-0 order-1 col-12";
      hideExchangeRef.current.className =
        "d-none d-xl-block col-auto hider fa fa-arrow-left";
    }
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3">
            <div className="overflow-hidden">
              <Info info={info} network={network} />
            </div>
          </div>
          <div className="col-lg-9 mt-4 mt-lg-0">
            <div className="row">
              <div
                ref={exchangeContainerRef}
                className={"mb-4 mb-xl-0 order-1 col-xl-7"}
              >
                <div className="row h-100 m-0">
                  <div className="col p-0">
                    <Chart
                      title={info.title}
                      pair={info.pair}
                      network={network}
                    />
                  </div>
                  <div
                    className="d-none d-xl-block col-auto hider fa fa-arrow-right"
                    ref={hideExchangeRef}
                    onClick={onHideExchange}
                  ></div>
                </div>
              </div>
              <div
                className="col-xl-5 order-3 order-xl-2 mt-4 mt-xl-0 ps-xl-0"
                ref={exchangeRef}
              >
                <Exchange
                  network={network}
                  fromSymbol={info.pair.sellCurrency.symbol}
                  fromAddress={info.pair.sellCurrency.address}
                  toSymbol={info.pair.buyCurrency.symbol}
                  toAddress={info.pair.buyCurrency.address}
                />
              </div>
              <div className="col-12 order-2 order-xl-3 mt-4">
                <LatestTrades pair={info.pair} network={network} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Charts };
