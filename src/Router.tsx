import { BrowserRouter as HashRouter, Routes, Route } from 'react-router-dom';
import "./css/Router.css"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';

import Auth from "./components/Auth.tsx";
import AuthPage from './pages/HeroPage.tsx'
import HomePage from './pages/HomePage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage.tsx';
import SignoutPage from './pages/SignoutPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';

export default function Router() {

	const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

	const theme = useMemo(() =>
		createTheme({
			palette: {
				mode: prefersDarkMode ? 'dark' : 'light',
			},
		}), [prefersDarkMode]);

	return (
		<ThemeProvider theme={theme}>
			<HashRouter basename='/IEMTracker'>
				<Routes>
					<Route
						path='/'
						element={
							<AuthPage>
								<Auth />
							</AuthPage>
						}
					/>
					<Route
						path='/home'
						element={
							<ProtectedRoute>
								<HomePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/checkout'
						element={
							<ProtectedRoute>
								<CheckoutPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/admin'
						element={
							<ProtectedRoute>
								<AdminPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/profile'
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route path='/signout' element={<SignoutPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</HashRouter>
		</ThemeProvider>

	);
};