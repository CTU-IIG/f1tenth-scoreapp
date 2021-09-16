"use strict";

import React from 'react';

import StoreContext from '../store/StoreContext';
import Store from '../store/Store';
import RouterContext from '../router/RouterContext';
import Router from '../router/Router';

import LocaleLoader from './LocaleLoader';
import PageRouter from './PageRouter';

import { AppState } from '../types';
import { App } from '../components/layout';


export interface RootProps {
	store: Store<AppState>;
	router: Router;
}

const Root = ({ store, router }: RootProps) => {

	return (
		<StoreContext.Provider value={store}>
				<RouterContext.Provider value={router}>
					<LocaleLoader>
						<App>
							<PageRouter />
						</App>
					</LocaleLoader>
				</RouterContext.Provider>
		</StoreContext.Provider>
	);

};

export default Root;

