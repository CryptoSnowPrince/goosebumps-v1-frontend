import { ethers } from "ethers";
import pairAbi from "./abis/pair";
import tokenAbi from "./abis/token";
import { Contract, Provider } from 'ethers-multicall';
import numberHelper from "./numberHelper";

class PairHelper {
    static async getTokenPricescale(pair, network) {
        const provider = new ethers.providers.JsonRpcProvider(network.RPC);
        const ethcallProvider = new Provider(provider);
        await ethcallProvider.init();

        let calls = [];

        const pairContract = new Contract(pair.smartContract.address.address, pairAbi);
        const buyContract = new Contract(pair.buyCurrency.address, tokenAbi);
        const sellContract = new Contract(pair.sellCurrency.address, tokenAbi);
        var ethUsdPairContract = new Contract(network.USD.Pair, pairAbi);

        calls.push(pairContract.getReserves());
        calls.push(buyContract.decimals());
        calls.push(sellContract.decimals());
        calls.push(ethUsdPairContract.getReserves());

        const [reserves, buyDecimals, sellDecimals, ethUsdReserves] = await ethcallProvider.all(calls);

        let price = this.formatUnits(reserves._reserve1, sellDecimals) / this.formatUnits(reserves._reserve0, buyDecimals)
        if (network.USDs.find(x => x.toLowerCase() === pair.buyCurrency.address) && price > 2) {
            price = 1 / price;
        }
        if (pair.sellCurrency.address === network.Currency.Address) {
            price *= this.formatUnits(ethUsdReserves._reserve1, network.USD.Decimals) / this.formatUnits(ethUsdReserves._reserve0, network.Currency.Decimals);
        }

        return numberHelper.calculatePricescale(price);
    }

    static async getTokenInfos(pairs, network, addresses = []) {
        const provider = new ethers.providers.JsonRpcProvider(network.RPC);
        const ethcallProvider = new Provider(provider);
        await ethcallProvider.init();

        let calls = [];

        pairs.map(pair => {

            const pairContract = new Contract(pair.smartContract.address.address, pairAbi);
            const buyContract = new Contract(pair.buyCurrency.address, tokenAbi);
            const sellContract = new Contract(pair.sellCurrency.address, tokenAbi);

            calls.push(pairContract.getReserves());
            calls.push(buyContract.decimals());
            calls.push(sellContract.decimals());
            calls.push(buyContract.balanceOf("0x000000000000000000000000000000000000dEaD"));
            calls.push(buyContract.totalSupply());
            calls.push(pairContract.token0());
            addresses.map(address => {
                calls.push(buyContract.balanceOf(ethers.utils.getAddress(address)));
                return address;
            });

            return pair;
        });


        var ethUsdPairContract = new Contract(network.USD.Pair, pairAbi);
        calls.push(ethUsdPairContract.getReserves());

        let responses = await ethcallProvider.all(calls);
        const ethUsdReserves = responses[responses.length - 1];

        let result = {
            infos: [],
            ethPrice: this.formatUnits(ethUsdReserves._reserve1, network.USD.Decimals) / this.formatUnits(ethUsdReserves._reserve0, network.Currency.Decimals)
        };

        const callCounts = 5 + addresses.length;

        pairs.map((pair, index) => {
            const isETH = pair.sellCurrency.address === network.Currency.Address || pair.buyCurrency.address === network.Currency.Address;
            const isUSD = network.USDs.find(x => x.toLowerCase() === pair.buyCurrency.address) || (network.USDs.find(x => x.toLowerCase() === pair.sellCurrency.address));
            const reserves = responses[index * callCounts];
            const buyDecimals = responses[index * callCounts + 1];
            const sellDecimals = responses[index * callCounts + 2];
            const deadBalance = this.formatUnits(responses[index * callCounts + 3], buyDecimals);
            const supply = this.formatUnits(responses[index * callCounts + 4], buyDecimals);
            const circulationSupply = supply - deadBalance;
            var token0 = responses[index * callCounts + 5];
            const lp = this.formatUnits(reserves._reserve1, sellDecimals);

            if (token0.toLowerCase() === pair.sellCurrency.address) {
                var price = this.formatUnits(reserves._reserve0, sellDecimals) / this.formatUnits(reserves._reserve1, buyDecimals);
            }
            else {
                var price = this.formatUnits(reserves._reserve1, buyDecimals) / this.formatUnits(reserves._reserve0, sellDecimals);
            }

            if (!(isETH && isUSD) && isUSD) {
                price = 1 / price;

            }

            const marketCap = circulationSupply * price;
            if (addresses) {
                let balance = 0;
                for (let i = 0; i < addresses.length; i++) {
                    balance += this.formatUnits(responses[index * callCounts + 5 + i], buyDecimals);
                }
                result.infos.push({
                    token: pair.buyCurrency.address,
                    supply: {
                        total: supply,
                        circulation: circulationSupply
                    },
                    price: price,
                    marketCap: marketCap,
                    isETH: isETH,
                    lp: lp,
                    balance: balance
                });
            }
            else {
                result.infos.push({
                    token: pair.buyCurrency.address,
                    supply: {
                        total: supply,
                        circulation: circulationSupply
                    },
                    price: price,
                    marketCap: marketCap,
                    isETH: isETH,
                    lp: lp
                });
            }

            return pair;
        });

        return result;
    }

    static async getTokenInfo(pair, network) {
        const tokenInfos = await this.getTokenInfos([pair], network);
        return Object.assign({
            ethPrice: tokenInfos.ethPrice
        }, tokenInfos.infos[0]);
    }

    static formatUnits(value, decimals) {
        return parseFloat(ethers.utils.formatUnits(value, decimals));
    }

    //subscribeSwaps(callback) {
    //    this.pair.on("Swap", async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
    //        if (amount0In > amount1In) {
    //            const ethPrice = await this.getETHPrice();
    //            callback({
    //                price: (this.formatUnits(amount1Out, this.token1.decimals) * ethPrice) / this.formatUnits(amount0In, this.token1.decimals),
    //                tokens: this.formatUnits(amount0In, this.token0.decimals),
    //                value: (this.formatUnits(amount1Out, this.token1.decimals) * ethPrice),
    //                time: new Date(),
    //                tx: event.transactionHash
    //            });

    //        }
    //        else {
    //            const ethPrice = await this.getETHPrice();
    //            callback({
    //                price: (this.formatUnits(amount1In, this.token1.decimals) * ethPrice) / this.formatUnits(amount0Out, this.token0.decimals),
    //                tokens: this.formatUnits(amount0Out, this.token0.decimals),
    //                value: (this.formatUnits(amount1In, this.token1.decimals) * ethPrice),
    //                time: new Date(),
    //                tx: event.transactionHash
    //            });
    //        }
    //    });
    //}
}

export default PairHelper;