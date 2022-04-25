import React, { useState } from 'react';

import { LiquidityHeader } from "../../components/LiquidityHeader.js/LiquidityHeader";
import { LiquidityAddBody } from "./LiquidityAddBody"
import { UserLpToken } from "./UserLpToken"
import '../Liquidity/Liquidity.scss'

const LiquidityAdd = () => {
  return (
    <>
      <div id='liquidity' >
        <LiquidityHeader title="Add Liquidity" content="Add liquidity to receive LP tokens" />
        <LiquidityAddBody />

      </div>
      <UserLpToken />
    </>
  );
}

export { LiquidityAdd }
