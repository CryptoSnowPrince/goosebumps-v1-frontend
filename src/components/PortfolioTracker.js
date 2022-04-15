import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import linq from "linq";
import { Requester } from "../requester";
import networks from "./../networks";
import { TradesModal } from "./widgets/TradesModal";
import PairHelper from "./../pairHelper";
import numberHelper from "./../numberHelper";
import NumberFormat from "react-number-format";

const PortfolioTracker = () => {
    const navigate = useNavigate();
    const [tokens, setTokens] = useState();
    const [selectedToken, setSelectedToken] = useState();
    const [ethPrice, setETHPrice] = useState();
    const params = useParams();
    const [currentParams, setParams] = useState();
    const network = params.networkName ? linq.from(networks).where(x => x.Name === params.networkName).single() : null;

    const addresses = params.addresses.split(',');

    if (params !== currentParams && tokens) {
        setTokens();
    }

    const handleRemoveAddress = (address) => {
        navigate(window.location.pathname.replace(address + ",", "").replace("," + address, ""));
    };

    const fetchLiveInfo = async (tokens) => {
        if (!tokens) {
            tokens = await Requester.postAsync("api/Portfolio/GetTrades", { network: network.Name }, addresses);
        }

        const infos = await PairHelper.getTokenInfos(linq.from(tokens).select(x => x.pair).toArray(), network, addresses);
        const query = linq.from(infos.infos);

        tokens.map(item => {
            item.info = query.where(x => x.token === item.pair.buyCurrency.address).singleOrDefault() || {};
            item.info.rewards = item.outs + item.info.balance - item.ins;
            if (item.info.rewards < 0.00000001) {
                item.info.rewards = 0;
            }

            item.trades.map(trade => {
                const customTradePrice = localStorage.getItem("price_" + trade.tx);
                if (customTradePrice) {
                    trade.priceUSD = customTradePrice;
                }

                trade.buyPrices.map(buyPrice => {
                    const customBuyPrice = localStorage.getItem("price_" + buyPrice.tx);
                    if (customBuyPrice) {
                        buyPrice.priceUSD = customBuyPrice;
                    }
                    return buyPrice;
                });

                trade.avarageBuyPriceOfHoldings = trade.buyPrices.length
                    ? linq.from(trade.buyPrices).select(x => x.priceUSD * x.amount).toArray().reduce((a, b) => a + b) / linq.from(trade.buyPrices).select(x => x.amount).toArray().reduce((a, b) => a + b)
                    : 0;
                trade.profit = trade.transactionType === 2 || trade.transactionType === 4
                    ?
                    (100 - localStorage.getItem("slippage_" + trade.tx) || 0)
                    * (trade.priceUSD * trade.tokenAmount) - (trade.avarageBuyPriceOfHoldings * trade.tokenAmount) / 100
                    : 0;

                return trade;
            });

            const buysAndIns = linq.from(item.trades).where(x => x.transactionType === 1 || x.transactionType === 3);

            item.avarageBuyPriceOfHoldings = item.info.balance > 0
                ? buysAndIns.select(x => x.priceUSD * x.holdingAmount).toArray().reduce((a, b) => a + b) / buysAndIns.select(x => x.holdingAmount).toArray().reduce((a, b) => a + b)
                : 0;
                item.info.profit = {
                holdings: item.info.isETH && item.info.balance > 0 ? (item.info.balance * item.info.price * infos.ethPrice) - (item.avarageBuyPriceOfHoldings * item.info.balance) : 0,
                sold: linq.from(item.trades).select(x => x.profit).toArray().reduce((x, y) => x + y)
            };

            item.info.pricescale = numberHelper.calculatePricescale(item.info.isETH ? (item.info.price * infos.ethPrice) : item.info.price);
            item.info.ethscale = numberHelper.calculatePricescale(item.info.price);
            item.info.tokenscale = numberHelper.calculateTokenscale(item.info.isETH ? (item.info.price * infos.ethPrice) : item.info.price);

            return item;
        });

        return {
            ethPrice: infos.ethPrice,
            tokens: tokens
        };
    };

    if (params !== currentParams && params.addresses && params.networkName) {
        setParams(params);
        fetchLiveInfo().then(info => {
            setETHPrice(info.ethPrice);
            setTokens(info.tokens);
        });
    }

    useEffect(() => {
        const tick = () => {
            fetchLiveInfo(tokens).then(info => {
                setETHPrice(info.ethPrice);
                setTokens(info.tokens);
            });
            id = setTimeout(tick, 3000);
        }
        let id = setTimeout(() => tick, 3000);
        return () => clearTimeout(id);
    });

    if (!params.addresses || !params.networkName) {
        return (
            <p className="text-center p-5 mt-5 h3">
                Use search bar to track an address.
            </p>
        );
    }

    if (!tokens || !ethPrice) {
        return (
            <div className="text-center p-5">
                <div className="row justify-content-center align-items-center">
                    <div className="col-auto">
                        <span className="spinner-border" role="status"></span>
                    </div>
                    <div className="col-auto h-100">This will take few seconds</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="portfolio-page container-fluid">
                <div className="head-title">
                    <div className="row">
                        <div className="col-lg-6">
                            <h2>Portfolio For</h2>
                            <div>
                                {addresses.map((address, index) =>
                                    <div className="mt-2" key={index}>{address} {addresses.length > 1 ? <button onClick={() => handleRemoveAddress(address)} className="default-btn btn-sq px-3 py-2"><i className="fa fa-times"></i></button> : ""}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-6 text-right mt-auto">
                            <p>
                                Rewards :
                                <label><i className="fa fa-circle blue" aria-hidden="true"></i> Earned</label>
                                <label><i className="fa fa-circle red" aria-hidden="true"></i> Sold</label>
                                <br />
                                Profit :
                                <label><i className="fa fa-circle blue" aria-hidden="true"></i> Holdings</label>
                                <label><i className="fa fa-circle red" aria-hidden="true"></i> Sold</label>
                                <label><i className="fa fa-circle yellow" aria-hidden="true"></i> Total</label>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="table-responsive tournament-table mb-50 your-assets">
                    <table className="table align-middle mb-0">
                        <thead className="sticky-top">
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Price</th>
                                <th scope="col">Volume</th>
                                <th scope="col">Rewards</th>
                                <th scope="col">Holdings</th>
                                <th scope="col">MarketCap</th>
                                <th scope="col">Avarage Buy<br />Price of Holdings</th>
                                <th scope="col">Profit</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokens.length
                                ? tokens.map((token, index) =>
                                    <tr key={index}>
                                        <td>{token.pair.buyCurrency.name}<br /><span className="text-secondary">({token.pair.buyCurrency.symbol})</span></td>
                                        <td>
                                            {
                                                token.info.isETH
                                                    ? <>
                                                        <NumberFormat value={token.info.price * ethPrice} decimalScale={token.info.pricescale} displayType="text" thousandSeparator="," prefix="$" />
                                                        <br />
                                                        <span className="text-secondary">(<NumberFormat value={token.info.price} decimalScale={token.info.pricescale} displayType="text" thousandSeparator="," suffix={" " + token.pair.sellCurrency.symbol} />)</span>
                                                    </>
                                                    : <NumberFormat value={token.info.price}  decimalScale={token.info.ethscale} displayType="text" thousandSeparator="," suffix={" " + token.pair.sellCurrency.symbol} />
                                            }
                                        </td>
                                        <td>
                                            <NumberFormat value={token.volume} decimalScale="0" decimalSeparator="" displayType="text" thousandSeparator="," prefix="$" />
                                        </td>
                                        <td>
                                            <label><i className="fa fa-circle blue" aria-hidden="true"></i>
                                                <NumberFormat value={token.info.rewards} decimalScale={token.info.tokenscale} displayType="text" thousandSeparator="," />
                                            </label><br />
                                            <label><i className="fa fa-circle red" aria-hidden="true"></i>
                                                <NumberFormat value={token.rewardsSold} decimalScale={token.info.tokenscale} displayType="text" thousandSeparator="," />
                                            </label>
                                        </td>
                                        <td>
                                            {
                                                token.info.isETH
                                                    ? <>
                                                        <NumberFormat value={token.info.balance * token.info.price * ethPrice} decimalScale="2" displayType="text" thousandSeparator="," prefix="$" />
                                                        <br />
                                                        <span className="text-secondary">(<NumberFormat value={token.info.balance * token.info.price} decimalScale="2" displayType="text" thousandSeparator="," suffix={" " + token.pair.sellCurrency.symbol} />)</span>
                                                    </>
                                                    : <>
                                                        <NumberFormat value={token.info.balance * token.info.price} decimalScale="2" displayType="text" thousandSeparator="," suffix={" " + token.pair.sellCurrency.symbol} />
                                                    </>
                                            }
                                        </td>
                                        <td>
                                            {
                                                token.info.isETH
                                                    ? <>
                                                        <NumberFormat value={token.info.supply.circulation * (token.info.price * ethPrice)} decimalScale="0" decimalSeparator="" displayType="text" thousandSeparator="," prefix="$" />
                                                        <br />
                                                        <span className="text-secondary">(<NumberFormat value={token.info.supply.circulation * token.info.price} decimalSeparator="" decimalScale="0" displayType="text" thousandSeparator="," suffix={" " + token.pair.sellCurrency.symbol} />)</span>
                                                    </>
                                                    : <NumberFormat value={token.info.supply.circulation * token.info.price} decimalScale="0" decimalSeparator="" displayType="text" thousandSeparator="," suffix={" " + token.pair.sellCurrency.symbol} />
                                            }
                                        </td>
                                        <td>
                                            <NumberFormat value={token.avarageBuyPriceOfHoldings} decimalScale={token.info.pricescale} displayType="text" thousandSeparator="," prefix="$" />
                                        </td>
                                        <td>
                                            <label>
                                                <i className="fa fa-circle blue" aria-hidden="true"></i>
                                                <NumberFormat value={token.info.profit.holdings} decimalScale="2" displayType="text" thousandSeparator="," prefix="$" />
                                            </label>
                                            <br />
                                            <label>
                                                <i className="fa fa-circle red" aria-hidden="true"></i>
                                                <NumberFormat value={token.info.profit.sold} decimalScale="2" displayType="text" thousandSeparator="," prefix="$" />
                                            </label>
                                            <br />
                                            <label>
                                                <i className="fa fa-circle yellow" aria-hidden="true"></i>
                                                <NumberFormat value={token.info.profit.sold + token.info.profit.holdings} decimalScale="2" displayType="text" thousandSeparator="," prefix="$" />
                                            </label>
                                        </td>
                                        <td>
                                            <a className="default-btn btn-sq me-2" href={network.Explorer + "token/" + token.pair.buyCurrency.address} target="_blank" rel="noopener noreferrer">
                                                Explorer
                                            </a>
                                            <Link to={"/charts/" + network.Name + "/" + token.pair.buyCurrency.address} className="default-btn btn-sq me-2" >
                                                Charts
                                            </Link>
                                            <button className="default-btn btn-sq" type="button" onClick={() => setSelectedToken(token)}>Trades</button>
                                        </td>
                                    </tr>
                                )
                                : <tr>
                                    <td colSpan="9" className="text-center">
                                        <p className="p-5">NO RESULT</p>
                                    </td>
                                </tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <TradesModal network={network} token={selectedToken} hide={() => setSelectedToken()} />
        </>
    );
}

export { PortfolioTracker }
