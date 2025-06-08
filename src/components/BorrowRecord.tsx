import { useState } from 'react';
import '../css/HistoryRecord.css'
import Popup from './Popup.tsx';
import Record from './Record.tsx';

import { fetchAuthSession } from '@aws-amplify/core';
import { type BorrowRecord } from '../assets/types.ts';
import { updateBorrowRecord, getDynamoClientCreds } from '../assets/aws.ts';

import { Checkbox } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


const dateOptions: Intl.DateTimeFormatOptions = { year: '2-digit', month: 'numeric', day: 'numeric' };
const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

export default function HistoryRecord({ record, admin }: { readonly record: BorrowRecord, readonly admin: boolean }) {

	const [isPopupAOpen, setIsPopupAOpen] = useState(false); // checkout date
	const [isPopupBOpen, setIsPopupBOpen] = useState(false); // return by date
	const [isPopupCOpen, setIsPopupCOpen] = useState(false); // return date

	const [saveError, setSaveError] = useState(''); // return date

	const [tempCheckoutDate, setTempCheckoutDate] = useState<Date>(new Date(record.checkout_date));
	const [tempReturnByDate, setTempReturnByDate] = useState<Date>(new Date(record.return_by_date || Date.now()));
	const [tempReturnedDate, setTempReturnedDate] = useState<Date>(new Date(record.returned_date || Date.now()));

	// const [checkoutDate, setCheckoutDate] = useState<Date | null>(new Date(record.checkout_date));
	const [returnedDate, setReturnedDate] = useState<Date | null>(record.returned_date ? new Date(record.returned_date) : null);
	const [returnByDate, setReturnByDate] = useState<Date | null>(record.return_by_date ? new Date(record.return_by_date) : null);

	const [returned, setReturned] = useState(!!record.returned_date);
	const late = (returnByDate) && (!returned && new Date() > returnByDate);

	function openPopupA() {
		setSaveError('');
		setIsPopupAOpen(true);
	}

	function openPopupB() {
		setSaveError('');
		setIsPopupBOpen(true);
	}

	// openPopupC
	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {

		if (event.target.checked) {
			event.preventDefault();
			setSaveError('');
			setIsPopupCOpen(true);
		} else {
			setReturned(event.target.checked);
		}
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

	async function saveReturnByDate() {
		if (tempReturnByDate) {
			setReturnByDate(tempReturnByDate);
			const res = await updateRecord({
				name: record.name,
				checkout_date: record.checkout_date,
				...(tempReturnByDate && { 'return_by_date': tempReturnByDate.toJSON() }),
			});
			if (res)
				setIsPopupBOpen(false);
		}
	}

	async function returnIEMs() {
		if (tempReturnedDate) {
			setReturnedDate(tempReturnedDate);
			setReturned(true);

			const res = await updateRecord({
				name: record.name,
				checkout_date: record.checkout_date,
				...(tempReturnedDate && { 'returned_date': tempReturnedDate.toJSON() })
			});
			if (res)
				setIsPopupCOpen(false);
		}

	}

	async function updateRecord(newRecord: BorrowRecord) {

		const session = await fetchAuthSession();
		if (!session.credentials) {
			console.log('no credentials');
			return;
		}

		const client = getDynamoClientCreds(session.credentials)
		if (!client) {
			console.log('no client');
			return;
		}

		const res = await updateBorrowRecord(client, newRecord);
		console.log('updated borrows:', res);
		const success = res['$metadata'].httpStatusCode == 200;
		if (!success)
			setSaveError(`Error saving record. Code ${res['$metadata'].httpStatusCode}`)
		return success;
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
	if (returnedDate)
		returnString = `Returned ${getCurrentTime(returnedDate)}`;
	else if (returnByDate)
		returnString = `Return by ${getCurrentTime(returnByDate)}`;

	return (
		<Record icon="headphones" classes={late ? 'late' : ''}>
			<span className="text name">{record.name}</span>
			<span className="text type">{record.earbud_type}</span>
			<button className='shadow-click' onClick={openPopupA}>
				<span className="material-symbols-rounded">today</span>
			</button>
			{admin && <button className='shadow-click' onClick={openPopupB}>
				<span className="material-symbols-rounded">event_available</span>
			</button>}
			<span className='text'>{returnString}</span>
			{admin && <Checkbox checked={returned} onChange={handleChange} />}

			<Popup isOpen={isPopupAOpen} onClose={closePopupA}>
				<h2>Checkout Date</h2>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DateTimePicker
						label="Checkout Time"
						ampm={false} // 24-hour format
						views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']} // include seconds
						value={tempCheckoutDate}
						onChange={(newValue) => newValue && setTempCheckoutDate(newValue)}
						readOnly={true}
					/>
				</LocalizationProvider>
				{/* {saveError && <span className='color failure'>{saveError}</span>}
				{admin && <div className="flex justify-content-flex-end margin-top">
					<button className="button" onClick={saveCheckoutDate}>Save</button>
				</div>} */}
			</Popup>
			<Popup isOpen={isPopupBOpen} onClose={closePopupB}>
				<h2>Return By Date</h2>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DateTimePicker
						label="Checkout Time"
						ampm={false} // 24-hour format
						views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']} // include seconds
						value={tempReturnByDate}
						onChange={(newValue) => newValue && setTempReturnByDate(newValue)}
						readOnly={!admin}
					/>
				</LocalizationProvider>
				{saveError && <span className='color failure'>{saveError}</span>}
				{admin && <div className="flex justify-content-flex-end margin-top">
					<button className="button" onClick={saveReturnByDate}>Save</button>
				</div>}
			</Popup>
			<Popup isOpen={isPopupCOpen} onClose={closePopupC}>
				<h2>Return IEMs</h2>
				<div className="flex col gap">
					<span>Are you sure you want to return {record.name}'s earbuds?</span><LocalizationProvider dateAdapter={AdapterDateFns}>
						<DateTimePicker

							label="Checkout Time"
							ampm={false} // 24-hour format
							views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']} // include seconds
							value={tempReturnedDate}
							onChange={(newValue) => newValue && setTempReturnedDate(newValue)}
							readOnly={!admin}
						/>
					</LocalizationProvider>
					{saveError && <span className='color failure'>{saveError}</span>}
					<div className="flex justify-content-flex-end">
						<button className="button" onClick={returnIEMs}>Return</button>
					</div>
				</div>
			</Popup>
		</Record>
	);
};