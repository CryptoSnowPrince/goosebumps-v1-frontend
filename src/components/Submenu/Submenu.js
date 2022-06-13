import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import "./Submenu.scss"

const Submenu = () => {
  const { pathname } = useLocation();
  return (
    <div className='d-flex justify-content-center mb-4' id="swap_staking_farms">
      <Link className={`nav-link mx-3 mx-xl-4 ${pathname === '/stake' ? "active" : ""}`} to="/stake">Staking</Link>
      <Link className={`nav-link mx-3 mx-xl-4 ${pathname === '/farms' ? "active" : ""}`} to="/farms">Farms</Link>
    </div>
  );
}

export default Submenu;