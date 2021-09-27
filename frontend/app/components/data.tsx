"use strict";

import { Button, ButtonProps } from './common';
import { QueryExecutor } from '../helpers/data';
import { useStore } from '../store/hooks';
import { AppState } from '../types';
import React, { useCallback, useState } from 'react';
import { IS_DEVELOPMENT, isDefined } from '../helpers/common';


export interface MutationButtonProps<Result> extends ButtonProps {
	query: QueryExecutor<any>;
	onSuccess?: (result: Result) => boolean;
}

// Note: This is not ideal as we do not work with the result,
// but for now it should work ...
export const QueryButton = <Result extends any>({ query, onSuccess, ...otherProps }: MutationButtonProps<Result>) => {

	const store = useStore<AppState>();

	const [state, setState] = useState({
		loading: false,
	});

	const handleClick = useCallback(event => {

		const restUrl = store.get('restUrl');
		const token = store.get('authToken');

		setState(prevState => ({ loading: true }));

		query(restUrl, token)
			.then(result => {
				IS_DEVELOPMENT && console.log(`[QueryButton] result`, result);
				// this is problematic as it can be called even after the component is unmounted
				let changeState = true;
				if (isDefined(onSuccess)) {
					changeState = onSuccess(result);
				}
				if (changeState) {
					setState(prevState => ({ loading: false }));
				}
			})
			.catch(err => {
				console.error(`[QueryButton] error`, err);
				// this is problematic as it can be called even after the component is unmounted
				setState(prevState => ({ loading: false }));
			});

	}, [query, onSuccess, setState, store]);

	return (
		<Button
			{...otherProps}
			disabled={state.loading}
			onClick={handleClick}
		/>
	);

};
