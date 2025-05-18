import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import '../css/UsersPage.css';

import { getUsers } from '../assets/aws.ts';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import '../css/HomePage.css'
import HistoryRecord from '../components/BorrowRecord.tsx';
import Popup from '../components/Popup.tsx';
import Navbar from '../components/Navbar.tsx';
import { fetchAuthSession } from 'aws-amplify/auth';

import { type BorrowRecord } from '../assets/types.ts';


function compareDateStrings(a: BorrowRecord, b: BorrowRecord): number {
	return new Date(b.checkout_date).getTime() - new Date(a.checkout_date).getTime();
}

export default memo(function Page() {
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


	async function init() {

		const session = await fetchAuthSession();
		const idToken = session.tokens?.idToken?.payload;
		if (session.credentials
			&& typeof idToken == 'object'
			// && Array.isArray(idToken['cognito:groups'])
			&& typeof idToken.sub == 'string'
		) {
			const users = await getUsers(session.credentials);
			console.log('users', users);

		}
	}

	useEffect(() => {
		init();
	}, []);

	return (
		<div className="users-page">
			<Navbar>
				<h2>Users</h2>
			</Navbar>
			<div className="block">


			</div>
			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				Test
			</Popup>
		</div>
	);
});
