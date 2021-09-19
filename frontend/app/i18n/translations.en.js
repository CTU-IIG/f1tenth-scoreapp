"use strict";

export default {
	locales: {
		auto: `automatically (according to the browser language)`,
		en: `English`,
		cs: 'Czech',
	},
	titles: {
		home: `Home`,
		loading: `Loading ...`,
		login: `Login`,
		notFound: `Page not found`,
		settings: `Settings`,
		teams: 'Teams',
		trials: 'Trials',
		presentation: 'Presentation',
	},
	header: {
		appName: `ScoreApp`,
	},
	footer: {
		sourceCode: `Source code on`,
	},
	trial: {
		actions: {
			detail: 'Trial detail',
		},
	},
	ui: {
		add: `Add`,
		pageHeader: {
			toggle: `Open/Close menu`,
		},
		loading: 'Loading ...',
		loadingError: 'An error occurred while loading data.',
	},
	forms: {
		selectAll: `Select all`,
		selectNone: `Select none`,
		cancel: `Cancel`,
		errors: {
			fieldRequired: `Please fill this field.`,
		},
		prompt: `-- Please select --`,
		send: `Submit`,
		reset: `Reset`,
	},
	loginForm: {
		labels: {
			email: `E-mail`,
			password: `Password`,
		},
		loading: `Logging in...`,
		login: `Login`,
	},
	settingsForm: {
		labels: {
			effectiveLocale: `Currently used language`,
			locale: `Language`,
			soundEffects: `Sound effects`,
			restUrl: `REST API URL`,
			effectiveRestUrl: `Currently used`,
			webSocketUrl: `WebSocket API URL`,
			effectiveWebSocketUrl: `Currently used`,
		},
		saveServerUrls: `Save URLs changes`,
	},
	homePage: {
		callout: {
			welcome: `Welcome to F1Tenth ScoreApp!`,
		},
	},
	trialsPage: {},
	trialPage: {
		notFoundHeading: `Trial not found`,
		notFoundMessage: `The trial with ID {id} was not found.`,
		backToTrials: `Back to all trials`,
	},
	teamsPage: {
		columns: {
			id: 'ID',
			name: 'Name',
		},
	},
	teamPage: {
		notFoundHeading: `Team not found`,
		notFoundMessage: `The team with ID {id} was not found.`,
		backToTrials: `Back to all teams`,
	},
	settingsPage: {
		serverUrlsHeading: 'Server URLs',
	},
	notFoundPage: {
		backToHomePageBtn: `Return to the home page`,
		message: `There is no page on this address.`,
	},
	loginPage: {
		errors: {
			invalid_credentials: `Invalid login credentials.`,
			unknown: `An unknown error occurred while logging in: {message}`,
		},
		title: `Login`,
	},
};
