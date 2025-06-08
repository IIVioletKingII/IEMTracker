import { type ReactNode } from 'react';

export type BorrowRecord = {
	name: string,
	checkout_date: string,
	checkout_user_id?: string,
	earbud_type?: string,
	return_by_date?: string,
	returned_date?: string,
}

export type Token = {
	token: string,
	date_created: string,
	return_by_date: string,
	created_by_id: string,
	created_by_name: string
}

export type ComponentProps = {
	readonly children?: ReactNode;
};

export type UserAttributes = {
	email?: string;
	email_verified?: string;
	phone_number?: string;
	phone_number_verified?: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	birthdate?: string;
	gender?: string;
	locale?: string;
	preferred_username?: string;
	[key: string]: string | undefined; // allows custom attributes like 'custom:role'
}