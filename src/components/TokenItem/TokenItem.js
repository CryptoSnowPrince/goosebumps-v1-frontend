import React, { useState } from 'react';
import { BiHelpCircle } from 'react-icons/bi';

import "./TokenItem.scss"

const TokenItem = ({ showMode }) => {
  const [detailShow, setDetailShow] = useState(false);
  return (
    <>
      {!showMode ? (
        <>
          <div className={`d-flex justify-content-between mt-3  py-2 px-2 px-md-3 px-lg-4 first align-items-center ${detailShow ? `top-border` : `top-bottom-border`}`}>
            <div className='d-flex justify-content-between align-items-center '>
              <div className='token-avatar'></div>
              <div>
                <div className='title'>Goose-BNB</div>
                <div className='title1'>Automatic Restaking</div>
              </div>
            </div>
            <div className='d-none d-lg-block'>
              <div className='profit'>Recent CAKE profit</div>
              <div className='token-amount'>0.0</div>
              <div className='token-value'>0 USD</div>
            </div>
            <div className='d-none d-md-block'>
              <div className='profit'>IFO Credit </div>
              <div className='token-amount'>0.0</div>
              <div className='token-value'>0 USD</div>
            </div>
            <div>
              <div>APR</div>
              <div className='d-flex align-items-center'>
                <div style={{ color: "#51FFA1" }} className="apr">63.50% &nbsp;</div>
                <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="0.5" width="11" height="12" stroke="#C4C4C4" />
                  <path d="M3.79485 6.67288V2.79053H4.67567V6.67288H3.79485ZM2.29408 5.17212V4.29129H6.17644V5.17212H2.29408Z" fill="#C4C4C4" />
                  <path d="M5.52938 8.61401V9.26107H2.94115V8.61401H5.52938Z" fill="#C4C4C4" />
                  <path d="M6.75909 5.03875L9.20527 2.59257L9.76026 3.14755L7.31408 5.59373L6.75909 5.03875ZM6.75909 3.14755L7.31408 2.59257L9.76026 5.03875L9.20527 5.59373L6.75909 3.14755Z" fill="#C4C4C4" />
                  <path d="M6.82349 8.80954V7.9668H10.0588V8.80954H6.82349ZM6.82349 10.555V9.71229H10.0588V10.555H6.82349Z" fill="#C4C4C4" />
                </svg>
              </div>
            </div>
            <div className='d-none d-sm-block'>
              <div>Total Staked</div>
              <div style={{ color: "#04C0D7" }}>26,311,209 CAKE</div>
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
          {detailShow && <div className='d-flex align-items-stretch justify-content-between  p-4 second  bottom-border gap-3 gap-md-4 gap-lg-4  flex-column flex-md-row'>
            <div className='one'>
              <div>See Token Info &nbsp;
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2V6M14 2H10H14ZM14 2L8 8L14 2Z" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M14 8.66667V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H7.33333" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
              <div>View Project site &nbsp;
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2V6M14 2H10H14ZM14 2L8 8L14 2Z" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M14 8.66667V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H7.33333" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
              <div>View Contract &nbsp;
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2V6M14 2H10H14ZM14 2L8 8L14 2Z" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M14 8.66667V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H7.33333" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
              <button className='mt-2'>
                <svg width="20" height="20" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.4167 7L11.9933 5.3725L12.1917 3.22L10.0858 2.74167L8.98334 0.875L7.00001 1.72667L5.01668 0.875L3.91418 2.73583L1.80834 3.20833L2.00668 5.36667L0.583344 7L2.00668 8.6275L1.80834 10.7858L3.91418 11.2642L5.01668 13.125L7.00001 12.2675L8.98334 13.1192L10.0858 11.2583L12.1917 10.78L11.9933 8.6275L13.4167 7ZM5.88584 9.75333L3.66918 7.53083L4.53251 6.6675L5.88584 8.02667L9.29834 4.6025L10.1617 5.46583L5.88584 9.75333Z" fill="#04C0D7" />
                </svg>&nbsp;
                Core</button>
            </div>
            <div className='two p-3 p-md-4'>

              <div className='d-flex gap-4 justify-content-between'>
                <div style={{ flex: 1 }} className='d-flex flex-column justify-content-between'>
                  <div>Recent Cake Profit</div>
                  <div>0</div>
                </div>
                <div style={{ flex: 1 }}>
                  <br />
                  <button className='mt-2 w-100 default-btn'>Harvest</button>
                </div>
              </div>
            </div>
            <div className='three p-4 p-md-4'>
              <div>Start Farming</div>
              <div className='mt-2'>
                <button className='w-100 default-btn'>Connect Wallet</button>
              </div>
            </div>
          </div>
          }
        </>)
        : (<>
          <div className='col-lg-4 col-md-6 col-xs-12 col-sm-12 p-2'>
            <div className={`third p-4 ${detailShow ? `top-border` : `top-bottom-border`}`}>
              <div className='d-flex justify-content-between align-items-center '>
                <div style={{ width: "50px", height: "50px", backgroundColor: "#04C0D7", borderRadius: "50%", "marginRight": "20px" }}></div>
                <div className='title'>
                  Goose-BNB
                </div>
              </div>
              <div className='d-flex align-items-center justify-content-end '>
                <button className='mx-2'>
                  <svg width="20" height="20" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.4167 7L11.9933 5.3725L12.1917 3.22L10.0858 2.74167L8.98334 0.875L7.00001 1.72667L5.01668 0.875L3.91418 2.73583L1.80834 3.20833L2.00668 5.36667L0.583344 7L2.00668 8.6275L1.80834 10.7858L3.91418 11.2642L5.01668 13.125L7.00001 12.2675L8.98334 13.1192L10.0858 11.2583L12.1917 10.78L11.9933 8.6275L13.4167 7ZM5.88584 9.75333L3.66918 7.53083L4.53251 6.6675L5.88584 8.02667L9.29834 4.6025L10.1617 5.46583L5.88584 9.75333Z" fill="#04C0D7" />
                  </svg>&nbsp;
                  Core</button>
                <button className='multi-reward-button'>40X</button>
              </div>
              <div className='d-flex justify-content-between align-items-center mt-4'>
                <div>APR</div>
                <div className='d-flex align-items-center'>
                  <div>35.01% &nbsp;</div>
                  <svg width="15" height="16" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="11" height="12" stroke="#C4C4C4" />
                    <path d="M3.79485 6.67288V2.79053H4.67567V6.67288H3.79485ZM2.29408 5.17212V4.29129H6.17644V5.17212H2.29408Z" fill="#C4C4C4" />
                    <path d="M5.52938 8.61401V9.26107H2.94115V8.61401H5.52938Z" fill="#C4C4C4" />
                    <path d="M6.75909 5.03875L9.20527 2.59257L9.76026 3.14755L7.31408 5.59373L6.75909 5.03875ZM6.75909 3.14755L7.31408 2.59257L9.76026 5.03875L9.20527 5.59373L6.75909 3.14755Z" fill="#C4C4C4" />
                    <path d="M6.82349 8.80954V7.9668H10.0588V8.80954H6.82349ZM6.82349 10.555V9.71229H10.0588V10.555H6.82349Z" fill="#C4C4C4" />
                  </svg>
                </div>
              </div>
              <div className='d-flex justify-content-between align-items-center mt-2'>
                <div>Earn</div>
                <div>CAKE+Fees</div>
              </div>
              <div className='mt-2'>Cake Earned</div>
              <div className='mt-2 d-flex justify-content-between align-items-center'>
                <div>0.000</div>
                <button className='w-75 default-btn one'>Harvest</button>
              </div>
              <div className='mt-2'>Goos-BNB LP Staked</div>
              <button className='mt-2 w-100 default-btn two'>Connect Wallet</button>
              <div className='mt-4 d-flex justify-content-center align-items-center '>
                <div>Hide&nbsp;</div>
                <div className='hand'>
                  {detailShow ? (<svg onClick={() => setDetailShow(false)} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.54986 0.340957L11.3459 5.82296C11.9119 6.46796 11.4519 7.48096 10.5929 7.48096L1.00086 7.48096C0.808619 7.48112 0.620402 7.42587 0.458752 7.32182C0.297101 7.21776 0.168871 7.06932 0.0894145 6.89426C0.0099582 6.71921 -0.0173541 6.52496 0.0107478 6.33478C0.0388497 6.1446 0.121175 5.96655 0.247864 5.82196L5.04386 0.341957C5.13772 0.234548 5.25348 0.148461 5.38335 0.0894776C5.51323 0.0304938 5.65422 -2.28456e-05 5.79686 -2.28581e-05C5.93951 -2.28706e-05 6.0805 0.0304937 6.21037 0.0894775C6.34025 0.148461 6.456 0.234548 6.54986 0.341957L6.54986 0.340957Z" fill="#FBFBFB" />
                  </svg>)
                    : (<svg onClick={() => setDetailShow(true)} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.04535 7.14L0.249351 1.658C-0.316649 1.013 0.143351 3.67706e-07 1.00235 3.67706e-07H10.5944C10.7866 -0.000164459 10.9748 0.0550878 11.1365 0.159141C11.2981 0.263194 11.4263 0.411637 11.5058 0.586693C11.5853 0.761749 11.6126 0.955998 11.5845 1.14618C11.5564 1.33636 11.474 1.51441 11.3474 1.659L6.55135 7.139C6.45749 7.24641 6.34174 7.3325 6.21186 7.39148C6.08198 7.45046 5.94099 7.48098 5.79835 7.48098C5.65571 7.48098 5.51472 7.45046 5.38484 7.39148C5.25497 7.3325 5.13921 7.24641 5.04535 7.139V7.14Z" fill="#FBFBFB" />
                    </svg>)}
                </div>
              </div>
            </div>
            {detailShow && <div className='fourth p-4  bottom-border'>
              <div className='d-flex justify-content-between align-items-center '>
                <div>Total Staked</div>
                <div>26,198,395 Cake <BiHelpCircle />    </div>
              </div>
              <div className='d-flex justify-content-between align-items-center '>
                <div>Perfomance Fee</div>
                <div>2%</div>
              </div>
              <div className='d-flex flex-column detail'>
                <div className='align-items-center d-flex justify-content-end'>See Token Info &nbsp;
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2V6M14 2H10H14ZM14 2L8 8L14 2Z" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M14 8.66667V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H7.33333" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
                <div className='align-items-center d-flex justify-content-end'>View Project site &nbsp;
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2V6M14 2H10H14ZM14 2L8 8L14 2Z" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M14 8.66667V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H7.33333" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
                <div className='align-items-center d-flex justify-content-end'>View Contract &nbsp;
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2V6M14 2H10H14ZM14 2L8 8L14 2Z" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M14 8.66667V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H7.33333" stroke="#04C0D7" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
              </div>
            </div>}
          </div>
        </>)
      }
    </>
  );
}

export default TokenItem;