import React, { useState } from 'react';
import Record from './Record';
import './HomePage.css'

export default function HomePage() {
	const params = Object.fromEntries(new URLSearchParams(window.location.search));

	console.log('url params', params);

	let borrowed = [
		{
			'name': 'Sam',
			'checkout_date': '2025-05-04T15:14:10Z',
			'return_date': '2025-05-04T15:14:10Z',
			'earbud_type': '425'
		},
		{
			'name': 'Devin',
			'checkout_date': '2025-05-04T15:14:10Z',
			'return_date': '2025-05-04T15:14:10Z',
			'earbud_type': '425'
		}
	];

	return (
		<div className="home-page">
			<div className="header">

				<img src="/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="home-hero" />
			</div>
			<br />
			<br />
			{borrowed.map((item, index) => (
				<Record key={index} {...item} />
			))}
		</div>
	);
};