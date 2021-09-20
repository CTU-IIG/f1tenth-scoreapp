"use strict";

import React from 'react';

import WebSocketManager from './WebSocketManager';


// @ts-ignore
const WebSocketManagerContext = React.createContext<WebSocketManager<StoreData>>(undefined);

WebSocketManagerContext.displayName = 'StoreContext';

export default WebSocketManagerContext;
