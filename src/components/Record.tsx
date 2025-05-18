import { type ReactNode } from 'react';
import '../css/Record.css'

export default function Record({ icon, classes = '', children }: { readonly icon: string, readonly classes?: string, readonly children: ReactNode }) {

	return (
		<div className={`record-container align-items-center ${classes}`}>
			<span className="material-icons">{icon}</span>
			{children}
		</div >
	);
};