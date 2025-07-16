import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import "@fontsource/poppins";
import "@fontsource/poppins/700.css";
import ContextProvider from './context/Context.jsx';
createRoot(document.getElementById('root')).render(

    <ContextProvider>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </ContextProvider>
  
)
