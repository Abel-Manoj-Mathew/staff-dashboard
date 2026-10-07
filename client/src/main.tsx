import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { PreAuthBatchPage } from './pages/PreAuthBatchPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreAuthBatchPage />
  </StrictMode>,
)
