import React, { useState } from 'react';
import { BiHelpCircle } from 'react-icons/bi';
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";

import Submenu from '../../components/Submenu/Submenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { UserLpToken } from "../LiquidityAdd/UserLpToken"
import { TokenSelectModal } from "../LiquidityAdd/TokenModal"
import '../Liquidity/Liquidity.scss'

const LiquidityRemove = () => {
  const [amount, setAmount] = useState(50);
  const [detailed, setDetailed] = useState(true);
  const [showTokenSelectModal, setShowTokenSelectModal] = useState();
  const onSelectToken = (token, forTarget) => {
    console.log(token, forTarget)
  }

  return (
    <>
      <Submenu />
      <div id='liquidity' >
        <LiquidityHeader title="Remove DSP-BNB liquidity" content="To receive DSP and BNB"></LiquidityHeader>
        <div className='p-3 mt-4'>
          <div>
            <div className='d-flex justify-content-between'>
              <div>Amount</div>
              <div className='hand' onClick={() => setDetailed(!detailed)}>Detailed</div>
            </div>
            {detailed &&
              <>
                <div className='fs-4 mt-3 mb-3'>25%</div>
                <div>
                  <InputRange
                    step={1}
                    maxValue={100}
                    minValue={0}
                    value={amount}
                    onChange={(value) => {
                      setAmount(value);
                    }}
                  />
                </div>
                <div className='mt-3 mb-3 d-flex justify-content-around gap-2'>
                  <button className='default-btn'>25%</button>
                  <button className='default-btn'>50%</button>
                  <button className='default-btn'>75%</button>
                  <button className='default-btn'>Max</button>
                </div>
              </>
            }
          </div>
          {detailed &&
            <div className='mt-4'>
              <div>YOU WILL RECEIVE</div>
              <div className='flex justify-content-between'>
                <div className='mt-2 d-flex justify-content-between'>
                  <div className='d-flex fs-5 align-items-center'>
                    <div><BiHelpCircle /> </div>
                    <div>BNB </div>
                  </div>
                  <div style={{ color: "#40FF97" }}>9887.17</div>
                </div>
                <div className='mt-2 d-flex justify-content-between'>
                  <div className='d-flex fs-5 align-items-center'>
                    <div><BiHelpCircle /> </div>
                    <div>DSP </div>
                  </div>
                  <div style={{ color: "#40FF97" }}>9887.17</div>
                </div>
              </div>
            </div>
          }
          {!detailed && <>
            <div className='wallet-tabs mt-3'>
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
            <>
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
            </>
            <>
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
            </>
          </>}
          <hr />
          <div>
            <div>PRICE</div>
            <div className='flex justify-content-between'>
              <div className='mt-2 d-flex justify-content-between'>
                <div className='d-flex fs-5 align-items-center'>
                  1 DSP =
                </div>
                <div style={{ color: "#40FF97" }}>9887.17</div>
              </div>
              <div className='mt-2 d-flex justify-content-between'>
                <div className='d-flex fs-5 align-items-center'>
                  1 DSP =
                </div>
                <div style={{ color: "#40FF97" }}>9887.17</div>
              </div>
            </div>
          </div>
          <hr />
          <div className='mt-5 d-flex justify-content-around gap-2'>
            <button className='default-btn w-50'>Enable</button>
            <button className='default-btn w-50'>Remove</button>
          </div>
        </div>
      </div>
      <UserLpToken />
      <TokenSelectModal showFor={showTokenSelectModal} hide={() => setShowTokenSelectModal()} onSelect={onSelectToken} networkName={"bsctestnet"} />
    </>
  );
}

export { LiquidityRemove }
