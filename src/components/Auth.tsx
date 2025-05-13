// App.js

import { useAuth } from "react-oidc-context";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useEffect, memo } from 'react';
import { getUserAttributes } from '../assets/aws';

import '../css/Auth.css';

const URI = import.meta.env.VITE_PUBLIC_URI;

export default memo(function Auth() {
	const auth = useAuth();

	const navigate = useNavigate();
	const location = useLocation();
	const fromInsideApp: boolean = location.state?.fromInsideApp;

	async function signOutRedirect() {

		await auth.removeUser();
		auth.revokeTokens();

		const clientId = "7or71c2o1m4ji460vpkf52ae15";
		const logoutUri = `${URI}/signout`;
		const cognitoDomain = "https://us-east-2bzevjhlih.auth.us-east-2.amazoncognito.com";
		window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
	};

	console.log('auth rendor', auth);

	useEffect(() => {
		console.log('effect', auth);

		if (auth.isAuthenticated && !fromInsideApp)
			navigate('/home');

	}, [auth.isAuthenticated, fromInsideApp, navigate]);

	if (auth.isLoading) {
		return <div>Loading...</div>;
	}

	if (auth.error) {
		return <div>Encountering error... {auth.error.message}</div>;
	}

	if (auth.isAuthenticated) {
		console.log('authenticated', auth);

		if (fromInsideApp) {
			const groups = Array.isArray(auth.user?.profile['cognito:groups'])
				? auth.user?.profile['cognito:groups'] as string[]
				: [];
			const isAdmin: boolean = groups.includes('Admins');

			return (
				<div className="flex row gap justify-content-center">
					<Link className="button" to="/home" state={{ 'fromInsideApp': true }}>Home</Link>
					<Link className="button" to="/profile" state={{ 'fromInsideApp': true }}>Profile</Link>
					{isAdmin && <Link className="button" to="/admin" state={{ 'fromInsideApp': true }}>Admin</Link>}
					<button className="button" onClick={() => signOutRedirect()}>Sign out</button>


				</div>
			);
		} else
			return (<div>Logging in...</div>);
	}

	return (
		<div className="flex row gap justify-content-center">
			<button className="button" onClick={() => auth.signinRedirect()}>Sign in</button>
			<button className="button" onClick={() => signOutRedirect()}>Sign out</button>
		</div>
	);
});