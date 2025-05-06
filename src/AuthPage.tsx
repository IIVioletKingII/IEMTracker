import Auth from "./Auth.tsx";
import "./AuthPage.css";

export default function AuthPage() {
	return (
		<div className="auth-page">
			<img src="/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="auth-hero" />
			<Auth />
		</div>
	);
};