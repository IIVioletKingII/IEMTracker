import { type ReactNode } from 'react';

export type BorrowRecord = {
	name: string,
	checkout_date: string,
	checkout_user_id: string,
	earbud_type: string,
	return_by: string,
	return_date: string,
}

export type Token = {
	token: string,
	date_created: string,
	created_by_id: string,
	created_by_name: string
}

export type ComponentProps = {
	readonly children?: ReactNode;
};