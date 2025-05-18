import "../css/HeroPage.css";
import { type ReactNode } from 'react';

export default function HeroPage({ children }: { readonly children: ReactNode }) {
	return (
		<div className="hero-page flex col align-items-center">
			<img src="/IEMTracker/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="hero-page-hero" />
			{children}
		</div>
	);
};