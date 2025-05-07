import { useState } from 'react';
import '../css/Record.css'
import Popup from './Popup.tsx';
import { type BorrowRecord } from '../assets/types.ts';

import { Checkbox, FormControlLabel } from '@mui/material';


export default function Record({ name, checkout_date, return_date, earbud_type }: BorrowRecord) {


	const [isPopupAOpen, setIsPopupAOpen] = useState(false);
	const [isPopupBOpen, setIsPopupBOpen] = useState(false);
	const [isPopupCOpen, setIsPopupCOpen] = useState(false);


	const [checked, setChecked] = useState(return_date ? true : false);

	function openPopupA() {
		setIsPopupAOpen(true);
	}

	function openPopupB() {
		setIsPopupBOpen(true);
	}

	const handleChange = (event) => {

		if (event.target.checked) {
			event.preventDefault();
			setIsPopupCOpen(true);
		} else
			setChecked(event.target.checked);
	};

	function closePopupA() {
		setIsPopupAOpen(false);
	}

	function closePopupB() {
		setIsPopupBOpen(false);
	}

	function closePopupC() {
		setIsPopupCOpen(false);
	}


	function setCheckoutDate(event) {
		setIsPopupAOpen(false);
	}

	function setReturnDate(event) {
		setIsPopupBOpen(false);
	}

	function returnIEMs(event) {
		setIsPopupCOpen(false);
		setChecked(true);
	}

	return (
		<div className="record-container align-items-center">
			<span className="material-icons">headphones</span>
			<span className="name">{name}</span>
			<span className="type">{earbud_type}</span>
			<button>
				<span className="material-icons" onClick={openPopupA}>today</span>
			</button>
			<button>
				<span className="material-icons" onClick={openPopupB}>event_available</span>
			</button>
			<Checkbox checked={checked} onChange={handleChange} />

			<Popup isOpen={isPopupAOpen} onClose={closePopupA}>
				<h2>Checkout Date</h2>

				<div className="flex justify-content-flex-end margin-top">
					<button className="button" onClick={setCheckoutDate}>Save</button>
				</div>
			</Popup>
			<Popup isOpen={isPopupBOpen} onClose={closePopupB}>
				<h2>Return Date</h2>

				<div className="flex justify-content-flex-end margin-top">
					<button className="button" onClick={setReturnDate}>Save</button>
				</div>
			</Popup>
			<Popup isOpen={isPopupCOpen} onClose={closePopupC}>
				<h2>Return IEMs</h2>
				<span>Are you sure you want to return {name}'s earbuds?</span>
				<div className="flex justify-content-flex-end margin-top">
					<button className="button" onClick={returnIEMs}>Return</button>
				</div>
			</Popup>
			{/* <input type="checkbox" /> */}
		</div >
	);
};