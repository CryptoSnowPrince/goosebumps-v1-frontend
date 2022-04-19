import React from 'react';
import { Link } from 'react-router-dom';

import "./Submenu.scss"

const Submenu = () => {
  return (
    <div className='d-flex justify-content-center' id="swap_staking_farms">
      <Link className="nav-link mx-3 mx-xl-4" to="/swap">Swap</Link>
      <Link className="nav-link mx-3 mx-xl-4 active" to="/stake">Staking</Link>
      <Link className="nav-link mx-3 mx-xl-4" to="/farms">Farms</Link>
    </div>
  );
}

export default Submenu;