import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'

const container = document.getElementById('root')

if (!container) {
  console.error('Root container missing')
} else {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
