import React, { useState } from 'react';
import { TokenSelectModal } from "./TokenModal"


const LiquidityAddBody = () => {
  const [showTokenSelectModal, setShowTokenSelectModal] = useState();
  const onSelectToken = (token, forTarget) => {
    console.log(token, forTarget)
  }

  return (
    <div className='liquidityAddBody p-4' >
      <div className='d-flex justify-content-between'>
        <div onClick={() => setShowTokenSelectModal("from")} className="hand">
          Select a currency&nbsp;
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.04535 7.14L0.249351 1.658C-0.316649 1.013 0.143351 3.67706e-07 1.00235 3.67706e-07H10.5944C10.7866 -0.000164459 10.9748 0.0550878 11.1365 0.159141C11.2981 0.263194 11.4263 0.411637 11.5058 0.586693C11.5853 0.761749 11.6126 0.955998 11.5845 1.14618C11.5564 1.33636 11.474 1.51441 11.3474 1.659L6.55135 7.139C6.45749 7.24641 6.34174 7.3325 6.21186 7.39148C6.08198 7.45046 5.94099 7.48098 5.79835 7.48098C5.65571 7.48098 5.51472 7.45046 5.38484 7.39148C5.25497 7.3325 5.13921 7.24641 5.04535 7.139V7.14Z" fill="#FBFBFB" />
          </svg>
        </div>
        <div>-</div>
      </div>
      <div className='mt-2 position-relative'><div className='position-absolute' style={{ right: "15px", top: "15px" }}>Max</div><input className='w-100 token-value-input' /></div>
      <div className='d-flex justify-content-center m-4'>+</div>
      <div className='d-flex justify-content-between'>
        <div onClick={() => setShowTokenSelectModal("from")} className="hand">
          Select a currency&nbsp;
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.04535 7.14L0.249351 1.658C-0.316649 1.013 0.143351 3.67706e-07 1.00235 3.67706e-07H10.5944C10.7866 -0.000164459 10.9748 0.0550878 11.1365 0.159141C11.2981 0.263194 11.4263 0.411637 11.5058 0.586693C11.5853 0.761749 11.6126 0.955998 11.5845 1.14618C11.5564 1.33636 11.474 1.51441 11.3474 1.659L6.55135 7.139C6.45749 7.24641 6.34174 7.3325 6.21186 7.39148C6.08198 7.45046 5.94099 7.48098 5.79835 7.48098C5.65571 7.48098 5.51472 7.45046 5.38484 7.39148C5.25497 7.3325 5.13921 7.24641 5.04535 7.139V7.14Z" fill="#FBFBFB" />
          </svg>
        </div>
        <div>-</div>
      </div>
      <div className='mt-2 position-relative'><div className='position-absolute' style={{ right: "15px", top: "15px" }}>Max</div><input className='w-100 token-value-input' /></div>
      <div className='d-flex justify-content-center mt-4'><button className='disable-btn' disabled>Invaild pair</button></div>
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

      <TokenSelectModal showFor={showTokenSelectModal} hide={() => setShowTokenSelectModal()} onSelect={onSelectToken} networkName={"bsctestnet"} />
    </div>
  );
}

export { LiquidityAddBody }
