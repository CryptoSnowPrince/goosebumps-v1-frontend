import React, { useState, useEffect } from 'react';
import { Exchange } from "./widgets/exchange/Exchange";
import networks from "./../networks";
import linq from "linq";

const DEX = (props) => {
    const network = linq.from(networks).where(x => x.Name === "ropsten").single();
    // console.log(network);

    return (
        <div className="dex">
            <Exchange network={network} fromSymbol="ETH" fromAddress="-" toSymbol="USDT" toAddress="0x110a13FC3efE6A245B50102D2d79B3E76125Ae83" />
        </div>
    );
}

export { DEX }