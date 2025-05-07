import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";

import Record from '../components/Record.tsx';
import '../css/HomePage.css'
import Popup from '../components/Popup.tsx';

import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { DynamoDBClient, ScanCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';

import { type BorrowRecord } from '../assets/types.ts';

let updates: number = 0;

const region = 'us-east-2';
const userPoolId = 'us-east-2_UbVB9dHVM';
const identityPoolId = 'us-east-2:fe8b1af6-470c-458e-815a-79a6549d96e0';

function flattenDBStringObject(item: object) {
	const flat = {};
	for (const key in item)
		flat[key] = item[key].S; // only handles string values
	return flat;
}

export default memo(function Page() {
	const auth = useAuth();
	const navigate = useNavigate();
	const [items, setItems] = useState<BorrowRecord[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [input_name, setInput_name] = useState('');
	const [input_type, setInput_type] = useState('');
	const [input_dateTime, setInput_dateTime] = useState<Date | null>(new Date());

	function getCheckoutInfo(): BorrowRecord {
		return {
			name: input_name,
			checkout_date: input_dateTime ? input_dateTime.toJSON() : new Date().toJSON(),
			return_date: '',
			earbud_type: input_type
		};
	}

	async function checkoutBud() {
		const newItem = getCheckoutInfo();
		setItems(prevItems => [newItem, ...prevItems]); // Optimistic UI update

		if (auth.isAuthenticated && auth.user?.id_token) {
			const idToken = auth.user.id_token;

			const credentials = fromCognitoIdentityPool({
				identityPoolId: identityPoolId,
				clientConfig: {
					region: region,
				},
				logins: {
					[`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken,
				},
			});

			const dynamoDBClient = new DynamoDBClient({
				region: region,
				credentials,
			});

			const command = new PutItemCommand({
				TableName: 'EarbudBorrows',
				Item: {
					name: { S: newItem.name },
					checkout_date: { S: newItem.checkout_date },
					return_date: { S: newItem.return_date },
					earbud_type: { S: newItem.earbud_type }
				}
			});

			try {
				await dynamoDBClient.send(command);
				console.log('Item added successfully');
			} catch (error) {
				console.error('Failed to add item to DynamoDB:', error);
			}
		}
	}

	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const openPopup = () => {
		setInput_dateTime(new Date());
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

			const credentials = fromCognitoIdentityPool({
				identityPoolId: identityPoolId,
				clientConfig: {
					region: region,
				},
				logins: {
					[`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken, // Your Cognito User Pool ID
				},
			});

			// Instantiate DynamoDB Client with the provided credentials
			const dynamoDBClient = new DynamoDBClient({
				region: region,
				credentials,
			});

			let fiveDaysAgo = new Date();
			fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

			const command = new ScanCommand({
				TableName: 'EarbudBorrows',
				FilterExpression: 'checkout_date > :start',
				ExpressionAttributeValues: {
					':start': { S: fiveDaysAgo.toJSON() }
				}
			});

			dynamoDBClient.send(command)
				.then(response => {
					const condensed: BorrowRecord[] = response.Items?.map(flattenDBStringObject).sort((a, b) => {
						return new Date(b.checkout_date) - new Date(a.checkout_date)// Ascending
					}) ?? [];
					// condensed = condensed
					setItems(condensed);
					setIsLoading(false); // Set loading to false when data is fetched
				})
				.catch(error => {
					console.error('DynamoDB error:', error);
					setIsLoading(false); // Set loading to false in case of error
				});
		}
	}, [auth.isAuthenticated, auth.isLoading, updates, navigate]); // Only run if authentication state changes


	return (
		<div className="home-page">
			<div className="header flex gap align-items-center">
				<img src="/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="home-hero" />
			</div>
			<div className="block">
				<div className="flex margin-vertical align-items-center">

					<div className="title">Please blah blah blah</div>
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
						value={input_name}
						onChange={(e) => setInput_name(e.target.value)}
						fullWidth></TextField>
					<TextField label="Type"
						variant="outlined"
						value={input_type}
						onChange={(e) => setInput_type(e.target.value)}
						fullWidth></TextField>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<DateTimePicker
							label="Checkout Time"
							ampm={false} // 24-hour format
							views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']} // include seconds
							value={input_dateTime}
							onChange={(newValue) => setInput_dateTime(newValue)}
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
