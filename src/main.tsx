import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'arlinkauth/react'
import { PostHogProvider } from 'posthog-js/react'
import './index.css'
import App from './App.tsx'

const ARLINK_API_URL = 'https://arlinkauth.contact-arlink.workers.dev';

const posthogOptions = {
  api_host: 'https://us.i.posthog.com',
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider
      apiKey="phc_lOR55coEqNOYv9oz5SYMiCqPQ4kHewWmTJErK0zHsyT"
      options={posthogOptions}
    >
      <AuthProvider apiUrl={ARLINK_API_URL}>
        <App />
      </AuthProvider>
    </PostHogProvider>
  </StrictMode>,
)
