import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Submit from './Submit'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Submit />
  </StrictMode>,
)
