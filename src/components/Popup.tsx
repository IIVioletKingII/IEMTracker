import React, { useEffect } from 'react';
import '../css/Popup.css';

type imports = {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly children: React.ReactNode
}

export default function Popup({ isOpen, onClose, children }: imports) {

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (e.target instanceof HTMLElement && e.target.classList.contains('popup-overlay')) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('click', handleClickOutside);
		};
	}, [onClose]);

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
};;