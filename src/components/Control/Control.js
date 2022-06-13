import React, { useEffect, useState } from 'react';
import Switch from "react-switch";
import { BiGridHorizontal } from 'react-icons/bi';
import { FaList } from 'react-icons/fa';

import "./Control.scss"

const Control = (props) => {
  const [showMode, setShowMode] = useState(false);
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState(true);
  const handleChange = nextChecked => {
    setChecked(nextChecked);
  };

  useEffect(() => {
    props.handleShowMode(showMode);
  }, [showMode, props])

  return (
    <div id='Control' className='d-flex align-items-end gap-3 flex-column flex-md-row'>
      <div className='d-flex gap-3 '>
        <div className='d-flex align-items-center gap-1 hand'>
          <BiGridHorizontal onClick={() => setShowMode(true)} size={28} color={showMode ? `#04C0D7` : `#C4C4C4`} />
          <FaList onClick={() => setShowMode(false)} color={showMode ? `#C4C4C4` : `#04C0D7`} />
        </div>
        <div className='d-flex align-items-center gap-2'>
          <Switch
            checked={checked}
            onChange={handleChange}
            onColor="#353C46"
            offColor="#353C46"
            onHandleColor="#51FFA1"
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={40}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            className="react-switch"
          />
          Staked Only
        </div>
      </div>
      <div className='d-flex align-items-center button-group' >
        <button className={active ? "active" : ""} onClick={() => setActive(true)}>Live</button>
        <button className={active ? "" : "active"} onClick={() => setActive(false)}>Finished</button>
      </div>
    </div>
  );
}

export default Control;