import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
// import App from './App';  // Comment out for demo
import AppDeploy from './AppDeploy';  // Use deployment demo app
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppDeploy />
  </React.StrictMode>
);
reportWebVitals();