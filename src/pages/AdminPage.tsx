import { useState, useEffect, memo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

import '../css/AdminPage.css'
import HistoryRecord from '../components/BorrowRecord.tsx';
import Popup from '../components/Popup.tsx';

import { putBorrowRecord, fetchRecentBorrows, flattenDBItem, putToken, getDynamoClientCreds } from '../assets/aws.ts';
import { fetchAuthSession, type AuthSession } from 'aws-amplify/auth';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import TextField from '@mui/material/TextField';
import Navbar from '../components/Navbar.tsx';

import { type BorrowRecord, type Token } from '../assets/types.ts';

function compareDateStrings(a: BorrowRecord, b: BorrowRecord): number {
	return new Date(b.checkout_date).getTime() - new Date(a.checkout_date).getTime();
}

const URI = import.meta.env.VITE_PUBLIC_URI;

export default memo(function Page() {
	const canvasRef = useRef(null);
	const sessionRef = useRef<AuthSession | undefined>(undefined);

	const [qrCodeUpdated, setQRCodeUpdated] = useState(new Date(0));
	// const navigate = useNavigate();
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
			earbud_type: inputType,
			checkout_user_id: '',
			return_by: new Date().toJSON()
		};
	}

	async function checkoutBud() {
		const newItem = getCheckoutInfo();
		setItems((prevItems) => [newItem, ...prevItems]);
		const session = sessionRef.current;

		if (session?.credentials) {
			const dynamoClient = getDynamoClientCreds(session.credentials);

			try {
				await putBorrowRecord(dynamoClient, newItem);
				console.log('Item added successfully');
			} catch (error) {
				console.error('Failed to add item to DynamoDB:', error);
			}
		}
	}

	async function createQRCode() {

		setQRCodeUpdated(new Date());
		const session = sessionRef.current;
		const profile = session?.tokens?.idToken?.payload;
		console.log('createQRCode', session, session?.tokens, session?.tokens?.idToken);

		if (session && profile) {

			const username = profile['cognito:username'];
			const email = profile.email;

			if (session.credentials && typeof username == 'string' && typeof email == 'string') {
				const dynamoClient = getDynamoClientCreds(session.credentials);

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
						const qrText = `${URI}/checkout?token=${newItem.token}`;
						console.log('url', qrText);

						QRCode.toCanvas(canvasRef.current, qrText, { errorCorrectionLevel: 'H' }, (error: any) => {
							if (error) console.error(error);
						});
					}

				} catch (error) {
					console.error('Failed to add item to DynamoDB:', error);
				}
			}
		}
	}

	function openQRCodePopup() {
		setIsQRPopupOpen(true);
		let yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		if (qrCodeUpdated < yesterday)
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

	async function init() {

		const fetchedSession = await fetchAuthSession();
		sessionRef.current = fetchedSession;

		if (fetchedSession.credentials) {
			const dynamoClient = getDynamoClientCreds(fetchedSession.credentials);

			fetchRecentBorrows(dynamoClient)
				.then((response) => {
					const condensed: BorrowRecord[] = response.Items?.map(item => flattenDBItem<BorrowRecord>(item)).sort(compareDateStrings) ?? [];
					console.log('itmes', response, condensed);

					setItems(condensed);
					setIsLoading(false);
				})
				.catch((error) => {
					console.error('DynamoDB error:', error);
					setIsLoading(false);
				});
		}
	}

	useEffect(() => {
		init();
	}, []);

	return (
		<div className="home-page">
			<Navbar><h2>Admin</h2></Navbar>
			<div className="block">
				<div className="flex margin-vertical align-items-center gap justify-content-space-between">

					<div className="title">IEMs not returned</div>
					<button onClick={openQRCodePopup}>
						<span className="material-symbols-rounded">
							qr_code_scanner
						</span>
					</button>
					<button className="button" onClick={openPopup}>Checkout</button>
				</div>

				{isLoading ? (
					<span>Loading...</span>
				) : items.map((item) => (
					<HistoryRecord key={item.name} record={item} admin={true} />
				))}
			</div>

			<Popup isOpen={isQRPopupOpen} onClose={closeQRPopup} keepAlive={true}>
				<h2>Checkout IEMs</h2>
				<div className="flex col gap" style={({ 'gap': '1rem' })}>
					<canvas ref={canvasRef} />
					<div className="flex justify-content-flex-end">
						<button className="button" onClick={createQRCode}>Refresh</button>
					</div>
				</div>
			</Popup>

			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				<h2>Checkout IEMs</h2>
				<div className="flex col gap" style={({ 'gap': '1.5rem' })}>
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
