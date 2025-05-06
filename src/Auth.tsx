// App.js

import { useAuth } from "react-oidc-context";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Auth() {
	const auth = useAuth();

	const navigate = useNavigate();

	const signOutRedirect = () => {
		const clientId = "2pl4ha6s3afos3vfcqbcifg4b2";
		const logoutUri = "<logout uri>";
		const cognitoDomain = "https://us-east-2ubvb9dhvm.auth.us-east-2.amazoncognito.com";
		window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
	};

	useEffect(() => {
		if (auth.isAuthenticated)
			navigate('/home');
	}, [navigate]);

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
		<div className="flex row justify-content-center">
			<button className="button" onClick={() => auth.signinRedirect()}>Sign in</button>
			<button className="button" onClick={() => signOutRedirect()}>Sign out</button>
		</div>
	);
};