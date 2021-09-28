"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { Link } from '../router/compoments';
import { R_PRESENTATION, R_RACES, R_STREAM, R_TEAMS } from '../routes';


const HomePage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.home`);

	return (
		<>

			<aside className="callout">
				<p>
					{t`homePage.callout.welcome`}
				</p>
			</aside>

			<ul>
				<li><Link name={R_TEAMS}>{t`titles.teams`}</Link></li>
				<li><Link name={R_RACES}>{t`titles.races`}</Link></li>
				<li><Link name={R_PRESENTATION}>{t`titles.presentation`}</Link></li>
				<li><Link name={R_STREAM}>{t`titles.stream`}</Link></li>

			</ul>

		</>
	);

};

export default HomePage;
