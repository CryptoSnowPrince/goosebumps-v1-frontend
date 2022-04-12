import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Requester } from "../requester";
import { StakeEmpire } from "./widgets/StakeEmpire";
import { Container, Row, Col } from 'react-bootstrap';
import linq from "linq";
import networks from "./../networks";
import { ethers } from "ethers";

async function getInfo(address, network, pairAddress) {
    const pairs = await Requester.getAsync("api/Charts/GetPairs", { address: address, network: network.Name });
    if (pairAddress == null) {
        var pair = pairs[0];
    }
    else {
        const filter = pairs.filter(x => x.smartContract.address.address === pairAddress);
        if (filter.length) {
            pair = filter[0];
        }
    }
    const info = { address: address, pairs: pairs, pair: pair, title: `${pair.buyCurrency.symbol}/${pair.sellCurrency.symbol} (${pair.exchange.fullName})` };

    const cmc = await Requester.getAsync("api/Charts/GetCMCInfo", { address: ethers.utils.getAddress(address), network: network.Name });

    if (cmc != null && cmc.id) {
        info.cmc = cmc;
    }

    return info;
}

const Stake = (props) => {
    const exchangeContainerRef = useRef();
    const exchangeRef = useRef();
    const hideExchangeRef = useRef();
    const [info, setInfo] = useState();
    const params = useParams();
    params.networkName = params.networkName || "bsc";
    params.address = params.address || "0x293c3ee9abacb08bb8ced107987f00efd1539288";
    const [currentParams, setParams] = useState();
    const network = linq.from(networks).where(x => x.Name === params.networkName).single();

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
            exchangeContainerRef.current.className = "mb-4 mb-xl-0 order-1 col-xl-7"
            hideExchangeRef.current.className = "d-none d-xl-block col-auto hider fa fa-arrow-right"
        }
        else {
            exchangeRef.current.style.display = "none";
            exchangeContainerRef.current.className = "mb-4 mb-xl-0 order-1 col-12"
            hideExchangeRef.current.className = "d-none d-xl-block col-auto hider fa fa-arrow-left"
        }
    }

    return (
            <Container>
                <Row className="justify-content-md-center">
                    <Col className="col-lg-12 mt-2 mt-lg-0" ref={exchangeRef}>
                        <StakeEmpire pair={info.pair} network={network} />
                    </Col>
                </Row>
            </Container>
    );
}

export { Stake }
