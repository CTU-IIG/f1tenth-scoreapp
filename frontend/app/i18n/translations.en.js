"use strict";

export default {
	locales: {
		auto: `automatically (according to the browser language)`,
		en: `English`,
		cs: 'Czech',
	},
	titles: {
		home: `Home page`,
		loading: `Loading ...`,
		login: `Login`,
		notFound: `Page not found`,
		settings: `Settings`,
		trials: 'Trials',
		presentation: 'Presentation',
	},
	header: {
		appName: `F1Tenth ScoreApp`,
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
			serverUrl: `Server URL`,
		},
		switchToBtn: `Switch to {url}`,
	},
	homePage: {
		callout: {
			welcome: `Welcome to F1Tenth ScoreApp!`,
		},
		trialsHeading: `Trials overview`,
	},
	trialPage: {
		categoriesHeading: `Kategorie`,
	},
	practicePage: {
		tipsHeading: `Control and tips`,
		tips: `
			<li>It is possible to end the practice at any time.</li>
			<li>The results are automatically continuously counted towards the total score.</li>
			<li>After answering each question, you will immediately see the result and the correct solution.</li>
			<li>You can also use the keyboard
				– <kbd>Enter</kbd> to check the answer and move on to the next question
				– numbers/letters to select choices.
			</li>
			<li>Sound effects can be enabled/disabled in the <settings>Settings</settings>.</li>
		`,
		finishedHeading: `Practice completed`,
		finished: `All selected questions were practiced.`,
		backToPackage: `Return to the package detail`,
	},
	loginPage: {
		errors: {
			invalid_credentials: `Invalid login credentials.`,
			unknown: `An unknown error occurred while logging in: {message}`,
		},
		title: `Login`,
	},
	settingsPage: {
		dataManagementHeading: `Data management`,
		deleteScores: `Reset all scores`,
		deleteScoresConfirmation: `Are you sure you want to reset all scores?`,
		deleteAllLocalData: `Delete all downloaded packages and reset all scores`,
		deleteAllLocalDataConfirmation:
			`Are you sure you want to delete all downloaded packages for offline use? This will also reset all scores.`,
	},
	notFoundPage: {
		backToHomePageBtn: `Return to the home page`,
		message: `There is no page on this address.`,
	},
};
