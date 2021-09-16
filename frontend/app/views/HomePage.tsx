"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { Link } from '../router/compoments';
import { R_PRESENTATION, R_TRIALS } from '../routes';


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
				<li><Link name={R_TRIALS}>{t`titles.trials`}</Link></li>
				<li><Link name={R_PRESENTATION}>{t`titles.presentation`}</Link></li>
			</ul>

		</>
	);

};

export default HomePage;
