// App.js
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, memo } from 'react';
import { fetchAuthSession, signOut } from '@aws-amplify/auth';

import '../css/Auth.css';

let signedIn = false;
let isAdmin = false;

export default memo(function Auth() {

	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();
	const location = useLocation();
	const redirectURL: string = location.state?.redirectURL ?? '';

	async function init() {

		const session = await fetchAuthSession();
		if (session.tokens)
			signedIn = true;

		const profile = session.tokens?.idToken?.payload;
		if (typeof profile == 'object'
			&& Array.isArray(profile['cognito:groups'])
		) {
			isAdmin = profile['cognito:groups'].includes('Admins');
		}

		console.log('session:', session);

		setLoading(false);
	}


	async function signOutRedirect() {
		await signOut({ global: true });
		navigate(0);
	};


	useEffect(() => {
		console.log('home (auth) redirect', redirectURL);
		init();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (signedIn) {
		return (
			<div className="flex row gap justify-content-center">
				<Link className="button" to="/home">Home</Link>
				<Link className="button" to="/profile">Profile</Link>
				{isAdmin && (<Link className="button" to="/admin">Admin</Link>)}
				{isAdmin && (<Link className="button" to="/users">Users</Link>)}
				<button className="button" onClick={() => signOutRedirect()}>Sign out</button>
			</div>
		);
	}

	return (
		<div className="flex row gap justify-content-center">
			<Link className="button" to="/signin" state={{ redirectURL }}>Sign in</Link>
			<Link className="button" to="/signup" state={{ redirectURL }}>Create Account</Link>
		</div>
	);
});