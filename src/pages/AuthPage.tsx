import Auth from "../components/Auth.tsx";
import "../css/AuthPage.css";

export default function AuthPage() {
	return (
		<div className="auth-page">
			<img src="/IEMTracker/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="auth-hero" />
			<Auth />
		</div>
	);
};