import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Exchange } from "../../components/widgets/exchange/Exchange";
import networks from '../../networks.json'
import DEXSubmenu from '../../components/Submenu/DEXSubmenu';
import * as selector from '../../store/selectors';
// import linq from "linq";

const DEX = (props) => {
    const chainIndex = useSelector(selector.chainIndex);

    return (
        <div className="dex">
            <DEXSubmenu />
            <Exchange network={networks[chainIndex]} fromSymbol={networks[chainIndex].Currency.Name} fromAddress="-" toSymbol={networks[chainIndex].Currency.WrappedName} toAddress={networks[chainIndex].Currency.Address} />
        </div>
    );
}

export { DEX }