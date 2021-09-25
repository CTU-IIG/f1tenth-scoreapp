"use strict";

import React from 'react';

import { IS_DEVELOPMENT, isDefined } from '../helpers/common';
import { useRoute } from '../router/hooks';

import { R_PRESENTATION, R_RACE, R_RACES, R_ROOT, R_SETTINGS, R_TEAMS } from '../routes';

import { App } from '../components/layout';

import MissingRoutePage from '../views/MissingRoutePage';
import NotFoundPage from '../views/NotFoundPage';

import HomePage from '../views/HomePage';
import TeamsPage from '../views/TeamsPage';
import RacesPage from '../views/RacesPage';
import RacePage from '../views/RacePage';
import PresentationPage from '../views/PresentationPage';
import SettingsPage from '../views/SettingsPage';


const routeToViewMap = new Map([
	[R_ROOT, () => <HomePage />],
	[R_TEAMS, () => <TeamsPage />],
	[R_RACES, () => <RacesPage />],
	[R_RACE, () => <RacePage />],
	[R_PRESENTATION, () => <PresentationPage />],
	[R_SETTINGS, () => <SettingsPage />],
]);

const TopLevelRouter = () => {

	const { route } = useRoute();

	console.log(`[TopLevelRouter] route changed`, route);

	// 404: no route matched
	if (!isDefined(route)) {
		return <NotFoundPage />;
	}

	const { name, payload } = route;

	const getViewComponent = routeToViewMap.get(name);

	// route was matched, but an appropriate view is missing
	if (!isDefined(getViewComponent)) {

		if (IS_DEVELOPMENT) {
			return (
				<App>
					<MissingRoutePage route={route} />
				</App>
			);
		}

		return (
			<App>
				<NotFoundPage />
			</App>
		);

	}

	// special layout (no app at all)
	if (name === R_PRESENTATION) {
		return getViewComponent();
	}

	return (
		<App
			withFooter={name !== R_RACE}
			routeName={name}
		>
			{getViewComponent()}
		</App>
	);

};

export default TopLevelRouter;