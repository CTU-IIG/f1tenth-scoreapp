"use strict";

import React from 'react';
import { Link } from '../router/compoments';
import { R_RACE, R_RACE_NEW, R_RACES, R_ROOT, R_SETTINGS, R_TEAM, R_TEAM_NEW, R_TEAMS } from '../routes';
import { useFormatMessageId } from '../helpers/hooks';


export type BreadcrumbsProps =
	| { name: typeof R_ROOT }
	| { name: typeof R_SETTINGS }
	| { name: typeof R_TEAMS; }
	| { name: typeof R_TEAM_NEW; }
	| { name: typeof R_TEAM; teamId: number; }
	| { name: typeof R_RACES; }
	| { name: typeof R_RACE_NEW; }
	| { name: typeof R_RACE; raceId: number; }

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

	if (props.name === R_TEAMS || props.name === R_TEAM_NEW || props.name === R_TEAM) {

		links.push({
			name: R_TEAMS,
			label: t(`titles.teams`),
		});

		if (props.name === R_TEAMS) {
			return links;
		}

		if (props.name === R_TEAM_NEW) {
			links.push({
				name: R_TEAM_NEW,
				label: t(`titles.newTeam`),
			});
			return links;
		}

		if (props.name === R_TEAM) {
			links.push({
				name: R_TEAM,
				payload: {
					teamId: props.teamId,
				},
				label: props.teamId.toString(),
			});
			return links;
		}

		return links;

	}

	if (props.name === R_RACES || props.name === R_RACE_NEW || props.name === R_RACE) {

		links.push({
			name: R_RACES,
			label: t(`titles.races`),
		});

		if (props.name === R_RACES) {
			return links;
		}

		if (props.name === R_RACE_NEW) {
			links.push({
				name: R_RACE_NEW,
				label: t(`titles.newRace`),
			});
			return links;
		}

		if (props.name === R_RACE) {
			links.push({
				name: R_RACE,
				payload: {
					raceId: props.raceId,
				},
				label: props.raceId.toString(),
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
