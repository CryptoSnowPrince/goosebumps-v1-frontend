import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BiHelpCircle } from 'react-icons/bi';

const UserTokenPair = () => {
  const [detailShow, setDetailShow] = useState(false);

  return (
    <div className='liquidity-detail p-3 mb-2'>
      <div className='d-flex justify-content-between align-items-center' onClick={() => setDetailShow(!detailShow)} >
        <div className='d-flex flex-column'>
          <div className='d-flex fs-5 align-items-center'>
            <div><BiHelpCircle /> </div>
            <div><BiHelpCircle /> </div>
            <div>DSP/ </div>
            <div>BNB </div>
          </div>
          <div className='fs-6'>300</div>
        </div>
        <div className='hand'>
          {detailShow ? (<svg onClick={() => setDetailShow(false)} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.54986 0.340957L11.3459 5.82296C11.9119 6.46796 11.4519 7.48096 10.5929 7.48096L1.00086 7.48096C0.808619 7.48112 0.620402 7.42587 0.458752 7.32182C0.297101 7.21776 0.168871 7.06932 0.0894145 6.89426C0.0099582 6.71921 -0.0173541 6.52496 0.0107478 6.33478C0.0388497 6.1446 0.121175 5.96655 0.247864 5.82196L5.04386 0.341957C5.13772 0.234548 5.25348 0.148461 5.38335 0.0894776C5.51323 0.0304938 5.65422 -2.28456e-05 5.79686 -2.28581e-05C5.93951 -2.28706e-05 6.0805 0.0304937 6.21037 0.0894775C6.34025 0.148461 6.456 0.234548 6.54986 0.341957L6.54986 0.340957Z" fill="#FBFBFB" />
          </svg>)
            : (<svg onClick={() => setDetailShow(true)} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.04535 7.14L0.249351 1.658C-0.316649 1.013 0.143351 3.67706e-07 1.00235 3.67706e-07H10.5944C10.7866 -0.000164459 10.9748 0.0550878 11.1365 0.159141C11.2981 0.263194 11.4263 0.411637 11.5058 0.586693C11.5853 0.761749 11.6126 0.955998 11.5845 1.14618C11.5564 1.33636 11.474 1.51441 11.3474 1.659L6.55135 7.139C6.45749 7.24641 6.34174 7.3325 6.21186 7.39148C6.08198 7.45046 5.94099 7.48098 5.79835 7.48098C5.65571 7.48098 5.51472 7.45046 5.38484 7.39148C5.25497 7.3325 5.13921 7.24641 5.04535 7.139V7.14Z" fill="#FBFBFB" />
            </svg>)}
        </div>
      </div>
      {detailShow && <div className='mt-4'>
        <hr />
        <div className='d-flex justify-content-between'>
          <div className='d-flex align-items-center'>
            <BiHelpCircle />
            <div style={{ color: "#04C0D7" }}>Pooled DSP</div>
          </div>
          <div style={{ color: "#40FF97" }}>9887.17</div>
        </div>
        <div className='d-flex justify-content-between  mt-2'>
          <div className='d-flex align-items-center'>
            <BiHelpCircle />
            <div style={{ color: "#04C0D7" }}>Pooled BNB</div>
          </div>
          <div style={{ color: "#40FF97" }}>0.10496</div>
        </div>
        <div className='d-flex justify-content-between  mt-2'>
          <div style={{ color: "#04C0D7" }}>
            Share of pool
          </div>
          <div style={{ color: "#40FF97" }}>8.53%</div>
        </div>
        <div className='d-flex justify-content-center mt-3 mb-4'><Link to="/liquidityRemove"><button className='default-btn fs-6'>Remove</button></Link></div>
        <div className='text-center fs-6'>+ Add liquidity instead</div>
      </div>}
    </div>
  );
}

export { UserTokenPair }
