import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";

import Record from '../components/Record.tsx';
import '../css/HomePage.css'
import Popup from '../components/Popup.tsx';

import { getDynamoClient, putBorrowRecord, fetchRecentBorrows, flattenDBStringObject } from '../assets/aws.ts';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import TextField from '@mui/material/TextField';

import { type BorrowRecord } from '../assets/types.ts';

function compareDateStrings(a: BorrowRecord, b: BorrowRecord): number {
	return new Date(b.checkout_date).getTime() - new Date(a.checkout_date).getTime();
}

export default memo(function Page() {
	const auth = useAuth();
	const navigate = useNavigate();
	const [items, setItems] = useState<BorrowRecord[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [inputName, setInputName] = useState('');
	const [inputType, setInputType] = useState('');
	const [inputDateTime, setInputDateTime] = useState<Date | null>(new Date());

	function getCheckoutInfo(): BorrowRecord {
		return {
			name: inputName,
			checkout_date: inputDateTime ? inputDateTime.toJSON() : new Date().toJSON(),
			return_date: '',
			earbud_type: inputType
		};
	}

	async function checkoutBud() {
		const newItem = getCheckoutInfo();
		setItems((prevItems) => [newItem, ...prevItems]);

		if (auth.isAuthenticated && auth.user?.id_token) {
			const idToken = auth.user.id_token;
			const dynamoClient = getDynamoClient(idToken);

			try {
				await putBorrowRecord(dynamoClient, newItem);
				console.log('Item added successfully');
			} catch (error) {
				console.error('Failed to add item to DynamoDB:', error);
			}
		}
	}

	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const openPopup = () => {
		setInputDateTime(new Date());
		setIsPopupOpen(true);
	};

	const closePopup = () => {
		setIsPopupOpen(false);
	};

	useEffect(() => {
		if (!auth.isAuthenticated && !auth.isLoading) {
			console.log('not authenticated', auth);
			navigate('/');
			return;
		}

		// Proceed only if authenticated
		if (auth.isAuthenticated && auth.user?.id_token) {
			const idToken = auth.user.id_token;
			const dynamoClient = getDynamoClient(idToken);

			fetchRecentBorrows(dynamoClient)
				.then((response) => {
					const condensed: BorrowRecord[] = response.Items?.map(item => flattenDBStringObject<BorrowRecord>(item)).sort(compareDateStrings) ?? [];
					setItems(condensed);
					setIsLoading(false);
				})
				.catch((error) => {
					console.error('DynamoDB error:', error);
					setIsLoading(false);
				});
		}
	}, [auth.isAuthenticated, auth.isLoading, navigate]); // Only run if authentication state changes


	return (
		<div className="home-page">
			<div className="header flex gap align-items-center">
				<img src="/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="home-hero" />
			</div>
			<div className="block">
				<div className="flex margin-vertical align-items-center">

					<div className="title">IEMs not returned</div>
					<button className="button" onClick={openPopup}>Checkout</button>
				</div>

				{isLoading ? (
					<span>Loading...</span>
				) : items.map((item, index) => (
					<Record key={index} {...item} />
				))}
			</div>
			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				<h2>Checkout IEMs</h2>
				<p>This is the content of the popup.</p>
				<div className="flex col gap" style={({ 'gap': '1rem' })}>
					<TextField label="Name"
						variant="outlined"
						value={inputName}
						onChange={(e) => setInputName(e.target.value)}
						fullWidth></TextField>
					<TextField label="Type"
						variant="outlined"
						value={inputType}
						onChange={(e) => setInputType(e.target.value)}
						fullWidth></TextField>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<DateTimePicker
							label="Checkout Time"
							ampm={false} // 24-hour format
							views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']} // include seconds
							value={inputDateTime}
							onChange={(newValue) => setInputDateTime(newValue)}
						/>
					</LocalizationProvider>
					<div className="flex justify-content-flex-end" >
						<button className="button" onClick={checkoutBud}>Checkout</button>
					</div>
				</div>

				{/* <button onClick={closePopup}>Close</button> */}
			</Popup>
		</div>
	);
});
