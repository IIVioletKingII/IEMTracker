import { useState, useEffect, memo } from 'react';
import '../css/UsersPage.css';

import { getUsers, parseAttributes } from '../assets/aws.ts';

import Popup from '../components/Popup.tsx';
import Navbar from '../components/Navbar.tsx';
import { fetchAuthSession } from 'aws-amplify/auth';

import type { UserAttributes } from '../assets/types.ts';
import Record from '../components/Record.tsx';

export default memo(function Page() {

	const [isPopupOpen, setIsPopupOpen] = useState(false);


	const [users, setUsers] = useState<Array<UserAttributes>>([{}]);
	const [errorMessage, setErrorMessage] = useState('Loading...');


	const closePopup = () => {
		setIsPopupOpen(false);
	};

	async function init() {

		const session = await fetchAuthSession();
		if (session.credentials) {
			const usersObj = await getUsers(session.credentials);
			setUsers(usersObj.Users?.map(userObj => parseAttributes(userObj.Attributes)) ?? []);
			setErrorMessage(users ? '' : 'No users.');
		} else {
			setErrorMessage('No credentials.')
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
				{errorMessage}
				{users.map(user => (<Record icon='person' key={user.sub}>{user.name}</Record>))}
			</div>
			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				Test
			</Popup>
		</div>
	);
});
