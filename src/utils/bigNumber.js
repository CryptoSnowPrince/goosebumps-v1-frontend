import BigNumber from 'bignumber.js'
// import { ethers } from 'ethers'

export const BIG_ZERO = new BigNumber(0)
export const BIG_ONE = new BigNumber(1)
export const BIG_NINE = new BigNumber(9)
export const BIG_TEN = new BigNumber(10)

export const ethersToSerializedBigNumber = (ethersBn) =>
  ethersToBigNumber(ethersBn).toJSON()

export const ethersToBigNumber = (ethersBn) => new BigNumber(ethersBn.toString())
