import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import "./Submenu.scss"

const DEXSubmenu = () => {
  const { pathname } = useLocation();
  return (
    <div className='d-flex justify-content-center mb-4' id="swap_staking_farms">
      <Link className={`nav-link mx-3 mx-xl-4 ${pathname === '/dex' ? "active" : ""}`} to="/dex">Exchange</Link>
      <Link className={`nav-link mx-3 mx-xl-4 ${(pathname === '/liquidity' || pathname === '/liquidityAdd' || pathname.indexOf('/liquidityRemove') !== -1 || pathname === '/liquidityFindToken') ? "active" : ""}`} to="/liquidity">Liquidity</Link>
    </div>
  );
}

export default DEXSubmenu;