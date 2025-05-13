import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";

import { getDynamoClient, fetchUserBorrows, flattenDBItem } from '../assets/aws.ts';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import '../css/HomePage.css'
import Record from '../components/Record.tsx';
import Popup from '../components/Popup.tsx';
import Navbar from '../components/Navbar.tsx';
import Accordion from '../components/Accordion.tsx';

import TextField from '@mui/material/TextField';

import { type BorrowRecord } from '../assets/types.ts';

function compareDateStrings(a: BorrowRecord, b: BorrowRecord): number {
	return new Date(b.checkout_date).getTime() - new Date(a.checkout_date).getTime();
}

export default memo(function Page() {
	const auth = useAuth();
	const navigate = useNavigate();
	const [items, setItems] = useState<BorrowRecord[]>([]);
	const [returnedItems, setReturnedItems] = useState<BorrowRecord[]>([]);
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

	function fetchMyBorrows(idToken: string, user_id: string) {

		const dynamoClient = getDynamoClient(idToken);

		fetchUserBorrows(dynamoClient, user_id)
			.then((response) => {
				const condensed: BorrowRecord[] = response.Items?.map(item => flattenDBItem<BorrowRecord>(item)).sort(compareDateStrings) ?? [];

				// const returnedItems = condensed.filter(item => item.return_date?.trim() !== '');
				// const items = condensed.filter(item => !item.return_date || item.return_date.trim() === '');

				const [items, returnedItems] = condensed.reduce<[BorrowRecord[], BorrowRecord[]]>(
					([items, returned], item) => {
						if (item.return_date?.trim())
							returned.push(item);
						else
							items.push(item);
						return [items, returned];
					},
					[[], []]
				);

				setItems(items);
				setReturnedItems(returnedItems);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('DynamoDB error:', error);
				setIsLoading(false);
			});
	}

	useEffect(() => {
		if (!auth.isAuthenticated && !auth.isLoading) {
			console.log('not authenticated', auth);
			navigate('/', { 'state': { 'fromInsideApp': true } });
			return; // Proceed only if authenticated
		}

		const user_id = auth.user?.profile['cognito:username'];
		if (auth.isAuthenticated && auth.user?.id_token && typeof user_id == 'string') {
			const idToken = auth.user.id_token;

			fetchMyBorrows(idToken, user_id)
		}
	}, [auth.isAuthenticated, auth.isLoading, navigate]); // Only run if authentication state changes


	const infoMessage = items.length ? 'IEMs not returned' : 'No IEM checkout history.'
	const loadingMessage = !auth.isAuthenticated && !auth.isLoading ? 'Not authenticated, redirecting...' : 'Loading...';

	return (
		<div className="home-page">
			<Navbar />
			<div className="block">
				<div className="flex margin-vertical align-items-center justify-content-space-between">
					<div className="title">{infoMessage}</div>
					<div>Red: late</div>
				</div>

				{isLoading ? (
					<span>{loadingMessage}</span>
				) : (
					<div className="container">
						{items.map((item, index) => (
							<Record key={index} record={item} admin={false} />
						))}
						<Accordion title='Returned IEMs'>
							{returnedItems.map((item, index) => (
								<Record key={index} record={item} admin={false} />
							))}
						</Accordion>
					</div>
				)}

			</div>
			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				<h2>Checkout IEMs</h2>
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
