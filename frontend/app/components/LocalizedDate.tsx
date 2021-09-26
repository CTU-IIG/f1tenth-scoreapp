"use strict";

import React from 'react';

import { FormatDateOptions, useIntl } from 'react-intl';


export interface LocalizedDateProps extends FormatDateOptions {
	value: Date | number;
}

const LocalizedDate = (
	{
		value: rawDate,
		weekday = 'short', year = 'numeric', month = 'numeric', day = 'numeric',
		hour = 'numeric', minute = 'numeric', second = 'numeric',
		hour12,
		timeZone, // = 'Europe/Prague',
		timeZoneName,
		fractionalSecondDigits,
		...otherProps // such as className
	}: LocalizedDateProps, // TODO
) => {

	const intl = useIntl();

	const date = rawDate instanceof Date ? rawDate : new Date(rawDate);

	return (
		<time dateTime={date.toISOString()} {...otherProps}>
			{intl.formatDate(date, {
				weekday, year, month, day,
				hour, minute, second,
				hour12,
				timeZone,
				timeZoneName,
				// TODO: There is a bug in @formatjs/intl
				//   fractionalSecondDigits is missing in dateTime.ts DATE_TIME_FORMAT_OPTIONS
				//   see https://github.com/formatjs/formatjs/blob/main/packages/intl/src/dateTime.ts#L7
				fractionalSecondDigits,
			})}
		</time>
	);

};

export default LocalizedDate;
