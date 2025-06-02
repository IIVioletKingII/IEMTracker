import { useState, memo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AwsCredentialIdentity } from "@aws-sdk/types";

import '../css/CheckoutPage.css'
import Popup from '../components/Popup.tsx';
import Navbar from '../components/Navbar.tsx';
import { fetchAuthSession, type AuthSession, fetchUserAttributes } from 'aws-amplify/auth';

import { invokeCheckoutEIMs } from '../assets/aws.ts';
import TextField from '@mui/material/TextField';

// test link: http://localhost:5173/IEMTracker/checkout?token=1f858dab-853a-41a5-8bf6-b9fa8f073174

export default memo(function Page() {
	const navigate = useNavigate();

	const sessionRef = useRef<AuthSession | undefined>(undefined);

	const [redirectURL, setRedirectURL] = useState('/');

	const [error, setError] = useState('');
	const [inputName, setInputName] = useState('');
	const [inputType, setInputType] = useState('');

	const [isCheckoutPopupOpen, setIsCheckoutPopupOpen] = useState(true);
	const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);

	const params = Object.fromEntries(new URLSearchParams(window.location.search));

	const openCheckoutPopup = () => {
		setIsCheckoutPopupOpen(true);
	};

	const closeCheckoutPopup = () => {
		setIsCheckoutPopupOpen(false);
	};

	const openErrorPopup = () => {
		setIsErrorPopupOpen(true);
	};

	const closeErrorPopup = () => {
		setIsErrorPopupOpen(false);
	};

	async function checkout() {

		const session = sessionRef.current ?? await fetchAuthSession();
		sessionRef.current = session;

		const token = params['token'];

		const profile = session.tokens?.idToken?.payload;
		if (session.credentials
			&& profile
			&& profile.sub
			&& typeof token == 'string'
		) {
			const userAttributes = await fetchUserAttributes();
			console.log('userAttributes', userAttributes);
			checkoutIEMs(session.credentials, profile.sub, token);
		} else {
			setError('Invalid credentials');
		}

		if (error) {
			closeCheckoutPopup();
			openErrorPopup();
		}
	}

	async function checkoutIEMs(credentials: AwsCredentialIdentity, userId: string, token: string) {

		const payload = {
			userId,
			token,
			userName: inputName,
			earbudType: inputType
		};

		const response = await invokeCheckoutEIMs(credentials, payload);
		console.log('response', response);
		const body = JSON.parse(response.body);
		console.log('body', body);

		if (response.statusCode === 200) {
			console.log('Getting new borrows', response);
			navigate('/home', { 'state': { 'fromInsideApp': true } })
		} else {
			console.log('Invalid response', response);
			setError(body.message ?? 'Error: no error');

			openErrorPopup();
		}
	}

	function homeLink() {
		navigate('/', { 'state': { redirectURL } });
	}

	async function init() {

		console.log('init checkout page');


		const session = await fetchAuthSession();
		sessionRef.current = session;
		if (session.credentials) {
			const userAttributes = await fetchUserAttributes();
			setInputName(userAttributes.nickname ?? userAttributes.name ?? '');
		} else {
			setRedirectURL(window.location.href);
			navigate('/', { 'state': { redirectURL } })
			// console.log('Not signed in', redirectURL);
		}
	}

	useEffect(() => {
		init();
	}, []);

	return (
		<div className="checkout-page">
			<Navbar homeLink={homeLink}><h2>Checkout IEMs</h2></Navbar>
			<div className="block">
				<button className='button' onClick={openCheckoutPopup}>Checkout</button>
			</div>
			<Popup isOpen={isCheckoutPopupOpen} onClose={closeCheckoutPopup}>
				<h2>Checkout IEMs</h2>
				<div className="flex col gap">
					<TextField label="Name"
						variant="outlined"
						value={inputName}
						onChange={(e) => setInputName(e.target.value)}
						fullWidth
					></TextField>
					<span>Enter the type of IEMs (215 or 425) or any markings like their label or number.</span>
					<TextField label="Earbud Info"
						variant="outlined"
						value={inputType}
						onChange={(e) => setInputType(e.target.value)}
						fullWidth
					></TextField>
					<div className="flex row justify-content-flex-end">
						<button className='button' onClick={checkout}>Checkout</button>
					</div>
				</div>
			</Popup>
			<Popup isOpen={isErrorPopupOpen} onClose={closeErrorPopup}>
				<h2>Error</h2>
				<span>{error}</span>
				<div className="flex row justify-content-flex-end">
					<button className='button' onClick={closeErrorPopup}>Close</button>
				</div>
			</Popup>
		</div>
	);
});
