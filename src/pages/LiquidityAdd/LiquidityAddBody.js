import React, { useState } from 'react';
import { TokenSelectModal } from "./TokenModal"


const LiquidityAddBody = () => {
  const [showTokenSelectModal, setShowTokenSelectModal] = useState();
  const onSelectToken = (token, forTarget) => {
    console.log(token, forTarget)
  }

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
                <button type="button" className="w-100 text-end badge btn text-white">Balance: 0.0</button>
              </div>
            </div>
            <div className="input-group">
              <input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" min="0" value={0} />
              <div className="input-group-addon">
                <button type="button" className="default-btn" onClick={() => setShowTokenSelectModal("from")}>BNB</button>
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
                <button type="button" className="w-100 text-end badge btn text-white">Balance: 0.0</button>
              </div>
            </div>
            <div className="input-group">
              <input id="from" type="text" className="form-control me-2" placeholder="0" autoComplete="off" min="0" value={0} />
              <div className="input-group-addon">
                <button type="button" className="default-btn" onClick={() => setShowTokenSelectModal("from")}>BNB</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-center mt-4'><button className='disable-btn' disabled>Invaild pair</button></div>
      <div className='mt-4 mb-4'>prices and pool share</div>
      <div className='d-flex justify-content-around'>
        <div className='text-center'>
          <div>1085.91</div>
          <div>DSP per TRM</div>
        </div>
        <div className='text-center'>
          <div>0.000920886</div>
          <div>TRM per DSP</div>
        </div>
        <div className='text-center'>
          <div>9%</div>
          <div>Share of Pool</div>
        </div>
      </div>
      <div className='d-flex justify-content-center mt-4'><button className='default-btn'>Enter an amount</button></div>

      <TokenSelectModal showFor={showTokenSelectModal} hide={() => setShowTokenSelectModal()} onSelect={onSelectToken} networkName={"bsctestnet"} />
    </div>
  );
}

export { LiquidityAddBody }
