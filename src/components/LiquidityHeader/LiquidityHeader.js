import React from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { Link } from 'react-router-dom';

const LiquidityHeader = ({ title, content, back = true }) => {
  return (
    <div className='liquidityHeader p-3 d-flex justify-content-between'>
      <div className='align-items-center d-flex title'>{back && <Link to="/liquidity"><AiOutlineArrowLeft /></Link>}&nbsp;{title}</div>
      <div className='mt-2'><small>{content}</small></div>
    </div>
  );
}

export { LiquidityHeader }
