import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { useLocation, useNavigate } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const SignIn: React.FC = () => {

	const navigate = useNavigate();

	const location = useLocation();
	const redirectURL: string = location.state?.redirectURL ?? '';

	const pageLoadTime = useRef(Date.now());

	const [pageLoading, setPageLoading] = useState(true);

	const [email, setEmail] = useState('');
	const [signedIn, setSignedIn] = useState(false);

	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const [error, setError] = useState<string | null>(null);
	const [loadingIn, setLoadingIn] = useState(false);
	const [loadingOut, setLoadingOut] = useState(false);

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	function changePassword(pw: string) {
		// const oldPWLength = password.length;
		setPassword(pw);
		// check if new password was autofilled or pasted and auto sign in
		// if ((pw.length > oldPWLength || pw.length < oldPWLength - 2)
		// 	&& timeSInceLoad() > 500)
		// 	handleSignIn(pw);
	}

	function timeSInceLoad() {
		return Date.now() - pageLoadTime.current;
	}

	async function handleSignIn(pwOverride?: string) {
		const actualPw = pwOverride ?? password;

		setLoadingIn(true);
		setError(null);
		try {
			const user = await signIn({ username: email, password: actualPw });
			// Redirect or update UI here after successful sign-in
			if (user.isSignedIn) {
				if (redirectURL)
					window.location.href = redirectURL;
				else
					navigate('/');
			} else {
				navigate('/signup', { 'state': { user, email, password: actualPw, redirectURL } });
			}
		} catch (err: any) {
			setError(err.message ?? 'Error signing in');
		} finally {
			setLoadingIn(false);
		}
	};

	async function handleSignOut() {

		setLoadingOut(true);
		setError(null);
		await signOut({ global: true });

		setLoadingOut(false);
		setSignedIn(false);
	}

	function homeLink() {
		navigate('/', { 'state': { redirectURL } });
	}

	async function init() {
		const session = await fetchAuthSession();
		setPageLoading(false);
		setSignedIn(!!session.credentials)
	}

	useEffect(() => {
		console.log('sign in redirect', redirectURL);
		init();
	}, [signedIn]);

	return (
		<div className='signin-page'>
			<Navbar homeLink={homeLink}><h2>Sign In</h2></Navbar>

			<div className="block">
				<div className="flex col gap justify-content-center">

					<TextField label="Name"
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
							onChange={(e) => changePassword(e.target.value)}
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

					{error && <span className='color failure'>{error}</span>}


					{!pageLoading && <div className="flex row gap">

						{!signedIn && <button className='button' onClick={() => handleSignIn()} disabled={loadingIn}>
							{loadingIn ? 'Signing in...' : 'Sign in'}
						</button>}
						{signedIn && <button className='button' onClick={handleSignOut} disabled={loadingOut}>
							{loadingOut ? 'Signing out...' : 'Sign out'}
						</button>}
					</div>}
				</div>
			</div>
		</div>
	);
};

export default SignIn;
