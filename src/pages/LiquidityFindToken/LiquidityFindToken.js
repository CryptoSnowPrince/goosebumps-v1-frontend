import React, { useState } from 'react';
import { BiHelpCircle } from 'react-icons/bi';
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";

import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { UserLpToken } from "../LiquidityAdd/UserLpToken"
import { TokenSelectModal } from "../LiquidityAdd/TokenModal"
import '../Liquidity/Liquidity.scss'

const LiquidityFindToken = () => {
  const [amount, setAmount] = useState(50);
  const [showTokenSelectModal, setShowTokenSelectModal] = useState();
  const onSelectToken = (token, forTarget) => {
    console.log(token, forTarget)
  }

  return (
    <>
      <div className="dex">
        <DEXSubmenu />
        <div id='liquidity' >
          <LiquidityHeader title="Import Poll" content="Import an existing pool"></LiquidityHeader>
          <div className='liquidityfindtoken-body p-4'>
            <div className='wallet-tabs mt-4'>
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
            <div className='wallet-tabs mt-4'>
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
            <div className='mt-5 text-center'>
              You don't have liquidity in this pool yet.
            </div>
            <div className='d-flex justify-content-center mt-3'> <button className='default-btn'>Add Liquidity</button></div>
          </div>
        </div>
        <TokenSelectModal showFor={showTokenSelectModal} hide={() => setShowTokenSelectModal()} onSelect={onSelectToken} networkName={"bsctestnet"} />
      </div>
    </>
  );
}

export { LiquidityFindToken }
