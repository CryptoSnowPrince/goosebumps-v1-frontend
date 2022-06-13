import React from 'react';
import { BiHelpCircle } from 'react-icons/bi';

import "./Help.scss"

const Help = () => {
  return (
    <div id='Help' className='d-none d-sm-block'>
      <button className='default-btn'>Help <BiHelpCircle /></button>
    </div>
  );
}

export default Help;