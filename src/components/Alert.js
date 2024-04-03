import React, { useEffect } from 'react';
import "./Alert.scss"; 
const Alert = ({ message, type, show, setShow }) => {
    useEffect(() => {
        if (show) {
            setTimeout(() => {
                setShow(false);
            }, 2000);
        }
    }, [show, setShow]);

    const alertClassName = `alert ${type}`;

    return (
        show && (
            <div className={alertClassName} style={{ width: `${message.length + 2}ch` }}>
                {message}
            </div>
        )
    );
};

export default Alert;
