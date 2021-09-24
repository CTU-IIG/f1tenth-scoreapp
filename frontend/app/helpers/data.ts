"use strict";

import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../store/hooks';
import { AppState } from '../types';
import Store from '../store/Store';


export type QueryExecutor<QueryResult> = (restUrl: string, token: string | undefined) => Promise<QueryResult>;

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
	store: Store<AppState>;
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

	const store = useStore<AppState>();

	const [state, setState] = useState<QueryHookState<T>>(() => ({
		store,
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

	if (state.store !== store || state.query !== query) {

		valueToReturn = {
			loading: true,
			hasError: false,
			data: undefined,
		};

		setState({
			store,
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

			const restUrl = store.get('restUrl');
			const token = store.get('authToken');

			try {
				const data = await query(restUrl, token);
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
				if (prevState.store !== store || prevState.query !== query) {
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

	}, [store, query]);

	// Return the current value for our caller to use while rendering.
	return { op: valueToReturn, updateOp };

};
