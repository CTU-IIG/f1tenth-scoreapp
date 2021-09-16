"use strict";

import React from 'react';
import { Link } from '../router/compoments';
import { R_ROOT, R_SETTINGS, R_TRIAL, R_TRIAL_NEW, R_TRIALS } from '../routes';
import { useFormatMessageId } from '../helpers/hooks';


export type BreadcrumbsProps =
	| { name: typeof R_ROOT }
	| { name: typeof R_SETTINGS }
	| { name: typeof R_TRIALS; }
	| { name: typeof R_TRIAL_NEW; }
	| { name: typeof R_TRIAL; trialId: number; trialName: string; }

export type BreadcrumbsLink = {
	name: string;
	payload?: any;
	label: string;
}

export const breadcrumbsPropsToLinks = (t: ReturnType<typeof useFormatMessageId>, props: BreadcrumbsProps): BreadcrumbsLink[] => {

	const links: BreadcrumbsLink[] = [
		{
			name: R_ROOT,
			label: t(`titles.home`),
		},
	];

	if (props.name === R_ROOT) {
		return links;
	}

	if (props.name === R_SETTINGS) {
		links.push({
			name: R_SETTINGS,
			label: t(`titles.settings`),
		});
		return links;
	}

	if (props.name === R_TRIALS || props.name === R_TRIAL_NEW || props.name === R_TRIAL) {

		links.push({
			name: R_TRIALS,
			label: t(`titles.trials`),
		});

		if (props.name === R_TRIALS) {
			return links;
		}

		if (props.name === R_TRIAL_NEW) {
			links.push({
				name: R_TRIAL_NEW,
				label: t(`titles.newTrial`),
			});
			return links;
		}

		if (props.name === R_TRIAL) {
			links.push({
				name: R_TRIAL,
				payload: {
					trialId: props.trialId,
				},
				label: props.trialName,
			});
			return links;
		}

		return links;

	}

	return links;

};

export const Breadcrumbs = React.memo((props: BreadcrumbsProps) => {

	const t = useFormatMessageId();

	const links = breadcrumbsPropsToLinks(t, props);

	return (
		<nav className="breadcrumbs">
			<ol>
				{links.map(({ name, payload, label }) => (
					<li key={name}><Link name={name} payload={payload}>{label}</Link></li>
				))}
			</ol>
		</nav>
	);

});
