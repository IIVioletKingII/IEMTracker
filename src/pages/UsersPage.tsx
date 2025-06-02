import { useState, useEffect, memo } from 'react';
import '../css/UsersPage.css';

import { getUsers, getUsersWithGroups, type UserWithGroups } from '../assets/aws.ts';

import Popup from '../components/Popup.tsx';
import Navbar from '../components/Navbar.tsx';
import { fetchAuthSession } from 'aws-amplify/auth';

import Record from '../components/Record.tsx';

export default memo(function Page() {

	const [isPopupOpen, setIsPopupOpen] = useState(false);


	const [users, setUsers] = useState<UserWithGroups[]>([]);
	const [errorMessage, setErrorMessage] = useState('Loading...');


	const closePopup = () => {
		setIsPopupOpen(false);
	};

	async function init() {

		const session = await fetchAuthSession();
		if (session.credentials) {

			// const usersObj = await getUsers(session.credentials);
			// setUsers(usersObj.Users?.map(userObj => parseAttributes(userObj.Attributes)) ?? []);

			const usersObj = await getUsersWithGroups(session.credentials);
			setUsers(usersObj ?? []);

			console.log('users', usersObj, users);

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
			<Navbar><h2>Users</h2></Navbar>
			<div className="block">
				{errorMessage}
				{users.map(user => (
					<Record icon='person' key={user.username}>
						<div className='flex row gap' style={{ 'flexGrow': '1' }}>
							<span>{user.attributes.name}</span>
							{user.attributes.nickname && <span className='nickname'>({user.attributes.nickname})</span>}
						</div>
						<span>{user.groups}</span>
					</Record>
				))}
			</div>
			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				Test
			</Popup>
		</div>
	);
});
