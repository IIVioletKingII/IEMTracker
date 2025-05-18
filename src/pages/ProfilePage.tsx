import Navbar from "../components/Navbar"
import { fetchAuthSession } from "@aws-amplify/core";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';


export default function ProfilePage() {

	const [inputName, setInputName] = useState('');

	async function init() {

		const session = await fetchAuthSession();
		if (session.credentials) {
			const userAttributes = await fetchUserAttributes();
			console.log('userAttributes', userAttributes);
			setInputName(userAttributes.name ?? '');
		}
	}

	useEffect(() => {
		init();
	}, []);

	return (
		<div>
			<Navbar><h2>Profile</h2></Navbar>
			<div className="block flex col gap align-items-flex-start" >
				<TextField label="Full Name"
					variant="outlined"
					value={inputName}
					onChange={(e) => setInputName(e.target.value)}
				/>
				<button className="button">Save</button>
			</div>
		</div >
	)
}