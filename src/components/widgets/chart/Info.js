import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import PairHelper from "./../../../pairHelper";
import numberHelper from "./../../../numberHelper";

const Info = (props) => {
  const [loading, setLoading] = useState(true);
  const [liveInfo, setLiveInfo] = useState();
  const [show, setShow] = useState();

  useEffect(() => {
    const tick = () => {
      PairHelper.getTokenInfo(props.info.pair, props.network).then(
        (response) => {
          if (response) {
            setLiveInfo(response);
            if (loading) {
              setLoading(false);
            }
          }
        }
      );

      id = setTimeout(tick, 3000);
    };
    let id = setTimeout(tick, 3000);
    return () => clearTimeout(id);
  }, [loading, props.info.pair, props.network]);

  if (loading) {
    return (
      <div className="text-center p-5 w-100">
        <span className="spinner-border" role="status"></span>
      </div>
    );
  }

  const linkify = (inputText) => {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim;
    replacedText = inputText.replace(
      replacePattern1,
      '<a href="$1" target="_blank">$1</a>'
    );

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
      replacePattern2,
      '$1<a href="http://$2" target="_blank">$2</a>'
    );

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-_.])+@[a-zA-Z_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(
      replacePattern3,
      '<a href="mailto:$1">$1</a>'
    );

    return replacedText;
  };

  const getIconForUrl = (url) => {
    if (url.indexOf("//t.me") > 0) {
      return "fa fa-telegram";
    } else if (url.indexOf("discord.gg") > 0) {
      return "fab fa-discord";
    } else if (url.indexOf("medium.com") > 0) {
      return "fa fa-medium";
    } else if (url.indexOf("twitter.com") > 0) {
      return "fa fa-twitter";
    } else if (url.indexOf("reddit.com") > 0) {
      return "fa fa-reddit";
    } else if (url.indexOf("facebook.com") > 0) {
      return "fa fa-facebook";
    } else {
      return "fa fa-question-circle";
    }
  };

  const onPairChange = (e) => {
    window.location = `/charts/${props.network.Name}/${props.info.address}/${e.target.value}`;
  };

  if (props.info.cmc) {
    return (
      <>
        <div className="row">
          <div className="row col">
            <img
              src={props.info.cmc.logo || "/assets/images/logo-icon.png"}
              width="64"
              className="col-auto"
              alt="{props.info.pair.buyCurrency.symbol}"
            />
            <div className="col align-self-center">
              <div className="fs-5">{props.info.pair.buyCurrency.name}</div>
              <div className="fs-6">{props.info.pair.buyCurrency.symbol}</div>
            </div>
          </div>
          <div className="col-auto color-green text-end fs-5">
            {liveInfo.isETH ? (
              <>
                <NumberFormat
                  value={liveInfo.price * liveInfo.ethPrice}
                  decimalScale={numberHelper.calculatePricescale(
                    liveInfo.price * liveInfo.ethPrice
                  )}
                  decimalSeparator="."
                  displayType="text"
                  thousandSeparator=","
                  prefix="$"
                />
                <div className="text-secondary fs-6">
                  (
                  <NumberFormat
                    value={liveInfo.price}
                    decimalScale={numberHelper.calculatePricescale(
                      liveInfo.price
                    )}
                    decimalSeparator="."
                    displayType="text"
                    thousandSeparator=","
                    suffix={" " + props.info.pair.sellCurrency.symbol}
                  />
                  )
                </div>
              </>
            ) : (
              <NumberFormat
                value={liveInfo.price}
                decimalScale={numberHelper.calculatePricescale(liveInfo.price)}
                decimalSeparator="."
                displayType="text"
                thousandSeparator=","
                suffix={" " + props.info.pair.sellCurrency.symbol}
              />
            )}
          </div>
        </div>

        <div className="mt-2 row align-items-center">
          <div className="col text-truncate">{props.info.address}</div>
          <div className="col-auto">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(props.info.address)}
              className="default-btn p-2 border-0"
            >
              <i className="fa fa-clone"></i>
            </button>{" "}
            <a
              className="default-btn p-2 border-0"
              href={
                props.network.Explorer +
                "token/" +
                props.info.pair.buyCurrency.address
              }
              target="_blank"
              rel="noopener noreferrer"
              title="BSC Scan"
            >
              <i className="fa fa-external-link"></i>
            </a>
          </div>
        </div>

        <select
          className="form-select py-1 mt-2"
          onChange={onPairChange}
          defaultValue={props.info.pair.smartContract.address.address}
        >
          {props.info.pairs.map((item, index) => (
            <option key={index} value={item.smartContract.address.address}>
              {item.buyCurrency.symbol}/{item.sellCurrency.symbol} (
              {item.exchange.fullName})
            </option>
          ))}
        </select>

        <div className="text-center d-lg-none">
          <button
            onClick={() => setShow(!show)}
            className="default-btn btn-sq mt-2 w-100"
          >
            {!show ? "Show more details" : "Hide details"}
          </button>
        </div>

        <div className={show ? "d-lg-block" : "d-none d-lg-block"}>
          <div className="mt-4">
            <div>
              <b>Price:</b>
              <div className="color-green">
                {liveInfo.isETH ? (
                  <>
                    <NumberFormat
                      value={liveInfo.price * liveInfo.ethPrice}
                      decimalScale={numberHelper.calculatePricescale(
                        liveInfo.price * liveInfo.ethPrice
                      )}
                      decimalSeparator="."
                      displayType="text"
                      thousandSeparator=","
                      prefix="$"
                    />{" "}
                    <span className="text-secondary">
                      (
                      <NumberFormat
                        value={liveInfo.price}
                        decimalScale={numberHelper.calculatePricescale(
                          liveInfo.price
                        )}
                        decimalSeparator="."
                        displayType="text"
                        thousandSeparator=","
                        suffix={" " + props.info.pair.sellCurrency.symbol}
                      />
                      )
                    </span>
                  </>
                ) : (
                  <NumberFormat
                    value={liveInfo.price}
                    decimalScale={numberHelper.calculatePricescale(
                      liveInfo.price
                    )}
                    decimalSeparator="."
                    displayType="text"
                    thousandSeparator=","
                    suffix={" " + props.info.pair.sellCurrency.symbol}
                  />
                )}
              </div>
            </div>
            <div className="mt-2">
              <b>Market Cap (Includes locked, excludes burned):</b>
              <div className="color-green">
                {liveInfo.isETH ? (
                  <>
                    <NumberFormat
                      value={liveInfo.marketCap * liveInfo.ethPrice}
                      decimalScale="0"
                      decimalSeparator=""
                      displayType="text"
                      thousandSeparator=","
                      prefix="$"
                    />{" "}
                    <span className="text-secondary">
                      (
                      <NumberFormat
                        value={liveInfo.marketCap}
                        decimalScale="2"
                        decimalSeparator="."
                        displayType="text"
                        thousandSeparator=","
                        suffix={" " + props.info.pair.sellCurrency.symbol}
                      />
                      )
                    </span>
                  </>
                ) : (
                  <NumberFormat
                    value={liveInfo.marketCap}
                    decimalScale="2"
                    decimalSeparator="."
                    displayType="text"
                    thousandSeparator=","
                    suffix={" " + props.info.pair.sellCurrency.symbol}
                  />
                )}
              </div>
            </div>
            <div className="mt-2">
              <b>
                LP Holdings for {props.info.pair.buyCurrency.symbol}/
                {props.info.pair.sellCurrency.symbol}:
              </b>
              <div className="color-green">
                {liveInfo.isETH ? (
                  <>
                    <NumberFormat
                      value={liveInfo.lp * liveInfo.ethPrice}
                      decimalScale="0"
                      decimalSeparator=""
                      displayType="text"
                      thousandSeparator=","
                      prefix="$"
                    />{" "}
                    <span className="text-secondary">
                      (
                      <NumberFormat
                        value={liveInfo.lp}
                        decimalScale="2"
                        decimalSeparator="."
                        displayType="text"
                        thousandSeparator=","
                        suffix={" " + props.info.pair.sellCurrency.symbol}
                      />
                      )
                    </span>
                  </>
                ) : (
                  <NumberFormat
                    value={liveInfo.lp}
                    decimalScale="2"
                    decimalSeparator="."
                    displayType="text"
                    thousandSeparator=","
                    suffix={" " + props.info.pair.sellCurrency.symbol}
                  />
                )}
              </div>
            </div>
            <div className="mt-2">
              <b>Total Supply:</b>
              <div className="color-green">
                <NumberFormat
                  value={liveInfo.supply.total}
                  decimalScale="0"
                  decimalSeparator=""
                  displayType="text"
                  thousandSeparator=","
                />
              </div>
            </div>
            <div className="mt-2">
              <b>Circulation Supply:</b>
              <br />
              <div className="color-green">
                <NumberFormat
                  value={liveInfo.supply.circulation}
                  decimalScale="0"
                  decimalSeparator=""
                  displayType="text"
                  thousandSeparator=","
                />
              </div>
            </div>
          </div>

          <div
            className="mt-4"
            dangerouslySetInnerHTML={{
              __html: linkify(props.info.cmc.description),
            }}
          ></div>

          <div className="mt-4">
            <div className="social-icons">
              {props.info.cmc.urls.website.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className="fa fa-globe"></i>
                </a>
              ))}
              {props.info.cmc.urls.chat.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className={getIconForUrl(item)}></i>
                </a>
              ))}
              {props.info.cmc.urls.twitter.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className={getIconForUrl(item)}></i>
                </a>
              ))}
              {props.info.cmc.urls.facebook.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className={getIconForUrl(item)}></i>
                </a>
              ))}
              {props.info.cmc.urls.announcement.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className={getIconForUrl(item)}></i>
                </a>
              ))}
              {props.info.cmc.urls.message_board.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className={getIconForUrl(item)}></i>
                </a>
              ))}
              {props.info.cmc.urls.reddit.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className={getIconForUrl(item)}></i>
                </a>
              ))}
              {props.info.cmc.urls.technical_doc.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className="fa fa-file-alt"></i>
                </a>
              ))}
              {props.info.cmc.urls.source_code.map((item, index) => (
                <a key={index} href={item} rel="noopener noreferrer">
                  <i className="fa fa-file-code"></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="row">
        <div className="row col">
          <img
            src={"/assets/images/logo-icon.png"}
            width="64"
            className="col-auto"
            alt="{props.info.pair.buyCurrency.symbol}"
          />
          <div className="col align-self-center">
            <div className="fs-5">{props.info.pair.buyCurrency.name}</div>
            <div className="fs-6">{props.info.pair.buyCurrency.symbol}</div>
          </div>
        </div>
        <div className="col-auto color-green text-end fs-5">
          {liveInfo.isETH ? (
            <>
              <NumberFormat
                value={liveInfo.price * liveInfo.ethPrice}
                decimalScale={numberHelper.calculatePricescale(
                  liveInfo.price * liveInfo.ethPrice
                )}
                decimalSeparator="."
                displayType="text"
                thousandSeparator=","
                prefix="$"
              />
              <div className="text-secondary fs-6">
                (
                <NumberFormat
                  value={liveInfo.price}
                  decimalScale={numberHelper.calculatePricescale(
                    liveInfo.price
                  )}
                  decimalSeparator="."
                  displayType="text"
                  thousandSeparator=","
                  suffix={" " + props.info.pair.sellCurrency.symbol}
                />
                )
              </div>
            </>
          ) : (
            <NumberFormat
              value={liveInfo.price}
              decimalScale={numberHelper.calculatePricescale(liveInfo.price)}
              decimalSeparator="."
              displayType="text"
              thousandSeparator=","
              suffix={" " + props.info.pair.sellCurrency.symbol}
            />
          )}
        </div>
      </div>

      <div className="row mt-2">
        <div className="text-truncate">
          <span className="float-end ps-1">
            <i className="fa fa-clone"></i>{" "}
            <a
              href={
                props.network.Explorer +
                "token/" +
                props.info.pair.buyCurrency.address
              }
              target="_blank"
              rel="noopener noreferrer"
              title="BSC Scan"
            >
              <i className="fa fa-external-link"></i>
            </a>
          </span>
          <span>{props.info.address}</span>
        </div>
      </div>

      <select
        className="form-select py-1 mt-2"
        onChange={onPairChange}
        defaultValue={props.info.pair.smartContract.address.address}
      >
        {props.info.pairs.map((item, index) => (
          <option key={index} value={item.smartContract.address.address}>
            {item.buyCurrency.symbol}/{item.sellCurrency.symbol} (
            {item.exchange.fullName})
          </option>
        ))}
      </select>

      <div className="text-center d-lg-none">
        <button
          onClick={() => setShow(!show)}
          className="default-btn btn-sq mt-2 w-100"
        >
          {!show ? "Show more details" : "Hide details"}
        </button>
      </div>

      <div className={show ? "d-lg-block" : "d-none d-lg-block"}>
        <div className="mt-4">
          <div>
            <b>Price:</b>
            <div className="color-green">
              {liveInfo.isETH ? (
                <>
                  <NumberFormat
                    value={liveInfo.price * liveInfo.ethPrice}
                    decimalScale={numberHelper.calculatePricescale(
                      liveInfo.price * liveInfo.ethPrice
                    )}
                    decimalSeparator="."
                    displayType="text"
                    thousandSeparator=","
                    prefix="$"
                  />{" "}
                  <span className="text-secondary">
                    (
                    <NumberFormat
                      value={liveInfo.price}
                      decimalScale={numberHelper.calculatePricescale(
                        liveInfo.price
                      )}
                      decimalSeparator="."
                      displayType="text"
                      thousandSeparator=","
                      suffix={" " + props.info.pair.sellCurrency.symbol}
                    />
                    )
                  </span>
                </>
              ) : (
                <NumberFormat
                  value={liveInfo.price}
                  decimalScale={numberHelper.calculatePricescale(
                    liveInfo.price
                  )}
                  decimalSeparator="."
                  displayType="text"
                  thousandSeparator=","
                  suffix={" " + props.info.pair.sellCurrency.symbol}
                />
              )}
            </div>
          </div>
          <div className="mt-2">
            <b>Market Cap (Includes locked, excludes burned):</b>
            <div className="color-green">
              {liveInfo.isETH ? (
                <>
                  <NumberFormat
                    value={liveInfo.marketCap * liveInfo.ethPrice}
                    decimalScale="0"
                    decimalSeparator=""
                    displayType="text"
                    thousandSeparator=","
                    prefix="$"
                  />{" "}
                  <span className="text-secondary">
                    (
                    <NumberFormat
                      value={liveInfo.marketCap}
                      decimalScale="2"
                      decimalSeparator="."
                      displayType="text"
                      thousandSeparator=","
                      suffix={" " + props.info.pair.sellCurrency.symbol}
                    />
                    )
                  </span>
                </>
              ) : (
                <NumberFormat
                  value={liveInfo.marketCap}
                  decimalScale="2"
                  decimalSeparator="."
                  displayType="text"
                  thousandSeparator=","
                  suffix={" " + props.info.pair.sellCurrency.symbol}
                />
              )}
            </div>
          </div>
          <div className="mt-2">
            <b>
              LP Holdings for {props.info.pair.buyCurrency.symbol}/
              {props.info.pair.sellCurrency.symbol}:
            </b>
            <div className="color-green">
              {liveInfo.isETH ? (
                <>
                  <NumberFormat
                    value={liveInfo.lp * liveInfo.ethPrice}
                    decimalScale="0"
                    decimalSeparator=""
                    displayType="text"
                    thousandSeparator=","
                    prefix="$"
                  />{" "}
                  <span className="text-secondary">
                    (
                    <NumberFormat
                      value={liveInfo.lp}
                      decimalScale="2"
                      decimalSeparator="."
                      displayType="text"
                      thousandSeparator=","
                      suffix={" " + props.info.pair.sellCurrency.symbol}
                    />
                    )
                  </span>
                </>
              ) : (
                <NumberFormat
                  value={liveInfo.lp}
                  decimalScale="2"
                  decimalSeparator="."
                  displayType="text"
                  thousandSeparator=","
                  suffix={" " + props.info.pair.sellCurrency.symbol}
                />
              )}
            </div>
          </div>
          <div className="mt-2">
            <b>Total Supply:</b>
            <div className="color-green">
              <NumberFormat
                value={liveInfo.supply.total}
                decimalScale="0"
                decimalSeparator=""
                displayType="text"
                thousandSeparator=","
              />
            </div>
          </div>
          <div className="mt-2">
            <b>Circulation Supply:</b>
            <br />
            <div className="color-green">
              <NumberFormat
                value={liveInfo.supply.circulation}
                decimalScale="0"
                decimalSeparator=""
                displayType="text"
                thousandSeparator=","
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Info };
