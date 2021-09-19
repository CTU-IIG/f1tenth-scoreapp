"use strict";

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { isDefined } from '../helpers/common';


export const TimeDisplay = ({ name, time, className }) => (
	<div className={classNames('timer', className)}>
		<span className="timerName">
			{name}
		</span>
		<span className="digits">
        	{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:
      	</span>
		<span className="digits">
        	{("0" + Math.floor((time / 1000) % 60)).slice(-2)}.
      	</span>
		<span className="digits">
        	{("0" + Math.floor((time / 10) % 100)).slice(-2)}
      	</span>
	</div>
);

export const Timer = ({ name, start, active, className }) => {

	const [currentTime, setCurrentTime] = useState(() => Date.now());

	// TODO: more efficient solution (perhaps update the HTML DOM directly?)
	useEffect(() => {

		let interval: number | undefined;

		if (active) {
			interval = window.setInterval(() => {
				setCurrentTime(Date.now());
			}, 100);
		}

		return () => {

			if (isDefined(interval)) {
				window.clearInterval(interval);
			}

		};

	}, [active, setCurrentTime]);

	return (
		<TimeDisplay className={className} name={name} time={currentTime - start} />
	);
};

export const Timers = props => (
	<div className="timers">
		<Timer className="total" name="Total time: " start={props.raceStartTime} active={props.active} />
		<Timer className="this" name="Lap time: " start={props.lapStartTime} active={props.active} />
		<TimeDisplay className="best" name="Best lap: " time={props.bestLapTime} />
	</div>
);



