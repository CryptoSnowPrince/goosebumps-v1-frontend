import { DataPulseProvider } from "./data-pulse-provider";
import { HistoryProvider } from "./history-provider";
import pairHelper from "../../../../pairHelper";

export class UDFCompatibleDatafeed {
  constructor(pair, network, updateFrequency = 20 * 1000) {
    this._pair = pair;
    this._network = network;
    this._historyProvider = new HistoryProvider(pair, network);
    this._dataPulseProvider = new DataPulseProvider(
      this._historyProvider,
      updateFrequency
    );
  }
  onReady(callback) {
    setTimeout(function() {
      callback({
        supports_search: false,
        supports_group_request: false,
        supported_resolutions: [
          "1",
          "5",
          "15",
          "30",
          "1h",
          "4h",
          "8h",
          "12h",
          "1D",
        ],
        supports_marks: false,
        supports_timescale_marks: false,
      });
    }, 0);
  }
  resolveSymbol(symbolName, onResolve, onError, extension) {
    pairHelper
      .getTokenPricescale(this._pair, this._network)
      .then((pricescale) => {
        onResolve({
          ticker: symbolName,
          name: symbolName,
          currency_name: "USD",
          has_empty_bars: true,
          pricescale: 10 ** 6,
          //   pricescale: 10 ** pricescale,
          volume_precision: 1,
          type: "crypto",
          session: "24x7",
          minmov: 1,
          has_intraday: true,
          has_weekly_and_monthly: false,
          timezone: "Etc/UTC",
          // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          supported_resolutions: [
            "1",
            "5",
            "15",
            "30",
            "1h",
            "4h",
            "8h",
            "12h",
            "1D",
          ],
        });
      });
  }
  getBars(symbolInfo, resolution, periodParams, onResult, onError) {
    this._historyProvider
      .getBars(symbolInfo, resolution, periodParams)
      .then((result) => {
        onResult(result.bars, result.meta);
      })
      .catch(onError);
  }
  subscribeBars(
    symbolInfo,
    resolution,
    onTick,
    listenerGuid,
    onResetCacheNeededCallback
  ) {
    this._dataPulseProvider.subscribeBars(
      symbolInfo,
      resolution,
      onTick,
      listenerGuid
    );
  }
  unsubscribeBars(listenerGuid) {
    this._dataPulseProvider.unsubscribeBars(listenerGuid);
  }
}
