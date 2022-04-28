// unused file
import { Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";

const TokenSelectModal = (props) => {
  const [init, setInit] = useState(true);
  const [tokens, setTokens] = useState();

  function onSelect(token) {
    props.onSelect(token, props.showFor);
    props.hide();
  }

  useEffect(() => {
    if (init) {
      setInit(false);
      setTokens(require("../../tokens/" + props.networkName))
    };
  }, [init, props.networkName]);

  if (!props.showFor || init) {
    return null;
  }

  return (
    <Modal show="true" onHide={props.hide}>
      <div className="bg-dark border border-info">
        <Modal.Header className="border-info">
          <Modal.Title>Select a token</Modal.Title>
          <button type="button" className="default-btn btn-sq" onClick={props.hide}><i className="fa fa-times"></i></button>
        </Modal.Header>
        <Modal.Body className="text-center">
          <input type="text" className='form-control' placeholder="Search name or paste address" />

          <div className='text-start overflow-auto border mt-3 p-3' style={{ maxHeight: 250 }}>
            {
              tokens.map((token, index) => (
                <div key={index} className='row mb-3 align-items-center'>
                  <img className='col-auto' style={{ height: 32 }} src={token.Logo} alt={token.Name} />
                  <div className='col'>
                    <div>{token.Name}</div>
                    <div>{token.Symbol}</div>
                  </div>
                  <div className='col-auto'>
                    <button type="button" className="default-btn btn-sq" onClick={() => { onSelect(token) }}>Select</button>
                  </div>
                </div>
              ))
            }
          </div>
        </Modal.Body>
        <Modal.Footer className="border-info">
          <button type="button" className="default-btn btn-sq" onClick={props.hide}>Close</button>
        </Modal.Footer>
      </div>
    </Modal>
  );
}

export { TokenSelectModal }