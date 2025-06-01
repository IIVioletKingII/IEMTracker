import Navbar from "../components/Navbar"
import { fetchAuthSession } from "@aws-amplify/core";
import { getCurrentUser, fetchUserAttributes, type UserAttributeKey, updateUserAttributes } from "@aws-amplify/auth";
import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Popup from "../components/Popup";
import '../css/ProfilePage.css';

export default function ProfilePage() {

	const [updateResult, setUpdateResult] = useState('');
	const [updateResultClass, setUpdateResultClass] = useState('');

	const [originalAttributes, setOriginalAttributes] = useState<Partial<Record<UserAttributeKey, string>>>({});
	const [inputName, setInputName] = useState('');
	const [inputNickname, setInputNickname] = useState('');
	const [inputEmail, setInputEmail] = useState('');
	const [inputPassword, setInputPassword] = useState('');

	const [isPopupEmailOpen, setIsPopupEmailOpen] = useState(false);
	const [isPopupPasswordOpen, setIsPopupPasswordOpen] = useState(false);

	function closePopupEmail() {
		setIsPopupEmailOpen(false);
	}

	function closePopupPassword() {
		setIsPopupPasswordOpen(false);
	}

	async function updateName() {
		console.log('original', originalAttributes);
		console.log('new', inputName);

		setUpdateResult('');

		const res = await updateUserAttributes({
			userAttributes: {
				name: inputName,
				nickname: inputNickname
			},
		});

		console.log('result', res);
		if (res.name.isUpdated && res.nickname.isUpdated) {
			setUpdateResult('Successfully changed your name.');
			setUpdateResultClass('success');
		} else {
			setUpdateResult('Error changing your name.');
			setUpdateResultClass('failure');
		}

	}

	function updateEmail() {
		// TO-DO: complicated verification flow
	}

	function updatePassword() {
		// TO-DO: complicated verification flow
	}

	async function init() {

		const session = await fetchAuthSession();
		if (session.credentials) {

			const userAttributes = await fetchUserAttributes();
			console.log('userAttributes', userAttributes);
			setOriginalAttributes(userAttributes);
			setInputName(userAttributes.name ?? '');
			setInputNickname(userAttributes.nickname ?? '');
		}
	}

	useEffect(() => {
		init();
	}, []);

	return (
		<div>
			<Navbar><h2>Profile</h2></Navbar>
			<div className="flex row">
				<div className="block flex col gap align-items-flex-start">
					<TextField label="Full Name"
						variant="outlined"
						value={inputName}
						onChange={(e) => setInputName(e.target.value)}
					/>
					<TextField label="Nickname"
						variant="outlined"
						value={inputNickname}
						onChange={(e) => setInputNickname(e.target.value)}
					/>
					<button className="button" onClick={updateName}>Save</button>
					<span className={`color-span ${updateResultClass}`}>{updateResult}</span>
				</div>
				<div className="block flex row gap align-items-flex-start">

					<button className="button" disabled={true} onClick={() => setIsPopupEmailOpen(true)}>Change email</button>
					<button className="button" disabled={true} onClick={() => setIsPopupPasswordOpen(true)}>Change password</button>
				</div>
			</div>

			<Popup isOpen={isPopupEmailOpen} onClose={closePopupEmail}>
				<h2>Change email</h2>
				<span>You will be sent a confirmation email</span>
				<TextField label="Email Address"
					variant="outlined"
					value={inputEmail}
					onChange={(e) => setInputEmail(e.target.value)}
				/>
				<div className="flex justify-content-flex-end margin-top">
					<button className="button" onClick={updateEmail}>Update</button>
				</div>
			</Popup>
			<Popup isOpen={isPopupPasswordOpen} onClose={closePopupPassword}>
				<h2>Change email</h2>
				<span>Are you sure you want to return earbuds?</span>
				<TextField label="Current password"
					variant="outlined"
					value={inputPassword}
					onChange={(e) => setInputPassword(e.target.value)}
				/>
				<TextField label="New password"
					variant="outlined"
					value={inputPassword}
					onChange={(e) => setInputPassword(e.target.value)}
				/>
				<TextField label="New password"
					variant="outlined"
					value={inputPassword}
					onChange={(e) => setInputPassword(e.target.value)}
				/>
				<div className="flex justify-content-flex-end margin-top">
					<button className="button" onClick={updatePassword}>Update</button>
				</div>
			</Popup>
		</div >
	)
}