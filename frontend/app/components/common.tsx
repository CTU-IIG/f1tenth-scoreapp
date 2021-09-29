"use strict";

import React, { useCallback, useState } from 'react';
import { useFormatMessageId } from '../helpers/hooks';
import { isDefined } from '../helpers/common';
import classNames from 'classnames';


export interface ButtonProps
	extends Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'style'> {
	style?: string;
	label?: string;
	className?: any;
}

export const Button = ({ type, style, label, children, className, ...otherProps }: ButtonProps) => {

	const t = useFormatMessageId();

	return (
		<button
			type={type ?? 'button'}
			className={classNames('btn', className, {
				...isDefined(style) && { [`btn-${style}`]: true },
			})}
			{...otherProps}
		>
			{isDefined(label) ? t(label) : children}
		</button>
	);

};

export interface ConfirmButtonProps extends ButtonProps {
	num?: number;
}

export const ConfirmButton = ({ onClick, num = 3, label, children, ...otherProps }: ConfirmButtonProps) => {

	const t = useFormatMessageId();

	const [numClicks, setNumClicks] = useState(0);

	const increaseNumClicks = useCallback((event) => {
		event.preventDefault();
		if ((numClicks + 1) >= num) {
			if (isDefined(onClick)) {
				onClick(event);
				return;
			}
		} else {
			setNumClicks(prevValue => prevValue + 1);
		}
	}, [numClicks, num, onClick, setNumClicks]);

	const resetNumClicks = useCallback((event) => {
		event.preventDefault();
		setNumClicks(prevValue => 0);
	}, [setNumClicks]);

	if (numClicks === 0) {
		return (
			<Button
				{...otherProps}
				label={label}
				onClick={increaseNumClicks}
			>
				{children}
			</Button>
		);
	}

	return (
		<div className="confirm-btn">
			<Button
				{...otherProps}
				label="ui.cancel"
				style="success"
				onClick={resetNumClicks}
			/>
			{isDefined(label) ? t(label) : children}
			<Button
				{...otherProps}
				style="danger"
				onClick={increaseNumClicks}
			>
				{t('ui.confirmByNumClicks', {
					num: num - numClicks,
				})}
			</Button>
		</div>
	);

};
