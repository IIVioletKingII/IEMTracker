import { useRef, useState, useEffect, memo } from 'react';
import '../css/UsersPage.css';

import { addUserToGroups, removeUserFromGroups, getUsersWithGroups, type UserWithGroups } from '../assets/aws.ts';

import Popup from '../components/Popup.tsx';
import Navbar from '../components/Navbar.tsx';
import { fetchAuthSession, type AuthSession } from 'aws-amplify/auth';

import Record from '../components/Record.tsx';
import { Checkbox } from '@mui/material';

const groupIconMap = {
	'Admins': {
		class: 'material-symbols-rounded filled',
		icon: 'admin_panel_settings'
	},
	'Users': {
		class: 'material-symbols-rounded filled',
		icon: 'person_check'
	},
} as const;

type GroupName = keyof typeof groupIconMap;

const USER_GROUP = 'Users';
const ADMIN_GROUP = 'Admins';

export default memo(function Page() {

	const hasRun = useRef(false);
	const sessionRef = useRef<AuthSession | undefined>(undefined);
	const popupUser = useRef<UserWithGroups>(undefined);

	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [user, setUser] = useState('');

	const [userGroup, setUserGroup] = useState(false);
	const [adminGroup, setAdminGroup] = useState(false);

	const [users, setUsers] = useState<UserWithGroups[]>([]);
	const [errorMessage, setErrorMessage] = useState('Loading...');
	const [popupErrorMessage, setPopupErrorMessage] = useState('');


	function openPopup(curUser: string) {
		const userList = users.filter(thisUser => thisUser.username == curUser);
		if (userList) {
			const user = userList[0];
			popupUser.current = user;
			setUser(user.attributes.name ?? 'user');

			setUserGroup(user.groups.includes(USER_GROUP));
			setAdminGroup(user.groups.includes(ADMIN_GROUP));
			setIsPopupOpen(true);
		} else {
			console.error('uh oh');
			setPopupErrorMessage("Couldn't find user.");
		}
	}

	function closePopup() {
		setIsPopupOpen(false);
	};

	async function updateGroups() {

		const user = popupUser.current;
		const session = sessionRef.current;
		if (session?.credentials && user) {
			let newGroups = [];
			let removeGroups = [];

			const wasUser = user.groups.includes(USER_GROUP);
			const wasAdmin = user.groups.includes(ADMIN_GROUP);

			if (!userGroup && wasUser) {
				// Removed from users
				removeGroups.push(USER_GROUP);
			} else if (!adminGroup && wasAdmin) {
				// Removed from admin
				removeGroups.push(ADMIN_GROUP);
			} else if (userGroup && !wasUser) {
				// Added to users
				newGroups.push(USER_GROUP);
			} else if (adminGroup && !wasAdmin) {
				// Added to admin
				newGroups.push(ADMIN_GROUP);
			}

			if (newGroups) {
				const results = await addUserToGroups(session.credentials, user.username, newGroups);
				for (const group of newGroups) {
					if (results[group] != 'success') {
						setPopupErrorMessage(results[group]);
						return;
					}
				}
			}

			if (removeGroups) {
				const results = await removeUserFromGroups(session.credentials, user.username, removeGroups);
				for (const group of removeGroups) {
					if (results[group] != 'success') {
						setPopupErrorMessage(results[group]);
						return;
					}
				}
			}

			setIsPopupOpen(false);
			init();

		} else {
			setPopupErrorMessage("Couldn't find user.");
		}

	};


	function getIcon(group: string) {
		if (group in groupIconMap) {
			const item = groupIconMap[group as GroupName];
			return (<span className={item.class}>{item.icon}</span>)
		}

		return ''; // fallback
	}

	async function init() {

		const session = await fetchAuthSession();
		if (session.credentials) {
			sessionRef.current = session;

			const usersObj = await getUsersWithGroups(session.credentials);
			setUsers(usersObj ?? []);

			console.log('users', usersObj, users);

			setErrorMessage(usersObj ? '' : 'No users.');
		} else {
			setErrorMessage('No credentials.')
		}
	}

	useEffect(() => {
		if (!hasRun.current) {
			init();
			hasRun.current = true;
		}
	}, []);

	return (
		<div className="users-page">
			<Navbar><h2>Users</h2></Navbar>
			<div className="block">
				{errorMessage}
				{users.map((user, i) => (
					<Record icon='person' key={user.username + '/' + i}>
						<div className='flex row gap' style={{ 'flexGrow': '1' }}>
							<span>{user.attributes.name}</span>
							{user.attributes.nickname && <span className='nickname'>({user.attributes.nickname})</span>}
						</div>
						{user.groups.map(group => (
							<span key={user.username + '-' + group} className="flex">
								{getIcon(group)}
							</span>
						))}
						<button className='shadow-click' onClick={() => openPopup(user.username)}>
							<span className="material-symbols-rounded">
								add
							</span>
						</button>
					</Record>
				))}
			</div>
			<Popup isOpen={isPopupOpen} onClose={closePopup}>
				<h2>User groups</h2>
				<div className="flex col gap">
					<div >Edit {user}'s groups</div>
					<div>
						<div className="flex row gap align-items-center">
							<Checkbox checked={userGroup} onChange={() => setUserGroup(!userGroup)} />
							<span>Users</span>
						</div>
						<div className="flex row gap align-items-center">
							<Checkbox checked={adminGroup} onChange={() => setAdminGroup(!adminGroup)} />
							<span>Admins</span>
						</div>
					</div>
					{popupErrorMessage && <span className='color failure'>{popupErrorMessage}</span>}
					<div className="flex justify-content-flex-end">
						<button className="button" onClick={updateGroups}>Update</button>
					</div>
				</div>
			</Popup>
		</div>
	);
});
