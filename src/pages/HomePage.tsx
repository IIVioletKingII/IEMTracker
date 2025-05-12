import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";

import Record from '../components/Record.tsx';
import '../css/HomePage.css'
import Popup from '../components/Popup.tsx';

import { getDynamoClient, fetchRecentBorrows, flattenDBItem } from '../assets/aws.ts';

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

	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const openPopup = () => {
		setInputDateTime(new Date());
		setIsPopupOpen(true);
	};

	const closePopup = () => {
		setIsPopupOpen(false);
	};

	function goHome() {
		navigate('/', { 'state': { 'fromInsideApp': true } });
	}

	useEffect(() => {
		if (!auth.isAuthenticated && !auth.isLoading) {
			console.log('not authenticated', auth);
			navigate('/', { 'state': { 'fromInsideApp': true } });
			return;
		}

		// Proceed only if authenticated
		if (auth.isAuthenticated && auth.user?.id_token) {
			const idToken = auth.user.id_token;
			const dynamoClient = getDynamoClient(idToken);

			fetchRecentBorrows(dynamoClient)
				.then((response) => {
					const condensed: BorrowRecord[] = response.Items?.map(item => flattenDBItem<BorrowRecord>(item)).sort(compareDateStrings) ?? [];
					setItems(condensed);
					setIsLoading(false);
				})
				.catch((error) => {
					console.error('DynamoDB error:', error);
					setIsLoading(false);
				});
		}
	}, [auth.isAuthenticated, auth.isLoading, navigate]); // Only run if authentication state changes

	const message = !auth.isAuthenticated && !auth.isLoading ? 'Not authenticated, redirecting...' : 'Loading...';

	return (
		<div className="home-page">
			<div className="header flex gap align-items-center">
				<img src="/IEMTracker/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="home-hero" />
				<button onClick={goHome}>
					<span className='material-icons'>home</span>
				</button>
			</div>
			<div className="block">
				<div className="flex margin-vertical align-items-center justify-content-space-between">

					<div className="title">IEMs not returned</div>
				</div>

				{isLoading ? (
					<span>{message}</span>
				) : items.map((item, index) => (
					<Record key={index} record={item} admin={false} />
				))}
			</div>
			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				<h2>Checkout IEMs</h2>
				<p>This is the content of the popup.</p>
				<div className="flex col gap">
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
				</div>

				{/* <button onClick={closePopup}>Close</button> */}
			</Popup>
		</div>
	);
});
