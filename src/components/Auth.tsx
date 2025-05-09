// App.js

import { useAuth } from "react-oidc-context";
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, memo } from 'react';

const URI = import.meta.env.VITE_PUBLIC_URI;

export default memo(function Auth() {
	const auth = useAuth();

	const navigate = useNavigate();

	const signOutRedirect = () => {
		const clientId = "2pl4ha6s3afos3vfcqbcifg4b2";
		const logoutUri = `${URI}loggedout`;
		const cognitoDomain = "https://us-east-2ubvb9dhvm.auth.us-east-2.amazoncognito.com";
		window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
	};

	console.log('auth rendor');


	useEffect(() => {
		console.log('effect', auth);

		if (auth.isAuthenticated)
			navigate('/home');
	}, [auth.isAuthenticated, navigate]);

	if (auth.isLoading) {
		return <div>Loading...</div>;
	}

	if (auth.error) {
		return <div>Encountering error... {auth.error.message}</div>;
	}

	if (auth.isAuthenticated) {
		console.log('authenticated', auth);

		return (<div>Logging in...</div>);
	}

	return (
		<div className="flex row gap justify-content-center" style={({ 'gap': '1rem' })}>
			{/* <Link to="/home">Home</Link> */}
			<button className="button" onClick={() => auth.signinRedirect()}>Sign in</button>
			<button className="button" onClick={() => signOutRedirect()}>Sign out</button>
		</div>
	);
});