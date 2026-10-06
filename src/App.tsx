import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { useSyncSettings } from './app/useSyncSettings'

function App() {
  useSyncSettings()
  return <RouterProvider router={router} />
}

export default App
