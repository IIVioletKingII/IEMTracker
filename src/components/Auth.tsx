// App.js

import { useAuth } from "react-oidc-context";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect, memo } from 'react';
import { getUserAttributes } from '../assets/aws';
import { getCurrentUser, fetchAuthSession, signOut } from '@aws-amplify/auth';

import '../css/Auth.css';

const URI = import.meta.env.VITE_PUBLIC_URI;

let signedIn = false;
let isAdmin = false;

export default memo(function Auth() {

	const [loading, setLoading] = useState(true);
	// const [isAdmin, setIsAdmin] = useState(true);

	const navigate = useNavigate();
	const location = useLocation();
	const fromInsideApp: boolean = location.state?.fromInsideApp;

	async function init() {

		try {
			const user = await getCurrentUser();
			console.log('User is logged in:', user);
		} catch (error) {
			console.log('No user is logged in.', error);
		}

		const session = await fetchAuthSession();
		if (session.tokens)
			signedIn = true;

		const idToken = session.tokens?.idToken?.payload;
		if (typeof idToken == 'object'
			&& Array.isArray(idToken['cognito:groups'])
		) {
			isAdmin = idToken['cognito:groups'].includes('Admins');
		}

		console.log('session:', session);


		setLoading(false);
	}


	async function signOutRedirect() {
		await signOut({ global: true });
		navigate(0);
	};


	useEffect(() => {
		init();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}


	if (signedIn) {
		return (
			<div className="flex row gap justify-content-center">
				<Link className="button" to="/home" state={{ 'fromInsideApp': true }}>Home</Link>
				<Link className="button" to="/profile" state={{ 'fromInsideApp': true }}>Profile</Link>
				{isAdmin && (<Link className="button" to="/admin" state={{ 'fromInsideApp': true }}>Admin</Link>)}
				{isAdmin && (<Link className="button" to="/users" state={{ 'fromInsideApp': true }}>Users</Link>)}
				<button className="button" onClick={() => signOutRedirect()}>Sign out</button>
			</div>
		);
	}

	return (
		<div className="flex row gap justify-content-center">
			<Link className="button" to="/signin" state={{ 'fromInsideApp': true }}>Sign in</Link>
			{/* <button className="button" onClick={() => signOutRedirect()}>Sign out</button> */}
		</div>
	);
});