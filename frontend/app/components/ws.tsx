"use strict";

import React, { useCallback } from 'react';
import { useWebSocketManagerState } from '../ws/hooks';
import { useFormatMessageId } from '../helpers/hooks';
import {
	MANAGER_STATE_CONNECTED,
	MANAGER_STATE_CONNECTING,
	MANAGER_STATE_DISCONNECTED_MAX_RETRIES_REACHED,
	MANAGER_STATE_NO_URL,
	MANAGER_STATE_NOT_CONNECTED,
	ManagerState,
} from '../ws/WebSocketManager';
import { Button } from './common';
import { CopyableCode } from './content';
import { Link } from '../router/compoments';
import { R_SETTINGS } from '../routes';


export interface WebSocketInfoProps {

}

const stateNameMap: Map<ManagerState['name'], [string, string]> = new Map([
	[MANAGER_STATE_NO_URL, ['urlNotSet', 'default']],
	[MANAGER_STATE_NOT_CONNECTED, ['notConnected', 'danger']],
	[MANAGER_STATE_CONNECTING, ['connecting', 'warning']],
	[MANAGER_STATE_CONNECTED, ['connected', 'success']],
	[MANAGER_STATE_DISCONNECTED_MAX_RETRIES_REACHED, ['disconnectedMaxRetriesReached', 'danger']],
]);

export const WebSocketInfo = (props: WebSocketInfoProps) => {

	const t = useFormatMessageId();

	const { state, manager } = useWebSocketManagerState();

	const [translationId, style] = stateNameMap.get(state.name) ?? ['unknown', 'default'];

	const handleDisconnectClick = useCallback((event) => {
		event.preventDefault();
		manager.disconnect();
	}, [manager]);

	const handleReconnectClick = useCallback((event) => {
		event.preventDefault();
		manager.connect(manager.url);
	}, [manager]);

	return (
		<div className={`ws-info ws-info--${style}`} tabIndex={0}>
			<div className="ws-info-dot" />
			<div className="ws-info-details">
				<div className="ws-info-heading">{t(`webSocketInfo.heading`)}</div>
				<div className="ws-info-state">{t(`webSocketInfo.state.${translationId}`)}</div>
				{state.name !== MANAGER_STATE_NO_URL && (
					<>

						<strong>{t(`webSocketInfo.attempt`)}:</strong>
						{' '}{state.attempt}

						<br /><strong>{t(`webSocketInfo.url`)}:</strong>
						{' '}<CopyableCode>{state.url}</CopyableCode>
						<br /><Link name={R_SETTINGS}>{t(`webSocketInfo.changeUrlInSettings`)}</Link>

					</>
				)}
				<div className="btn-group">
					<Button
						className="btn-sm"
						label="webSocketInfo.reconnect"
						style="primary"
						onClick={handleReconnectClick}
					/>
					{state.name === MANAGER_STATE_CONNECTING || state.name === MANAGER_STATE_CONNECTED && (
						<Button
							className="btn-sm"
							label="webSocketInfo.disconnect"
							style="danger"
							onClick={handleDisconnectClick}
						/>
					)}
				</div>
			</div>
		</div>
	);

};
