import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './theme/base.css'
import './theme/modern.css'
import './theme/ancient.css'
import './theme/fantasy.css'
import './theme/campus.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
