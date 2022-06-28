import { getErrorMessage } from "../../../../utils/helpers";
import { Requester } from "./../../../../requester";

export class HistoryProvider {
  constructor(pair, network) {
    this._pair = pair;
    this._network = network;
    this._lastResolution = "";
  }
  getBars(symbolInfo, resolution, periodParams) {
    const requestParams = {
      token0: this._pair.buyCurrency.address,
      token1: this._pair.sellCurrency.address,
      pair: this._pair.smartContract.address.address,
      exchange: this._pair.exchange.address.address,
      startTime: periodParams.from,
      endTime: periodParams.to,
      interval: resolution,
      network: this._network.Name,
      useCache: this._lastResolution !== resolution,
    };

    this._lastResolution = resolution;

    console.log(periodParams);

    // if (periodParams.countBack !== undefined) {
    //   requestParams.countBack = periodParams.countBack;
    // }

    return this.getOHLC(requestParams);
  }

  getOHLC(requestParams) {
    return new Promise((resolve, reject) => {
      Requester.getAsync(
        "https://135.181.152.229/api/Charts/GetOHLC",
        requestParams
      )
        .then((response) => {
          const bars = [];
          const meta = {
            noData: false,
          };
          if (response != null && response.length) {
            for (let i = 0; i < response.length; ++i) {
              bars.push({
                time: response[i].time,
                open: response[i].open,
                high: response[i].high,
                low: response[i].low,
                close: response[i].close,
                volume: response[i].volume,
              });
            }
          } else {
            meta.noData = true;
          }

          resolve({
            bars: bars,
            meta: meta,
          });
        })
        .catch((reason) => {
          const reasonString = getErrorMessage(reason);
          // tslint:disable-next-line:no-console
          console.warn(
            `HistoryProvider: getBars() failed, error=${reasonString}`
          );
          reject(reasonString);
        });
    });
  }
}
