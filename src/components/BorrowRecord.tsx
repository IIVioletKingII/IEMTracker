import { useState } from 'react';
import '../css/HistoryRecord.css'
import Popup from './Popup.tsx';
import { type BorrowRecord } from '../assets/types.ts';

import { Checkbox } from '@mui/material';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Record from './Record.tsx';

export default function HistoryRecord({ record, admin }: { record: BorrowRecord, admin: boolean }) {

	/* 
name -> string;
checkout_date -> string;
checkout_user_id -> string;
earbud_type -> string;
return_by -> string;
return_date -> string;
	*/

	const [isPopupAOpen, setIsPopupAOpen] = useState(false);
	const [isPopupBOpen, setIsPopupBOpen] = useState(false);
	const [isPopupCOpen, setIsPopupCOpen] = useState(false);

	const [inputDateTime, setInputDateTime] = useState<Date | null>(new Date(record.checkout_date));
	const [returned, setReturned] = useState(record.return_date ? true : false);


	const returnBy = new Date(record.return_by);
	const late = !returned && new Date() > returnBy;

	// console.log('returned', returned);
	// console.log('late', late, returnBy);

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
			setReturned(event.target.checked);
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
		setReturned(true);
	}

	return (
		<Record icon="headphones" classes={late ? 'late' : ''}>
			<span className="name">{record.name}</span>
			<span className="type">{record.earbud_type}</span>
			<button onClick={openPopupA}>
				<span className="material-icons">today</span>
			</button>
			<button onClick={openPopupB}>
				<span className="material-icons">event_available</span>
			</button>
			<Checkbox checked={returned} onChange={handleChange} />

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
		</Record>
	);
};