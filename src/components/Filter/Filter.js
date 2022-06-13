import React from 'react';
import { FaSearch } from 'react-icons/fa';

import "./Filter.scss"

const Filter = () => {
  return (
    <div id='Filter' className='d-flex gap-3 justify-content-end flex-column flex-sm-row align-items-end'>
      <div className='mt-2 mt-lg-0'>
        <div >Sort by</div>
        <div >
          <select>
            <option>Hot</option>
            <option>APR</option>
            <option>Earned</option>
            <option>Total staked</option>
            <option>Latest</option>
          </select>
        </div>
      </div>
      <div >
        <div >Search</div>
        <div className='position-relative'>
          <input placeholder="Search" className='w-100'/>
          <FaSearch className='position-absolute' color='#B5B5B5' style={{top: "10px", right: "10px"}} />
        </div>
      </div>
    </div>
  );
}

export default Filter;