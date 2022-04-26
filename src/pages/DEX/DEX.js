import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Exchange } from "../../components/widgets/exchange/Exchange";
import networks from '../../networks.json'
import DEXSubmenu from '../../components/Submenu/DEXSubmenu';
import * as selector from '../../store/selectors';
// import linq from "linq";

const DEX = (props) => {
    const selectedNetwork = useSelector(selector.chainState);
    const [network, setNetwork] = useState(networks[localStorage.getItem("networkIndex") || 2]);

    useEffect(() => {
        try {
            setNetwork(networks[selectedNetwork.chain.index]);
        } catch (error) {
            console.log("error: ", error);
        }
    }, [selectedNetwork])

    return (
        <div className="dex">
            <DEXSubmenu />
            <Exchange network={network} fromSymbol={network.Currency.Name} fromAddress="-" toSymbol={network.Currency.WrappedName} toAddress={network.Currency.Address} />
        </div>
    );
}

export { DEX }