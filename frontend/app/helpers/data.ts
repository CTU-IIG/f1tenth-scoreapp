"use strict";

import { useCallback, useEffect, useState } from 'react';
import { useAppSateValue } from './hooks';


export type QueryExecutor<QueryResult> = (restUrl: string) => Promise<QueryResult>;

export interface QueryOperationLoading<T> {
	loading: true;
	hasError: false;
	data: undefined;
}

export interface QueryOperationSuccess<T> {
	loading: false;
	hasError: false;
	data: T;
}

export interface QueryOperationError<T> {
	loading: false;
	hasError: true;
	error: any;
	data: undefined;
}

export type QueryOperation<T> = QueryOperationLoading<T> | QueryOperationSuccess<T> | QueryOperationError<T>;


interface QueryHookState<T> {
	restUrl: string;
	query: QueryExecutor<T>;
	value: QueryOperation<T>;
}

interface QueryHookOperationUpdater<T> {
	(prev: QueryOperation<T>): QueryOperation<T>;
}

interface QueryHookReturnValue<T> {
	op: QueryOperation<T>;
	updateOp: (updater: QueryHookOperationUpdater<T>) => void;
}

export const useQuery = <T>(query: QueryExecutor<T>): QueryHookReturnValue<T> => {

	// NOTE: This hook is based on useSubscription. See useSubscription.ts for reasoning and comments.

	const [restUrl] = useAppSateValue('restUrl');

	const [state, setState] = useState<QueryHookState<T>>(() => ({
		restUrl,
		query,
		value: {
			loading: true,
			hasError: false,
			data: undefined,
		},
	}));

	const updateOp = useCallback(
		(updater: QueryHookOperationUpdater<T>) => setState(prevState => {

			const newValue = updater(prevState.value);

			if (newValue === prevState.value) {
				return prevState;
			}

			return {
				...prevState,
				value: newValue,
			};

		}),
		[setState],
	);

	let valueToReturn = state.value;

	if (state.restUrl !== restUrl || state.query !== query) {

		valueToReturn = {
			loading: true,
			hasError: false,
			data: undefined,
		};

		setState({
			restUrl,
			query,
			value: valueToReturn,
		});

	}

	useEffect(() => {

		let didCleanup = false;

		const executeQuery = async () => {

			if (didCleanup) {
				return;
			}

			let value: QueryOperation<T>;

			try {
				const data = await query(restUrl);
				value = {
					loading: false,
					hasError: false,
					data,
				};
			} catch (err) {
				value = {
					loading: false,
					hasError: true,
					error: err,
					data: undefined,
				};
			}

			if (didCleanup) {
				console.warn('finished but unsubscribed');
				return;
			}

			setState((prevState) => {

				// Ignore values from stale sources!
				// Since we subscribe an unsubscribe in a passive effect,
				// it's possible that this callback will be invoked for a stale (previous) subscription.
				// This check avoids scheduling an update for that stale subscription.
				if (prevState.restUrl !== restUrl || prevState.query !== query) {
					return prevState;
				}

				return {
					...prevState,
					value,
				};

			});

		};

		// noinspection JSIgnoredPromiseFromCall
		executeQuery();

		return () => {
			console.log('[useQuery] didCleanup = true');
			didCleanup = true;
		};

	}, [restUrl, query]);

	// Return the current value for our caller to use while rendering.
	return { op: valueToReturn, updateOp };

};
