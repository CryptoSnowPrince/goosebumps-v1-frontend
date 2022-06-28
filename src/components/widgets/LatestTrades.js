import React, { useState, useEffect } from "react";
import { Requester } from "../../requester";
import NumberFormat from "react-number-format";
import ReactTooltip from "react-tooltip";
import ago from "s-ago";
import numberHelper from "./../../numberHelper";

const renderContent = (trades, network) => {
  return (
    <>
      <h3 className="table-title">
        <span>TRADE HISTORY</span>
      </h3>
      <div className="table-responsive tournament-table latest-trades mt-0">
        <table className="table align-middle mb-0">
          <thead className="sticky-top">
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Type</th>
              <th scope="col">Tokens</th>
              <th scope="col">Price</th>
              <th scope="col">Value</th>
              <th scope="col">Dex</th>
              <th scope="col" width="90"></th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr key={index}>
                <td>
                  <span
                    data-tip
                    data-for={"trade_tooltip_time_" + index}
                    href={trade.tx}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ago(new Date(trade.time))}
                  </span>
                  <ReactTooltip
                    place="bottom"
                    id={"trade_tooltip_time_" + index}
                    aria-haspopup="true"
                  >
                    {new Date(trade.time).toLocaleString()}
                  </ReactTooltip>
                </td>
                <td>
                  <span
                    className={trade.isBuy ? "buy" : "sell"}
                    href={trade.tx}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {trade.isBuy ? "Buy" : "Sell"}
                  </span>
                </td>
                <td>
                  <span
                    href={trade.tx}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NumberFormat
                      value={trade.tokens}
                      decimalScale={numberHelper.calculateTokenscale(
                        trade.price
                      )}
                      displayType="text"
                      thousandSeparator=","
                    />
                  </span>
                </td>
                <td>
                  <span
                    data-tip
                    data-for={"trade_tooltip_price_" + index}
                    href={trade.tx}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NumberFormat
                      value={trade.priceUSD}
                      decimalScale={numberHelper.calculatePricescale(
                        trade.priceUSD
                      )}
                      decimalSeparator="."
                      displayType="text"
                      thousandSeparator=","
                      prefix="$"
                    />
                  </span>
                  <ReactTooltip
                    place="bottom"
                    id={"trade_tooltip_price_" + index}
                    aria-haspopup="true"
                  >
                    <NumberFormat
                      value={trade.price}
                      decimalScale={numberHelper.calculatePricescale(
                        trade.price
                      )}
                      displayType="text"
                      thousandSeparator=","
                      suffix={" " + trade.symbol}
                    />
                  </ReactTooltip>
                </td>
                <td>
                  <span
                    data-tip
                    data-for={"trade_tooltip_value_" + index}
                    href={trade.tx}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NumberFormat
                      value={trade.valueUSD}
                      decimalScale="2"
                      decimalSeparator="."
                      displayType="text"
                      thousandSeparator=","
                      prefix="$"
                    />
                  </span>
                  <ReactTooltip
                    place="bottom"
                    id={"trade_tooltip_value_" + index}
                    aria-haspopup="true"
                  >
                    <NumberFormat
                      value={trade.value}
                      decimalScale="8"
                      decimalSeparator="."
                      displayType="text"
                      thousandSeparator=","
                      suffix={" " + trade.symbol}
                    />
                  </ReactTooltip>
                </td>
                <td>{trade.dex}</td>
                <td className="text-end">
                  <a
                    className="default-btn btn-sq"
                    href={network.Explorer + "tx/" + trade.tx}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const LatestTrades = (props) => {
  const [pair, setPair] = useState(props.pair);
  const [init, setInit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState(null);
  const [lastTradesRequest, setLastTradesRequest] = useState(null);

  if (props.pair.smartContract.address.address !== pair) {
    setPair(props.pair.smartContract.address.address);
    setInit(true);
    setLoading(true);
  }

  if (init) {
    setInit(false);
    const now = parseInt(new Date().getTime() / 1000);
    Requester.getAsync("https://135.181.152.229/api/Charts/GetLatestTrades", {
      token0: props.pair.buyCurrency.address,
      token1: props.pair.sellCurrency.address,
      pair: props.pair.smartContract.address.address,
      network: props.network.Name,
      startTime: now - 24 * 60 * 60,
      endTime: now,
      limit: 20,
    }).then((response) => {
      setTrades(response);
      setLastTradesRequest(now);
      setLoading(false);
    });
  }

  useEffect(() => {
    const tick = async () => {
      if (!init && !loading) {
        const now = parseInt(new Date().getTime() / 1000);
        const response = await Requester.getAsync(
          "https://135.181.152.229/api/Charts/GetLatestTrades",
          {
            token0: props.pair.buyCurrency.address,
            token1: props.pair.sellCurrency.address,
            pair: props.pair.smartContract.address.address,
            network: props.network.Name,
            startTime: lastTradesRequest,
            endTime: now,
          }
        );

        if (response != null && response.length) {
          // old source
          // setTrades(response.concat(trades).slice(0, 20));
          setTrades(response.concat(trades));
          setLastTradesRequest(now);
        }
        console.log("ready");
      }
      // id = setTimeout(tick, 3000);
    };
    let id = setTimeout(tick, 60000);
    return () => clearTimeout(id);
  });

  if (loading) {
    return (
      <div className="text-center p-5 w-100">
        <span className="spinner-border" role="status"></span>
      </div>
    );
  }

  return renderContent(trades, props.network);
};

export { LatestTrades };
