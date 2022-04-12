import { useState, useEffect } from 'react';
import { Exchange } from "./widgets/exchange/Exchange";
import networks from "./../networks";
import linq from "linq";


const DEX = (props) => {
    const network = linq.from(networks).where(x => x.Name === "bsc").single();

    return (
        <div className="dex">
            <Exchange network={network} fromSymbol="WBNB" fromAddress="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" toSymbol="EMPIRE" toAddress="0x293c3ee9abacb08bb8ced107987f00efd1539288" />
        </div>
    );
}

export { DEX }