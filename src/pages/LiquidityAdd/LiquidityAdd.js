import React, { useState } from 'react';

import Submenu from '../../components/Submenu/Submenu'
import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { LiquidityAddBody } from "./LiquidityAddBody"
import { UserLpToken } from "./UserLpToken"
import '../Liquidity/Liquidity.scss'

const LiquidityAdd = () => {
  return (
    <>
      <Submenu />
      <div id='liquidity' >
        <LiquidityHeader title="Add Liquidity" content="Add liquidity to receive LP tokens" />
        <LiquidityAddBody />

      </div>
      <UserLpToken />
    </>
  );
}

export { LiquidityAdd }
