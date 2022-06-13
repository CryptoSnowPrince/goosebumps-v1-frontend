
class numberHelper {
    static calculatePricescale(price, plus = 4) {
        const match = price.toFixed(14).toString().match(/^0.[0]+/);
        if (match) {
            return match[0].length + plus - 2; // -2 for "0."
        }

        return plus;
    }

    static calculateTokenscale(price) {
        let pricescale = 3 - this.calculatePricescale(price, 0);
        if (pricescale <= 0) {
            pricescale = 0;
        }

        return pricescale;
    }
}

export default numberHelper;