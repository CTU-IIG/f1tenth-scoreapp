"use strict";

import React from 'react';
import { NavLink } from '../router/compoments';
import { useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { R_ROOT, R_SETTINGS, R_TEAMS, R_TRIALS } from '../routes';
import { WebSocketInfo } from './ws';


export const AppHeader = React.memo((props) => {

	const t = useFormatMessageIdAsTagFn();

	return (
		<header className="app-header">

			<div className="container">

				<div className="app-name">
					{t`header.appName`}
				</div>

				<nav className="app-navigation">
					<ul className="left">
						<li>
							<NavLink name={R_ROOT}>{t`titles.home`}</NavLink>
						</li>
						<li>
							<NavLink name={R_TEAMS}>{t`titles.teams`}</NavLink>
						</li>
						<li>
							<NavLink name={R_TRIALS}>{t`titles.trials`}</NavLink>
						</li>
						{/*<li>*/}
						{/*	<NavLink name={R_PRESENTATION}>{t`titles.presentation`}</NavLink>*/}
						{/*</li>*/}
					</ul>
					<ul className="right">
						<li>
							<NavLink name={R_SETTINGS}>{t`titles.settings`}</NavLink>
						</li>
						<li>
							<WebSocketInfo />
						</li>
					</ul>
				</nav>

			</div>

		</header>
	);

});

export const App = ({ children }) => {

	const t = useFormatMessageIdAsTagFn();

	return (
		<>
			<AppHeader />

			<main className="app-content">
				<div className="container">
					{children}
				</div>
			</main>

			<footer className="app-footer">
				<p>&copy; 2021 <a href="https://github.com/CTU-IIG">IIRC, CTU in Prague</a></p>
				<p>{t`footer.sourceCode`} <a href="https://github.com/CTU-IIG/f1tenth-scoreapp">GitHub</a></p>
			</footer>
		</>
	);

};

export const LoadingScreen = () => {

	const t = useFormatMessageIdAsTagFn();

	return (
		<div className="loading-screen">
			<div className="loading-screen-message">
				{t`ui.loading`}
			</div>
			<div className="loading-screen-message-spinner sk-flow">
				<div className="sk-flow-dot" />
				<div className="sk-flow-dot" />
				<div className="sk-flow-dot" />
			</div>
		</div>
	);

};

export interface LoadingErrorProps {
	error?: any;
}

export const LoadingError = ({ error }: LoadingErrorProps) => {

	const t = useFormatMessageIdAsTagFn();

	return (
		<div className="loading-error">
			{t`ui.loadingError`}
			{typeof error?.code === 'string' && <><br />Code: {error.code}</>}
			{typeof error?.message === 'string' && <><br />Message: {error.message}</>}
			{typeof error?.status === 'number' && <><br />HTTP Status: {error.status}</>}
		</div>
	);

};
