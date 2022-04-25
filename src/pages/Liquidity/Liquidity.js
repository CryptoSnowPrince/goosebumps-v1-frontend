import React, { useState } from 'react';

import { LiquidityHeader } from "../../components/LiquidityHeader/LiquidityHeader";
import { LiquidityBody } from "./LiquidityBody";
import './Liquidity.scss'

const Liquidity = () => {
  const walletConnectStatus = true;
  const userLiquidityFound = true;
  return (
    <div id='liquidity' >
      <LiquidityHeader title="Your Liquidity" content="Remove liquidity to receive tokens back" back={false}></LiquidityHeader>
      <LiquidityBody walletConnectStatus={walletConnectStatus} userLiquidityFound={userLiquidityFound}></LiquidityBody>
    </div>
  );
}

export { Liquidity }
