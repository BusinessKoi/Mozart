import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.request' // Wait, importing App
import './index.css'

import AppRoot from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppRoot />
    </React.StrictMode>,
)
