import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Exchange } from "./widgets/exchange/Exchange";
import networks from "./../networks";
import linq from "linq";
import * as selector from '../store/selectors';

const DEX = (props) => {
    // const network = linq.from(networks).where(x => x.Name === "ropsten").single();
    const selectedNetwork = useSelector(selector.chainState);
    // const network = linq.from(networks).where(x => x.Name === "ropsten").single();
    const [network, setNetwork] = useState(networks[localStorage.getItem("networkIndex") || 2]);

    useEffect(() => {
        try {
            setNetwork(networks[selectedNetwork.chain.index]);
        } catch (error) {
            console.log("error: ", error);
        }
    }, [selectedNetwork])
    // console.log(network);

    return (
        <div className="dex">
            <Exchange network={network}  />
            {/* <Exchange network={network} fromSymbol="WETH" fromAddress="0xc778417E063141139Fce010982780140Aa0cD5Ab" toSymbol="USDT" toAddress="0x110a13FC3efE6A245B50102D2d79B3E76125Ae83" /> */}
        </div>
    );
}

export { DEX }