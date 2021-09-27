"use strict";

import React from 'react';
import { Link, NavLink } from '../router/compoments';
import { useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { R_PRESENTATION, R_RACES, R_ROOT, R_SETTINGS, R_TEAMS } from '../routes';
import { WebSocketInfo } from './ws';
import classNames from 'classnames';
import { isDefined } from '../helpers/common';


export const AppHeader = React.memo((props) => {

	const t = useFormatMessageIdAsTagFn();

	return (
		<header className="app-header">

			<div className="container">

				<input id="app-navigation-toggle" type="checkbox" />
				<label id="app-navigation-toggle-label" htmlFor="app-navigation-toggle">
					{t`header.toggleMenu`}
				</label>

				<Link name={R_ROOT} className="app-name">
					{t`header.appName`}
				</Link>

				<nav className="app-navigation">
					<ul className="left">
						<li>
							<NavLink name={R_ROOT}>{t`titles.home`}</NavLink>
						</li>
						<li>
							<NavLink name={R_TEAMS}>{t`titles.teams`}</NavLink>
						</li>
						<li>
							<NavLink name={R_RACES}>{t`titles.races`}</NavLink>
						</li>
						<li>
							<NavLink name={R_PRESENTATION}>{t`titles.presentation`}</NavLink>
						</li>
					</ul>
					<ul className="right">
						<li>
							<NavLink name={R_SETTINGS}>{t`titles.settings`}</NavLink>
						</li>
					</ul>
				</nav>

				<WebSocketInfo />

			</div>

		</header>
	);

});

const routeNameToClassName = (routeName: string) =>
	routeName.toLowerCase().slice(2);

export interface AppProps {
	withFooter?: boolean;
	routeName?: string;
	children: React.ReactNode,
}

export const App = ({ children, withFooter = true, routeName }: AppProps) => {

	const t = useFormatMessageIdAsTagFn();

	return (
		<div className={classNames(
			'app',
			isDefined(routeName) ? `app--${routeNameToClassName(routeName)}` : undefined,
			{ 'app--no-footer': !withFooter },
		)}>
			<AppHeader />

			<main className="app-content">
				<div className="container">
					{children}
				</div>
			</main>

			{withFooter && (
				<footer className="app-footer">
					<p>&copy; 2021 <a href="https://github.com/CTU-IIG">IIRC, CTU in Prague</a></p>
					<p>{t`footer.sourceCode`} <a href="https://github.com/CTU-IIG/f1tenth-scoreapp">GitHub</a></p>
				</footer>
			)}

		</div>
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
