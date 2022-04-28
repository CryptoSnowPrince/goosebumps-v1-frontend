import React from 'react';
import { useSelector } from 'react-redux';
import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { LiquidityAddBody } from "./LiquidityAddBody"
import { UserLpToken } from "./UserLpToken"
import '../Liquidity/Liquidity.scss'
import * as selector from '../../store/selectors';
import networks from '../../networks.json'

const LiquidityAdd = () => {
  const chainIndex = useSelector(selector.chainIndex);
  return (
    <>
      <div className="dex">
        <DEXSubmenu />
        <div id='liquidity' >
          <LiquidityHeader title="Add Liquidity" content="Add liquidity to receive LP tokens" />
          <LiquidityAddBody network={networks[chainIndex]} />
        </div>
        <UserLpToken />
      </div>
    </>
  );
}

export { LiquidityAdd }
