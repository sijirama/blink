import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css';
import Provider from "@/providers/index.tsx"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider>
            <App />
        </Provider>
    </StrictMode>,
)
