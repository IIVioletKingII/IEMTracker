import React, { useState } from 'react';
import { signIn, signOut } from '@aws-amplify/auth';
import Navbar from '../components/Navbar';

import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';

type urlParams = {
	token?: string;
	[key: string]: string | undefined;
}

const SignIn: React.FC = () => {

	const navigate = useNavigate();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loadingIn, setLoadingIn] = useState(false);
	const [loadingOut, setLoadingOut] = useState(false);

	// const paramsRef = useRef<urlParams>({});

	const [showPassword, setShowPassword] = React.useState(false);

	const handleClickShowPassword = () => setShowPassword((show) => !show);

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	async function handleSignIn() {
		setLoadingIn(true);
		setError(null);
		try {
			const user = await signIn({ username, password });
			console.log('User successfully signed in:', user);
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
			setLoadingIn(false);
		}
	};

	async function handleSignOut() {

		setLoadingOut(true);
		setError(null);
		await signOut({ global: true });

		setLoadingOut(false);
	}

	return (
		<div className='signin-page'>
			<Navbar><h2>Sing In</h2></Navbar>
			<div className="block">
				<div className="flex col gap justify-content-center">

					<TextField label="Name"
						variant="outlined"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					></TextField>
					{/* <TextField label="Password"
							variant="outlined"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						></TextField> */}

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
										onClick={handleClickShowPassword}
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

					{error && <span style={{ color: 'red' }}>{error}</span>}

					<div className="flex row gap">

						<button className='button' onClick={handleSignIn} disabled={loadingIn}>
							{loadingIn ? 'Signing in...' : 'Sign in'}
						</button>
						<button className='button' onClick={handleSignOut} disabled={loadingOut}>
							{loadingOut ? 'Signing out...' : 'Sign out'}
						</button>
						<button className='button' onClick={handleSignOut} disabled={loadingOut}>
							Create Account
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignIn;
