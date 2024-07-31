import React from "react";
import { useState, useEffect } from "react";
import "./Modal.css";

const Modal = ({show, onClose, children}) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            console.log("Esc");
            onClose();
        }
        };
        if (show) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
        window.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, onClose]);

    if (!show){
        return null;
    }
    return (
        <div className="Modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <button onClick={onClose} className="close">Close</button>
                </div>
                <div className="modal-body">{children}</div>
            </div> 
        </div>
    )
}

export default Modal;