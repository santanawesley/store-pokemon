import React from "react";
import "./index.css";

const ModalConfirmation = (props) => {
  return (
    <div className="modal-confirmation" id="modal">
      <div className="content-modal">
        <div onClick={() => props.closeModal()} className="close-modal">X</div>
        <p className="title-modal">{props.title}</p>
        <p>{props.description}</p>
      </div>
    </div>
  )
}

export default ModalConfirmation;
