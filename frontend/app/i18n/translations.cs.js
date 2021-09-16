"use strict";

export default {
	locales: {
		auto: `automaticky dle jazyka prohlížeče`,
		en: `angličtina`,
		cs: 'čeština',
	},
	titles: {
		home: `Úvodní stránka`,
		loading: `Načítání ...`,
		login: `Přihlášení`,
		notFound: `Stránka nenalezena`,
		settings: `Nastavení`,
		trials: 'Závody',
		presentation: 'Prezentace',
	},
	header: {
		appName: `F1Tenth ScoreApp`,
	},
	footer: {
		sourceCode: `Zdrojový kód na`,
	},
	trial: {
		actions: {
			detail: 'Detail závodu',
		},
	},
	ui: {
		add: `Přidat`,
		pageHeader: {
			toggle: `Otevřít/Zavřít menu`,
		},
		loading: 'Načítání ...',
		loadingError: 'Došlo k chybě při načítání dat.',
	},
	forms: {
		selectAll: `Vybrat vše`,
		selectNone: `Zrušit výběr`,
		cancel: `Zrušit`,
		errors: {
			fieldRequired: `Vyplňte toto pole.`,
		},
		prompt: `-- Prosím vyberte --`,
		send: `Odeslat`,
	},
	loginForm: {
		labels: {
			email: `E-mail`,
			password: `Heslo`,
		},
		loading: `Přihlašování...`,
		login: `Přihlásit se`,
	},
	settingsForm: {
		labels: {
			effectiveLocale: `Aktuálně použitý jazyk`,
			locale: `Jazyk`,
			soundEffects: `Zvukové efekty`,
			serverUrl: `URL serveru`,
		},
		switchToBtn: `Přepnout na {url}`,
	},
	homePage: {
		callout: {
			welcome: `Vítejte v aplikaci F1Tenth ScoreApp!`,
		},
		trialsHeading: `Přehled závodů`,
	},
	trialsPage: {
		categoriesHeading: `Kategorie`,
	},
	trialPage: {
		categoriesHeading: `Kategorie`,
	},
	loginPage: {
		errors: {
			invalid_credentials: `Neplatné přihlašovací údaje.`,
			unknown: `Při přihlašování došlo k nézmámé chybě: {message}`,
		},
		title: `Přihlášení`,
	},
	settingsPage: {
		dataManagementHeading: `Správa dat`,
		deleteScores: `Vynulovat všechna skóré`,
		deleteScoresConfirmation: `Opravdu si přejete vynulovat všechna skóré?`,
		deleteAllLocalData: `Smazat všechny stažené balíčky a všechna skóré`,
		deleteAllLocalDataConfirmation:
			`Opravdu si přejete smazat všechny stažené balíčky pro offline použití? Tím se také vymažou všechna skóré.`,
	},
	notFoundPage: {
		backToHomePageBtn: `Zpět na úvodní stránku`,
		message: `Této adrese neodpovídá žádná stránka.`,
	},
};
