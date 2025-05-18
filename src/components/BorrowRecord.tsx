import { useState } from 'react';
import '../css/HistoryRecord.css'
import Popup from './Popup.tsx';
import { type BorrowRecord } from '../assets/types.ts';

import { Checkbox } from '@mui/material';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Record from './Record.tsx';
// import 

const dateOptions: Intl.DateTimeFormatOptions = { year: '2-digit', month: 'numeric', day: 'numeric' };
const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

export default function HistoryRecord({ record, admin }: { readonly record: BorrowRecord, readonly admin: boolean }) {

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
	// const [returnBy, setReturnBy] = useState(new Date(record.return_by));


	// console.log('record', record);

	const returnDate = record.return_date ? new Date(record.return_date) : undefined;
	const returnBy = record.return_by ? new Date(record.return_by) : undefined;
	const late = (returnBy) && (!returned && new Date() > returnBy);

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

	function sameDay(d1: Date, d2: Date) {
		return d1?.getFullYear() === d2.getFullYear() &&
			d1?.getMonth() === d2.getMonth() &&
			d1?.getDate() === d2.getDate();
	}

	function getCurrentTime(returnDate: Date) {
		const time = returnDate.toLocaleTimeString(undefined, timeOptions).toLowerCase();
		if (sameDay(returnDate, new Date()))
			return time;
		return returnDate.toLocaleDateString(undefined, dateOptions) + ', ' + time;
	}

	let returnString = 'No return date set';
	if (returnDate)
		returnString = `Returned ${getCurrentTime(returnDate)}`;
	else if (returnBy)
		returnString = `Return by ${getCurrentTime(returnBy)}`;

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
			<span>{returnString}</span>
			{admin && <Checkbox checked={returned} onChange={handleChange} />}

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