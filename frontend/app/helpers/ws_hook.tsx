"use strict";

import React, { useState, useMemo, useCallback, useEffect, useRef, useContext } from 'react';

import StoreContext from '../store/StoreContext';
import Store from '../store/Store';



const ConfigContext = React.createContext<string>('ws://localhost:4000');

//This registers component to websocket communication
//received message in subscribed channel will cause rerender of the component with updated messages object
export const useWebSocket = (id = -1) => {	//mySubscription

	//way to store socket without rerender
	const clientRef = useRef<WebSocket | undefined>(undefined);

	//immutable array of messages, setMessages will rerender component
	const [messages, setMessages] = useState("");

	//creates function addMessage on init
	//addMessage updates messages list
	//used only when new message arrives
	const addMessage = useCallback(
		(message: string) => setMessages(prev => message),
		[setMessages],
	);

	//const config = useContext(ConfigContext);

	//called only on init, registers callbacks
	useEffect(() => {

		console.log('subscribing ...');

		const client = new WebSocket('ws://localhost:4000');

		client.onopen = (event) => {
			console.log('ws: open', event);
		};

		client.onclose = (event) => {
			console.log('ws: close', event);
		};

		client.onmessage = (event) => {
			console.log('ws: message', event.data);
			console.log('RACE ID', id);
			try{
				const dataFromServer = JSON.parse(event.data);
				if (id === -1 || id === dataFromServer?.trial?.id) {	// dataFromServer.type === mySubscription
					addMessage(dataFromServer);
				}
			}catch (error){
				console.log(error);
			}

		};

		client.onerror = (event) => {
			console.error('ws: error', event);
		};

		clientRef.current = client;

		return () => {

			console.log('unsubscribing (closing client)...');

			// 1000 means "The connection successfully completed the purpose for which it was created."
			client.close(1000);
			clientRef.current = undefined;

		};

	}, [addMessage]);

	//returns immutable messages object and set functions
	return messages;

};
