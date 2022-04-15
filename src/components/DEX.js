import React, { useState, useEffect } from 'react';
import { Exchange } from "./widgets/exchange/Exchange";
import networks from "./../networks";
import linq from "linq";


const DEX = (props) => {
    const network = linq.from(networks).where(x => x.Name === "bsctestnet").single();
    console.log(network);

    return (
        <div className="dex">
            <Exchange network={network} fromSymbol="WBNB" fromAddress="0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd" toSymbol="GBFT" toAddress="0xA6454bbA55F46Ef488c599c44867DF5eE3D6F543" />
        </div>
    );
}

export { DEX }