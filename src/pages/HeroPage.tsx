import "../css/HeroPage.css";
import { type ReactNode } from 'react';

export default function AuthPage({ children }: { readonly children: ReactNode }) {
	return (
		<div className="hero-page">
			<img src="/IEMTracker/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="hero-page-hero" />
			{children}
		</div>
	);
};