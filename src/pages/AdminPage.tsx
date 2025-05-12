import { useState, useEffect, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import QRCode from 'qrcode';

import Record from '../components/Record.tsx';
import '../css/AdminPage.css'
import Popup from '../components/Popup.tsx';

import { getDynamoClient, putBorrowRecord, fetchRecentBorrows, flattenDBItem, putToken } from '../assets/aws.ts';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import TextField from '@mui/material/TextField';

import { type BorrowRecord, type Token } from '../assets/types.ts';

function compareDateStrings(a: BorrowRecord, b: BorrowRecord): number {
	return new Date(b.checkout_date).getTime() - new Date(a.checkout_date).getTime();
}

const URI = import.meta.env.VITE_PUBLIC_URI;

export default memo(function Page() {
	const canvasRef = useRef(null);
	const [qrCodeUpdated, setQRCodeUpdated] = useState(new Date());
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

	async function createQRCode() {
		console.log('createQRCode');

		setQRCodeUpdated(new Date());
		const username = auth.user?.profile['cognito:username'];
		const idToken = auth.user?.id_token;
		const email = auth.user?.profile.email;
		// console.log('info', username, idToken, email);

		if (auth.isAuthenticated && idToken && email && username && typeof username == 'string') {
			const dynamoClient = getDynamoClient(idToken);

			const newItem: Token = {
				token: crypto.randomUUID(),
				date_created: new Date().toJSON(),
				created_by_id: username,
				created_by_name: email
			};
			console.log('newItem', newItem);

			try {
				await putToken(dynamoClient, newItem);
				console.log('Item added successfully');

				if (canvasRef.current) {
					const qrText = `${URI}home?token=${newItem.token}`;
					QRCode.toCanvas(canvasRef.current, qrText, { errorCorrectionLevel: 'H' }, (error: any) => {
						if (error) console.error(error);
					});
				}

			} catch (error) {
				console.error('Failed to add item to DynamoDB:', error);
			}
		}
	}

	function openQRCodePopup() {
		setIsQRPopupOpen(true);
		// let yesterday = new Date();
		// yesterday.setDate(yesterday.getDate() - 1);
		// if (qrCodeUpdated < yesterday)
		createQRCode();
	}

	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [isQRPopupOpen, setIsQRPopupOpen] = useState(false);

	const openPopup = () => {
		setInputDateTime(new Date());
		setIsPopupOpen(true);
	};

	const closePopup = () => {
		setIsPopupOpen(false);
	};

	const closeQRPopup = () => {
		setIsQRPopupOpen(false);
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

		console.log('auth admin', auth);

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

	let message = !auth.isAuthenticated && !auth.isLoading ? 'Not authenticated, redirecting...' : 'Loading...';

	return (
		<div className="home-page">
			<div className="header flex gap align-items-center">
				<img src="/IEMTracker/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="home-hero" />
				<button onClick={goHome}>
					<span className='material-icons'>home</span>
				</button>
			</div>
			<div className="block">
				<div className="flex margin-vertical align-items-center gap" style={({ 'justifyContent': 'spaceBetween' })}>

					<div className="title">IEMs not returned</div>
					<button onClick={openQRCodePopup}>
						<span className="material-icons">
							qr_code_scanner
						</span>
					</button>
					<button className="button" onClick={openPopup}>Checkout</button>
				</div>

				{isLoading ? (
					<span>{message}</span>
				) : items.map((item, index) => (
					<Record key={index} record={item} admin={true} />
				))}
			</div>

			<Popup isOpen={isQRPopupOpen} onClose={closeQRPopup}>
				<h2>Checkout IEMs</h2>
				<div className="flex col gap" style={({ 'gap': '1rem' })}>
					<canvas ref={canvasRef} />
					<div className="flex justify-content-flex-end" >
						<button className="button" onClick={createQRCode}>Refresh</button>
					</div>
				</div>

				{/* <button onClick={closePopup}>Close</button> */}
			</Popup>

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
