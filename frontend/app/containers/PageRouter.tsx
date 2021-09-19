"use strict";

import React from 'react';

import { IS_DEVELOPMENT, isDefined } from '../helpers/common';
import { useRoute } from '../router/hooks';

import { R_PRESENTATION, R_ROOT, R_SETTINGS, R_TEAMS, R_TRIAL, R_TRIALS } from '../routes';

import NotFoundPage from '../views/NotFoundPage';
import SettingsPage from '../views/SettingsPage';
import HomePage from '../views/HomePage';
import MissingRoutePage from '../views/MissingRoutePage';

import TrialsPage from '../views/TrialsPage';
import TrialPage from '../views/TrialPage';

import PresentationPage from '../views/PresentationPage';
import TeamsPage from '../views/TeamsPage';


const PageRouter = () => {

	const { route } = useRoute();

	console.log(`[PageRouter] route changed`, route);

	// 404: no route matched
	if (!isDefined(route)) {
		return <NotFoundPage />;
	}

	const { name, payload } = route;

	// settings can be accessed no matter the auth state
	if (name === R_SETTINGS) {
		return <SettingsPage />;
	}

	if (name === R_TEAMS) {
		return <TeamsPage />;
	}

	if (name === R_TRIAL) {
		return <TrialPage />;
	}

	if (name === R_TRIALS) {
		return <TrialsPage />;
	}

	if (name === R_PRESENTATION) {
		return <PresentationPage />;
	}

	if (name === R_ROOT) {
		return <HomePage />;
	}

	// route was matched, but an appropriate page is missing
	if (IS_DEVELOPMENT) {
		return <MissingRoutePage route={route} />;
	}
	return <NotFoundPage />;

};

export default PageRouter;
