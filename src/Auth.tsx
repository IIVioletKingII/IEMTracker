// App.js

import { useAuth } from "react-oidc-context";

export default function Auth() {
	const auth = useAuth();

	const signOutRedirect = () => {
		const clientId = "2pl4ha6s3afos3vfcqbcifg4b2";
		const logoutUri = "<logout uri>";
		const cognitoDomain = "https://us-east-2ubvb9dhvm.auth.us-east-2.amazoncognito.com";
		window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
	};

	if (auth.isLoading) {
		return <div>Loading...</div>;
	}

	if (auth.error) {
		return <div>Encountering error... {auth.error.message}</div>;
	}

	if (auth.isAuthenticated) {
		console.log('authenticated', auth);

		return (
			<div>
				<pre> Hello: {auth.user?.profile.email} </pre>
				<pre> ID Token: {auth.user?.id_token} </pre>
				<pre> Access Token: {auth.user?.access_token} </pre>
				<pre> Refresh Token: {auth.user?.refresh_token} </pre>

				<button onClick={() => auth.removeUser()}>Sign out</button>
			</div>
		);
	}

	return (
		<div>
			<button onClick={() => auth.signinRedirect()}>Sign in</button>
			<button onClick={() => signOutRedirect()}>Sign out</button>
		</div>
	);
};