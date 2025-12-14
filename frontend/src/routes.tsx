import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import SmartPlanning from './pages/SmartPlanning'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/smart-planning',
    element: <SmartPlanning />,
  },
])