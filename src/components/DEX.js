import React, { useState, useEffect } from 'react';
import { Exchange } from "./widgets/exchange/Exchange";
import networks from "./../networks";
import linq from "linq";

const DEX = (props) => {
    const network = linq.from(networks).where(x => x.Name === "ropsten").single();
    // console.log(network);

    return (
        <div className="dex">
            <Exchange network={network} fromSymbol="USDT" fromAddress="0xdac17f958d2ee523a2206206994597c13d831ec7" toSymbol="WETH" toAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" />
            {/* <Exchange network={network} fromSymbol="ETH" fromAddress="-" /> */}
        </div>
    );
}

export { DEX }