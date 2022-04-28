import React, { useState, useEffect } from 'react';
import { TokenSelectModal } from "./TokenModal"
import Web3 from 'web3';
import { /*singer, */ethers, BigNumber } from 'ethers';
import { useSelector } from 'react-redux';
import * as selector from '../../store/selectors';
import networks from '../../networks.json'


const LiquidityAddBody = () => {

  const account = useSelector(selector.accountState);
  const provider = useSelector(selector.providerState);
  const web3Provider = useSelector(selector.web3ProviderState);

  const chainIndex = useSelector(selector.chainIndex);

  const [tokenA, setTokenA] = useState({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 });
  const [tokenB, setTokenB] = useState({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 });

  const [showTokenSelectModal, setShowTokenSelectModal] = useState();
  const onSelectToken = (token, forTarget) => {
    console.log(token, forTarget)
  }

  useEffect(() => {
		setTokenA({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 })
		setTokenB({ symbol: "", address: "", decimals: 0, amount: 0, balance: 0 })
    console.log("chainIndex: ", chainIndex);
    console.log("account: ", account);
	}, [chainIndex, account])

  return (
    <div className='liquidityAddBody p-4' >
      <div className='wallet-tabs'>
        <div className='tab_content p-0'>
          <div className="form-group">
            <div className="row justify-content-between">
              <div className="col">
                <label htmlFor="from" className="w-100">From</label>
              </div>
              <div className="col text-end">
                <button type="button" className="w-100 text-end badge btn text-white">
                  Balance: 0.0
                </button>
              </div>
            </div>
            <div className="input-group">
              <input id="from" type="text" className="form-control me-2"
                placeholder="0" autoComplete="off" min="0" value={0} />
              <div className="input-group-addon">
                <button type="button" className="default-btn"
                  onClick={() => setShowTokenSelectModal("from")}>
                  {tokenA.symbol ? tokenA.symbol : "Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-center m-4'>+</div>
      <div className='wallet-tabs'>
        <div className='tab_content p-0'>
          <div className="form-group">
            <div className="row justify-content-between">
              <div className="col">
                <label htmlFor="from" className="w-100">From</label>
              </div>
              <div className="col text-end">
                <button type="button" className="w-100 text-end badge btn text-white">
                  Balance: 0.0
                </button>
              </div>
            </div>
            <div className="input-group">
              <input id="from" type="text" className="form-control me-2"
                placeholder="0" autoComplete="off" min="0" value={0} />
              <div className="input-group-addon">
                <button type="button" className="default-btn"
                  onClick={() => setShowTokenSelectModal("from")}>
                  {tokenB.symbol ? tokenB.symbol : "Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-center mt-4'>
        <button className='disable-btn' disabled>
          Invaild pair
        </button></div>
      <div className='mt-4 mb-4'>prices and pool share</div>
      <div className='d-flex justify-content-around'>
        <div className='text-center'>
          <div>1085.91</div>
          <div>DSP per BNB</div>
        </div>
        <div className='text-center'>
          <div>0.000920886</div>
          <div>BNB per DSP</div>
        </div>
        <div className='text-center'>
          <div>9%</div>
          <div>Share of Pool</div>
        </div>
      </div>
      <div className='d-flex justify-content-center mt-4'><button className='default-btn'>Enter an amount</button></div>

      <TokenSelectModal
        showFor={showTokenSelectModal}
        hide={() => setShowTokenSelectModal()}
        onSelect={onSelectToken}
        networkName={networks[chainIndex].Name} />
    </div>
  );
}

export { LiquidityAddBody }
