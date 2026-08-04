// Import commands.js using ES2015 syntax:
import './commands'

// Unregister service workers during Cypress E2E test runs to prevent page load hangs
beforeEach(() => {
  if (window.navigator && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister()
      }
    })
  }
})
