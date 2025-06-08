import { useState, useEffect, memo } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import { getDynamoClientCreds, fetchUserBorrows, flattenDBItem } from '../assets/aws.ts';
import type { AwsCredentialIdentity } from "@aws-sdk/types";

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import '../css/HomePage.css'
import HistoryRecord from '../components/BorrowRecord.tsx';
import Popup from '../components/Popup.tsx';
import Navbar from '../components/Navbar.tsx';
import Accordion from '../components/Accordion.tsx';

import TextField from '@mui/material/TextField';

import { type BorrowRecord } from '../assets/types.ts';

function compareDateStrings(a: BorrowRecord, b: BorrowRecord): number {
	return new Date(b.checkout_date).getTime() - new Date(a.checkout_date).getTime();
}

export default memo(function Page() {

	// const navigate = useNavigate();
	// const infoRef = useRef<FetchUserAttributesOutput>({})
	const [items, setItems] = useState<BorrowRecord[]>([]);
	const [returnedItems, setReturnedItems] = useState<BorrowRecord[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [inputName, setInputName] = useState('');
	const [inputType, setInputType] = useState('');
	const [inputDateTime, setInputDateTime] = useState<Date | null>(new Date());

	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const closePopup = () => {
		setIsPopupOpen(false);
	};

	function fetchMyBorrows(credentials: AwsCredentialIdentity, user_id: string) {

		const dynamoClient = getDynamoClientCreds(credentials);

		fetchUserBorrows(dynamoClient, user_id)
			.then((response) => {
				const condensed: BorrowRecord[] = response.Items?.map(item => flattenDBItem<BorrowRecord>(item)).sort(compareDateStrings) ?? [];

				const [items, returnedItems] = condensed.reduce<[BorrowRecord[], BorrowRecord[]]>(
					([items, returned], item) => {
						if (item.returned_date?.trim())
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

	async function init() {

		const session = await fetchAuthSession();
		const profile = session.tokens?.idToken?.payload;
		if (session.credentials
			&& profile
			&& typeof profile.sub == 'string'
		) {
			fetchMyBorrows(session.credentials, profile.sub);
		}
	}

	useEffect(() => {
		init();
	}, []);

	const infoMessage = items.length ? 'IEMs not returned' : 'No IEM checkout history.';

	return (
		<div className="home-page">
			<Navbar><h2>Home</h2></Navbar>
			<div className="block">
				<div className="flex margin-vertical align-items-center justify-content-space-between">
					<div className="title">{infoMessage}</div>
					<div>Red: late</div>
				</div>

				{isLoading ? (
					<span>Loading...</span>
				) : (
					<div className="container">
						{items.map((item, index) => (
							<HistoryRecord key={index} record={item} admin={false} />
						))}
						<Accordion title='Returned IEMs'>
							{returnedItems.map((item, index) => (
								<HistoryRecord key={index} record={item} admin={false} />
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
