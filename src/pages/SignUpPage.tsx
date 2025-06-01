import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { signIn, signUp, fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { Link, useNavigate } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Popup from '../components/Popup';

type urlParams = {
	token?: string;
	[key: string]: string | undefined;
}

const SignUp: React.FC = () => {

	const navigate = useNavigate();
	const [pageLoading, setPageLoading] = useState(true);

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');

	const [password, setPassword] = useState('');
	const [password2, setPassword2] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showPassword2, setShowPassword2] = useState(false);

	const [error, setError] = useState<string | null>(null);
	const [loadingAccount, setLoadingAccount] = useState(false);

	const [isPopupTFAOpen, setPopupTFAOpen] = useState(false);


	// const paramsRef = useRef<urlParams>({});

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

	async function createAccount() {
		setLoadingAccount(true);
		setError(null);
		try {
			const { isSignUpComplete, userId, nextStep } = await signUp({
				username: email,
				password: password,
				options: {
					userAttributes: {
						email: email,
						name: name
					},
				}
			});

			if (!isSignUpComplete && nextStep == 'CONFIRM_SIGN_UP') {
				// open popup and confirm
			}

			console.log('User signed up:', isSignUpComplete, userId, nextStep);
			// Redirect or update UI here after successful sign-in
			const params: urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
			console.log('sign in params', params);

			if (params.redirect)
				window.location.href = params.redirect;
			else
				navigate('/');
		} catch (err: any) {
			setError(err.message ?? 'Error signing in');
		} finally {
			setLoadingAccount(false);
		}

	}

	function closePopupTFA() {
		setPopupTFAOpen(false);
	}

	async function init() {
		const session = await fetchAuthSession();

		if (session.credentials) {
			// await signOut();
			navigate('/signin')
		}
		setPageLoading(false);
		// init();
	}

	useEffect(() => {
		init();
	}, []);

	return (
		<div className='signin-page'>
			<Navbar><h2>Create Account</h2></Navbar>

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

					{error && <span style={{ color: 'red' }}>{error}</span>}

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
				<span>Confirmation code was sent to {'someone here'}</span>
			</Popup>
		</div>
	);
};

export default SignUp;
