import React, { useState } from 'react';
import { BiHelpCircle } from 'react-icons/bi';
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";

import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { UserLpToken } from "../LiquidityAdd/UserLpToken"
import { TokenSelectModal } from "../LiquidityAdd/TokenModal"
import '../Liquidity/Liquidity.scss'

const LiquidityRemove = () => {
  const [amount, setAmount] = useState(50);
  const [detailed, setDetailed] = useState(false);
  const [showTokenSelectModal, setShowTokenSelectModal] = useState();
  const onSelectToken = (token, forTarget) => {
    console.log(token, forTarget)
  }

  return (
    <>
      <div id='liquidity' >
        <LiquidityHeader title="Remove DSP-TRM liquidity" content="To receive DSP and TRM"></LiquidityHeader>
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
                    <div>TRM </div>
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
            <div className='mt-3'>
              <div className='d-flex justify-content-between'>
                <div>DSP:WTRM</div>
                <div>Balance: 300</div>
              </div>
              <div className='mt-2 position-relative'><div className='position-absolute' style={{ right: "15px", top: "15px" }}>Max</div><input className='w-100 token-value-input' /></div>
            </div>
            <>
              <div className='mt-4 d-flex justify-content-between'>
                <div onClick={() => setShowTokenSelectModal("from")} className="hand">
                  Select a currency&nbsp;
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.04535 7.14L0.249351 1.658C-0.316649 1.013 0.143351 3.67706e-07 1.00235 3.67706e-07H10.5944C10.7866 -0.000164459 10.9748 0.0550878 11.1365 0.159141C11.2981 0.263194 11.4263 0.411637 11.5058 0.586693C11.5853 0.761749 11.6126 0.955998 11.5845 1.14618C11.5564 1.33636 11.474 1.51441 11.3474 1.659L6.55135 7.139C6.45749 7.24641 6.34174 7.3325 6.21186 7.39148C6.08198 7.45046 5.94099 7.48098 5.79835 7.48098C5.65571 7.48098 5.51472 7.45046 5.38484 7.39148C5.25497 7.3325 5.13921 7.24641 5.04535 7.139V7.14Z" fill="#FBFBFB" />
                  </svg>
                </div>
                <div>-</div>
              </div>
              <div className='mt-2 position-relative'><div className='position-absolute' style={{ right: "15px", top: "15px" }}>Max</div><input className='w-100 token-value-input' /></div>
            </>
            <>
              <div className='mt-4 d-flex justify-content-between'>
                <div onClick={() => setShowTokenSelectModal("from")} className="hand">
                  Select a currency&nbsp;
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.04535 7.14L0.249351 1.658C-0.316649 1.013 0.143351 3.67706e-07 1.00235 3.67706e-07H10.5944C10.7866 -0.000164459 10.9748 0.0550878 11.1365 0.159141C11.2981 0.263194 11.4263 0.411637 11.5058 0.586693C11.5853 0.761749 11.6126 0.955998 11.5845 1.14618C11.5564 1.33636 11.474 1.51441 11.3474 1.659L6.55135 7.139C6.45749 7.24641 6.34174 7.3325 6.21186 7.39148C6.08198 7.45046 5.94099 7.48098 5.79835 7.48098C5.65571 7.48098 5.51472 7.45046 5.38484 7.39148C5.25497 7.3325 5.13921 7.24641 5.04535 7.139V7.14Z" fill="#FBFBFB" />
                  </svg>
                </div>
                <div>-</div>
              </div>
              <div className='mt-2 position-relative'><div className='position-absolute' style={{ right: "15px", top: "15px" }}>Max</div><input className='w-100 token-value-input' /></div>
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
