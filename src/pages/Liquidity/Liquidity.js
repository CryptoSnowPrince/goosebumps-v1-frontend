import React from 'react';

import DEXSubmenu from '../../components/Submenu/DEXSubmenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { LiquidityBody } from "./LiquidityBody";
import './Liquidity.scss'

const Liquidity = () => {
  return (
    <>
      <div className="dex">
        <DEXSubmenu />
        <div id='liquidity' >
          <LiquidityHeader
            title="Your Liquidity"
            content="Remove liquidity to receive tokens back"
            back={false} />
          <LiquidityBody />
        </div>
      </div>
    </>
  );
}

export { Liquidity }
