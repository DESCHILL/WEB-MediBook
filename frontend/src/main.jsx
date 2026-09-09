import { StrictMode as Strict_mode } from 'react';
import { createRoot as create_root } from 'react-dom/client';
import App from './app.jsx';
import './styles.css';

create_root(document.getElementById('root')).render(
    <Strict_mode><App /></Strict_mode>,
);
