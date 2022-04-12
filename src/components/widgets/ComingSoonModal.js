import { Modal } from "react-bootstrap";

const ComingSoonModal = (props) => {
   if (!props.show) {
       return null;
   }

    return (
        <Modal show="true" onHide={props.hide}>
            <div className="bg-dark border border-info">
                <Modal.Header className="border-info">
                    <Modal.Title>Info</Modal.Title>
                    <button type="button" className="default-btn btn-sq" onClick={props.hide}><i className="fa fa-times"></i></button>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <h1>Coming Soon</h1>
                </Modal.Body>
                <Modal.Footer className="border-info">
                    <button type="button" className="default-btn btn-sq" onClick={props.hide}>Close</button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export { ComingSoonModal }