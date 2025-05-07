import React, { useState } from 'react';
import '../css/Popup.css';

const Popup = ({ isOpen, onClose, children }) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="popup-overlay">
			<div className="popup-content">
				<button className="popup-close" onClick={onClose}>
					<span className="material-icons">close</span>
				</button>
				{children}
			</div>
		</div>
	);
};

export default Popup;