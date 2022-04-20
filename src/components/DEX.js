import React, { useState, useEffect } from 'react';
import { Exchange } from "./widgets/exchange/Exchange";
import networks from "./../networks";
import linq from "linq";

const DEX = (props) => {
    const network = linq.from(networks).where(x => x.Name === "ropsten").single();
    // console.log(network);

    return (
        <div className="dex">
            <Exchange network={network} fromSymbol="ETH" fromAddress="-" toSymbol="USDT" toAddress="0xdAC17F958D2ee523a2206206994597C13D831ec7" />
        </div>
    );
}

export { DEX }