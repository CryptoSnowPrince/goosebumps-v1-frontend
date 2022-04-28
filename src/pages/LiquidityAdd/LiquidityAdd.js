import React from 'react';

import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { LiquidityAddBody } from "./LiquidityAddBody"
import { UserLpToken } from "./UserLpToken"
import '../Liquidity/Liquidity.scss'

const LiquidityAdd = () => {
  return (
    <>
      <div className="dex">
        <DEXSubmenu />
        <div id='liquidity' >
          <LiquidityHeader title="Add Liquidity" content="Add liquidity to receive LP tokens" />
          <LiquidityAddBody />
        </div>
        <UserLpToken />
      </div>
    </>
  );
}

export { LiquidityAdd }
