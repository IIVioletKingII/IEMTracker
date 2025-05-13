import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";

import '../css/CheckoutPage.css'
import Popup from '../components/Popup.tsx';
import Navbar from '../components/Navbar.tsx';

import { invokeCheckoutEIMs } from '../assets/aws.ts';

import TextField from '@mui/material/TextField';

// test link: http://localhost:5173/IEMTracker/checkout?token=1f858dab-853a-41a5-8bf6-b9fa8f073174

export default memo(function Page() {
	const auth = useAuth();
	const navigate = useNavigate();
	let error = '';

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
		// navigate('/', { 'state': { 'fromInsideApp': true } })
	};

	function checkout() {
		const idToken = auth.user?.id_token;
		const userId = auth.user?.profile['cognito:username'];
		const token = params['token'];

		if (!auth.isAuthenticated) {
			error = 'Invalid authentication.';
		} else if (auth.isLoading) {
			error = 'Still loading.';
		} else if (typeof idToken != 'string') {
			error = 'Invalid auth id token.';
		} else if (typeof userId != 'string') {
			error = 'Invalid user id.';
		} else if (typeof token != 'string') {
			error = 'Invalid checkout token.';
		} else {
			checkoutIEMs(idToken, userId, token);
		}

		if (error) {
			closeCheckoutPopup();
			openErrorPopup();
		}
	}

	async function checkoutIEMs(idToken: string, userId: string, token: string) {

		const payload = {
			userId,
			token,
			userName: inputName,
			earbudType: inputType
		};

		const response = await invokeCheckoutEIMs(idToken, payload);
		console.log('response', response);
		const body = JSON.parse(response.body);
		console.log('body', body);

		if (response.statusCode === 200) {
			console.log('Getting new borrows', response);
			navigate('/home', { 'state': { 'fromInsideApp': true } })
		} else {
			// console.log('Invalid response', response);
			error = body.message ?? 'Error: no error';
			openErrorPopup();
		}
	}

	return (
		<div className="checkout-page">
			<Navbar />
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
					<TextField label="Type"
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
