"use strict";

import React from 'react';

import StoreContext from '../store/StoreContext';
import Store from '../store/Store';
import WebSocketManagerContext from '../ws/WebSocketManagerContext';
import WebSocketManager from '../ws/WebSocketManager';
import RouterContext from '../router/RouterContext';
import Router from '../router/Router';

import LocaleLoader from './LocaleLoader';
import TopLevelRouter from './TopLevelRouter';

import { AppState } from '../types';


export interface RootProps {
	store: Store<AppState>;
	manager: WebSocketManager;
	router: Router;
}

const Root = ({ store, manager, router }: RootProps) => {

	return (
		<StoreContext.Provider value={store}>
			<WebSocketManagerContext.Provider value={manager}>
				<RouterContext.Provider value={router}>
					<LocaleLoader>
						<TopLevelRouter />
					</LocaleLoader>
				</RouterContext.Provider>
			</WebSocketManagerContext.Provider>
		</StoreContext.Provider>
	);

};

export default Root;
