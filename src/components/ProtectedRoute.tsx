// ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ComponentProps } from '../assets/types';
import HeroPage from '../pages/HeroPage';
import { fetchAuthSession } from 'aws-amplify/auth';

// const URI = import.meta.env.VITE_PUBLIC_URI;

export default function ProtectedRoute({ children }: ComponentProps) {
	const navigate = useNavigate();

	const [authStatus, setAuthStatus] = useState({
		isAuthenticated: false,
		isLoading: true,
	});

	async function init() {

		try {
			const session = await fetchAuthSession();
			console.log('session:', session);
			setAuthStatus({
				isAuthenticated: !!session.tokens,
				isLoading: false,
			});

		} catch (sessionError) {
			console.error('Session fetch failed:', sessionError);
			setAuthStatus({
				isAuthenticated: false,
				isLoading: false,
			});
		}
	}

	useEffect(() => {
		init();
	}, []);

	useEffect(() => {
		if (!authStatus.isAuthenticated && !authStatus.isLoading) {
			const currentURL = window.location.href;
			console.log('protected url', currentURL);

			if (currentURL.includes('token'))
				navigate('/', { state: { redirectURL: currentURL } });
			else
				navigate('/');
		}

	}, [authStatus, navigate]);

	if (authStatus.isLoading || !authStatus.isAuthenticated) {
		return (
			<HeroPage>
				<span>Authenticating...</span>
			</HeroPage>
		);
	}

	return <>{children}</>;
}