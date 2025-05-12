import { useState } from 'react';
import '../css/Record.css'
import Popup from './Popup.tsx';
import { type BorrowRecord } from '../assets/types.ts';

import { Checkbox } from '@mui/material';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export default function Record({ record, admin }: { record: BorrowRecord, admin: boolean }) {


	const [isPopupAOpen, setIsPopupAOpen] = useState(false);
	const [isPopupBOpen, setIsPopupBOpen] = useState(false);
	const [isPopupCOpen, setIsPopupCOpen] = useState(false);

	const [inputDateTime, setInputDateTime] = useState<Date | null>(new Date(record.checkout_date));
	const [checked, setChecked] = useState(record.return_date ? true : false);

	function openPopupA() {
		setIsPopupAOpen(true);
	}

	function openPopupB() {
		setIsPopupBOpen(true);
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {

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


	function setCheckoutDate() {
		setIsPopupAOpen(false);
	}

	function setReturnDate() {
		setIsPopupBOpen(false);
	}

	function returnIEMs() {
		setIsPopupCOpen(false);
		setChecked(true);
	}

	return (
		<div className="record-container align-items-center">
			<span className="material-icons">headphones</span>
			<span className="name">{record.name}</span>
			<span className="type">{record.earbud_type}</span>
			<button onClick={openPopupA}>
				<span className="material-icons">today</span>
			</button>
			<button onClick={openPopupB}>
				<span className="material-icons">event_available</span>
			</button>
			<Checkbox checked={checked} onChange={handleChange} />

			<Popup isOpen={isPopupAOpen} onClose={closePopupA}>
				<h2>Checkout Date</h2>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DateTimePicker
						label="Checkout Time"
						ampm={false} // 24-hour format
						views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']} // include seconds
						value={inputDateTime}
						onChange={(newValue) => setInputDateTime(newValue)}
					/>
				</LocalizationProvider>
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
				<span>Are you sure you want to return {record.name}'s earbuds?</span>
				<div className="flex justify-content-flex-end margin-top">
					<button className="button" onClick={returnIEMs}>Return</button>
				</div>
			</Popup>
			{/* <input type="checkbox" /> */}
		</div >
	);
};