import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { DAppProvider } from '@usedapp/core';
//redux store
import { Provider } from 'react-redux'
import store from './store';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

ReactDOM.render(
  <DAppProvider>
    <BrowserRouter basename={baseUrl}>
      <App />
    </BrowserRouter>
  </DAppProvider>
  , rootElement);

registerServiceWorker();

