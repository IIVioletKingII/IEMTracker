import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { signIn, signUp, fetchAuthSession, type SignInOutput, confirmSignUp } from 'aws-amplify/auth';
import { useLocation, useNavigate } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Popup from '../components/Popup';

const SignUp: React.FC = () => {

	const location = useLocation();
	const redirectURL: string = location.state?.redirectURL ?? '';
	const user: SignInOutput = location.state?.user;

	const navigate = useNavigate();
	const [pageLoading, setPageLoading] = useState(true);

	const [signUpMessage, setSignUpMessage] = useState('You should have been sent a code. Enter it to confirm your account.');

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [verificationCode, setVerificationCode] = useState('');

	const [password, setPassword] = useState('');
	const [password2, setPassword2] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showPassword2, setShowPassword2] = useState(false);

	const [error, setError] = useState<string | null>(null);
	const [loadingAccount, setLoadingAccount] = useState(false);

	const [isPopupTFAOpen, setIsPopupTFAOpen] = useState(false);

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	async function handleCreateAccount() {

		if (!name)
			setError('Missing name.');
		else if (!email)
			setError('Missing email.');
		else if (!password)
			setError('Missing password.');
		else if (password !== password2)
			setError("Passwords don't match.");
		else {
			createAccount();
			return;
		}

		setLoadingAccount(false);

	}

	async function confirmAccount() {
		const { nextStep } = await confirmSignUp({
			username: email,
			confirmationCode: verificationCode,
		});

		if (nextStep.signUpStep === 'DONE') {
			console.log('SignUp Complete!');
			if (password) {
				const res = await signIn({ username: email, password });
				console.log('sign in', res);
			}
			signUserIn();
		}
	}

	async function signUserIn() {

		// Redirect or update UI here after successful sign-in
		// const params: urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
		// console.log('sign in params', params);

		if (redirectURL)
			window.location.href = redirectURL;
		else
			navigate('/');
	}

	async function createAccount() {
		setLoadingAccount(true);
		setError(null);
		try {
			const { isSignUpComplete, nextStep } = await signUp({
				username: email,
				password: password,
				options: {
					userAttributes: {
						email: email,
						name: name
					},
				}
			});

			if (!isSignUpComplete && nextStep.signUpStep == 'CONFIRM_SIGN_UP') {
				const details = nextStep.codeDeliveryDetails;
				setSignUpMessage(`Confirmation code was sent via ${details.deliveryMedium?.toLocaleLowerCase()} to ${details.destination}. Please enter the code to confirm your acount.`)
				setIsPopupTFAOpen(true);
			} else {
				signUserIn();
			}

		} catch (err: any) {
			setError(err.message ?? 'Error signing in');
		} finally {
			setLoadingAccount(false);
		}

	}

	function closePopupTFA() {
		setIsPopupTFAOpen(false);
	}

	function homeLink() {
		navigate('/', { 'state': { redirectURL } });
	}

	async function init() {
		const session = await fetchAuthSession();

		if (session.credentials) {
			navigate('/signin');
		} else if (user) {
			setIsPopupTFAOpen(true);
		}

		if (location.state?.email)
			setEmail(location.state.email);
		if (location.state?.password) {
			setPassword(location.state.password);
			setPassword2(location.state.password);
		}

		setPageLoading(false);
	}

	useEffect(() => {
		console.log('sign up redirect', redirectURL);

		init();
	}, []);

	return (
		<div className='signin-page'>
			<Navbar homeLink={homeLink}><h2>Create Account</h2></Navbar>

			<div className="block">
				<div className="flex col gap justify-content-center">

					<TextField label="Name"
						variant="outlined"
						value={name}
						onChange={(e) => setName(e.target.value)}
					></TextField>
					<TextField label="Email"
						variant="outlined"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					></TextField>
					<FormControl variant="outlined">
						<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
						<OutlinedInput
							id="outlined-adornment-password"
							type={showPassword ? 'text' : 'password'}

							value={password}
							onChange={(e) => setPassword(e.target.value)}
							endAdornment={
								<InputAdornment position="end">
									<IconButton
										aria-label={
											showPassword ? 'hide the password' : 'display the password'
										}
										onClick={() => setShowPassword((show) => !show)}
										onMouseDown={handleMouseDownPassword}
										onMouseUp={handleMouseUpPassword}
										edge="end"
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							}
							label="Password"
						/>
					</FormControl>
					<FormControl variant="outlined">
						<InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
						<OutlinedInput
							id="outlined-confirm-password"
							type={showPassword2 ? 'text' : 'password'}

							value={password2}
							onChange={(e) => setPassword2(e.target.value)}
							endAdornment={
								<InputAdornment position="end">
									<IconButton
										aria-label={
											showPassword2 ? 'hide the password' : 'display the password'
										}
										onClick={() => setShowPassword2((show) => !show)}
										onMouseDown={handleMouseDownPassword}
										onMouseUp={handleMouseUpPassword}
										edge="end"
									>
										{showPassword2 ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							}
							label="PasswordConfirm"
						/>
					</FormControl>

					{error && <span className='color failure'>{error}</span>}

					{!pageLoading && <div className="flex row gap">

						{/* <Link className="button" to="/signin" state={{ 'fromInsideApp': true }}>Sign In</Link> */}
						<button className='button' onClick={handleCreateAccount} disabled={loadingAccount}>
							{loadingAccount ? 'Creating Account...' : 'Create Account'}
						</button>

					</div>}
				</div>
			</div>

			<Popup isOpen={isPopupTFAOpen} onClose={closePopupTFA}>
				<h2>Confirmation</h2>
				<div className="flex col gap" style={({ 'gap': '1.5rem' })}>
					<span>{signUpMessage}</span>
					<TextField label="Code"
						variant="outlined"
						value={verificationCode}
						onChange={(e) => setVerificationCode(e.target.value.trim())}
					></TextField>
					<div className="flex justify-content-flex-end" >
						<button className="button" onClick={confirmAccount}>Confirm</button>
					</div>
				</div>
			</Popup>
		</div>
	);
};

export default SignUp;
