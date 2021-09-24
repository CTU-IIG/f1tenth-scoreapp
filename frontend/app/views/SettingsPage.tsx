"use strict";

import React, { useCallback, useMemo } from 'react';

import {
	createFormatMessageId,
	createGetRawIntlMessage,
	fnToTemplateTag,
	useDocumentTitle,
	useStoreValueAuthToken,
	useStoreValueLocale,
	useStoreValueRestUrl,
	useStoreValueSoundEffects,
	useStoreValueWebSocketUrl,
} from '../helpers/hooks';
import { Input, Option, SelectInput, ToggleInput } from '../components/inputs';
import { isDefined } from '../helpers/common';
import { useIntl } from 'react-intl';
import { Form } from '../forms-experimental/compoments';
import { FormInput } from '../forms-experimental/inputs';
import { CopyableCode } from '../components/content';
import { OnSubmitHandler } from '../forms-experimental/common';
import { Button } from '../components/common';


const LOCALE_OPTIONS: Option[] = [
	{
		value: 'auto',
		label: 'locales.auto',
	},
	{
		value: 'en',
		label: 'locales.en',
	},
	// cs temp disable until we finish the app features
	// {
	// 	value: 'cs',
	// 	label: 'locales.cs',
	// },
];

interface ServerUrlsFormShape {
	restUrl: string;
	webSocketUrl: string;
}

/**
 * Normalizes the given URL so that is does NOT have a trailing slash.
 * E.g.: 'http://localhost:4110/' -> 'http://localhost:4110'
 * @param url URL to normalize
 */
const normalizeRestUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;

const SettingsPage = () => {

	const intl = useIntl();
	const getRawIntlMessage = createGetRawIntlMessage(intl);
	const t = fnToTemplateTag(createFormatMessageId(intl));

	useDocumentTitle(t`titles.settings`);

	const [locale, setLocale] = useStoreValueLocale();
	const [restUrl, setRestUrl] = useStoreValueRestUrl();
	const [webSocketUrl, setWebSocketUrl] = useStoreValueWebSocketUrl();
	const [authToken, setAuthToken] = useStoreValueAuthToken();
	const [soundEffects, setSoundEffects] = useStoreValueSoundEffects();

	if (!isDefined(locale)) {
		throw new Error(`[LocaleLoader] locale undefined`);
	}

	const handleLocaleChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>((event) => {
		setLocale(event.target.value);
	}, [setLocale]);

	const handleSoundEffectsChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
		setSoundEffects(event.target.checked);
	}, [setSoundEffects]);

	const handleAuthTokenChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
		if (event.target.value === '') {
			setAuthToken(undefined);
		} else {
			setAuthToken(event.target.value);
		}
	}, [setAuthToken]);

	const handleChangeServerUrls = useCallback<OnSubmitHandler<ServerUrlsFormShape>>((data) => {
		setRestUrl(normalizeRestUrl(data.restUrl));
		setWebSocketUrl(data.webSocketUrl);
	}, [setRestUrl, setWebSocketUrl]);

	const handleClickUseLocalUrlsPreset = useCallback((event) => {
		event.preventDefault();
		setRestUrl('http://localhost:4110');
		setWebSocketUrl('ws://localhost:4110/ws');
	}, [setRestUrl, setWebSocketUrl]);

	const handleClickUseProductionUrlsPreset = useCallback((event) => {
		event.preventDefault();
		setRestUrl('https://f1tenth-scoreapp.iid.ciirc.cvut.cz');
		setWebSocketUrl('wss://f1tenth-scoreapp.iid.ciirc.cvut.cz/ws');
	}, [setRestUrl, setWebSocketUrl]);

	const serverUrlsFormInitialValues = useMemo<ServerUrlsFormShape>(() => ({
		restUrl,
		webSocketUrl,
	}), [restUrl, webSocketUrl]);

	console.log('authToken = ', authToken);

	return (
		<>

			<h1>{t`titles.settings`}</h1>

			<SelectInput
				id="settings-form--locale"
				name="locale"
				options={LOCALE_OPTIONS}
				label="settingsForm.labels.locale"
				value={locale}
				onChange={handleLocaleChange}
				helpBlock={
					<p className="help-block">
						{t`settingsForm.labels.effectiveLocale`}: {getRawIntlMessage(`locales.${intl.locale}`)}
					</p>
				}
			/>

			<ToggleInput
				id="settings-form--sounds"
				name="sounds"
				label="settingsForm.labels.soundEffects"
				checked={soundEffects}
				onChange={handleSoundEffectsChange}
			/>

			<Input
				id="settings-form--authToken"
				name="authToken"
				label="settingsForm.labels.authToken"
				value={authToken ?? ''}
				onChange={handleAuthTokenChange}
				helpBlock={<p className="help-block">{t`settingsForm.authTokenNote`}</p>}
			/>

			<h2>{t`settingsPage.serverUrlsHeading`}</h2>

			<div className="btn-group">
				<Button
					label="settingsPage.useLocalUrlsPreset"
					onClick={handleClickUseLocalUrlsPreset}
				/>
				<Button
					label="settingsPage.useProductionUrlsPreset"
					onClick={handleClickUseProductionUrlsPreset}
				/>
			</div>

			<Form<ServerUrlsFormShape>
				name="serverUrls"
				initialValues={serverUrlsFormInitialValues}
				onSubmit={handleChangeServerUrls}
			>

				<FormInput
					type="url"
					required={true}
					name="restUrl"
					label="settingsForm.labels.restUrl"
					helpBlock={
						<p className="help-block">
							{t`settingsForm.labels.effectiveRestUrl`}{': '}
							<CopyableCode>{restUrl}</CopyableCode>
						</p>
					}
				/>

				<FormInput
					type="url"
					required={true}
					name="webSocketUrl"
					label="settingsForm.labels.webSocketUrl"
					helpBlock={
						<p className="help-block">
							{t`settingsForm.labels.effectiveWebSocketUrl`}{': '}
							<CopyableCode>{webSocketUrl}</CopyableCode>
						</p>
					}
				/>

				<div className="btn-group">
					<button className="btn btn-danger" type="submit">
						{t`settingsForm.saveServerUrls`}
					</button>
					<button className="btn btn-default" type="reset">
						{t`forms.reset`}
					</button>
				</div>

			</Form>

		</>
	);

};

export default SettingsPage;
