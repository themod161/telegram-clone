import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Providers from './stores/Providers';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <Providers>
      <App />
    </Providers>  
);