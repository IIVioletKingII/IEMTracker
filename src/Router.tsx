import { BrowserRouter as HashRouter, Routes, Route } from 'react-router-dom';
import "./css/Router.css"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';

import AuthPage from './pages/AuthPage.tsx'
import HomePage from './pages/HomePage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

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
					<Route path='/' element={<AuthPage />} />
					<Route path='/home' element={<HomePage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</HashRouter>
		</ThemeProvider>

	);
};