// ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ComponentProps } from '../assets/types';
import HeroPage from '../pages/HeroPage';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';




export default function ProtectedRoute({ children }: ComponentProps) {
	const navigate = useNavigate();

	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	async function init() {
		try {
			const user = await getCurrentUser();
			console.log('User is logged in:', user);
		} catch (error) {
			console.log('No user is logged in.', error);
		}

		try {
			const session = await fetchAuthSession();
			console.log('session:', session);

			if (session.tokens)
				setIsAuthenticated(true);

		} catch (sessionError) {
			console.error('Session fetch failed:', sessionError);
		}

		setIsLoading(false);
	}

	useEffect(() => {
		init();
	}, []);

	useEffect(() => {
		if (!isAuthenticated && !isLoading)
			navigate('/', { state: { fromInsideApp: true } });

	}, [isAuthenticated, isLoading, navigate]);

	if (!isAuthenticated && isLoading) {
		return (
			<HeroPage>
				<span>Authenticating...</span>
			</HeroPage>
		);
	}

	return <>{children}</>;
}