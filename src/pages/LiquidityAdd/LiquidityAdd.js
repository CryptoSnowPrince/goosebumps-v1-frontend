import React from 'react';
import '../Liquidity/Liquidity.scss'
import { useSelector } from 'react-redux';
import { LiquidityAddBody } from "./LiquidityAddBody"
import * as selector from '../../store/selectors';
import networks from '../../networks.json'

const LiquidityAdd = () => {
  const chainIndex = useSelector(selector.chainIndex);
  return (
    <>
      <LiquidityAddBody network={networks[chainIndex]} />
    </>
  );
}

export { LiquidityAdd }
