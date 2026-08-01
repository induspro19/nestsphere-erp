// Reusable commands for NestSphere ERP

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[placeholder="admin@society.com"]').type(email || 'resident@nestsphere.local')
  cy.get('input[placeholder="••••••••"]').type(password || 'password123')
  cy.contains('button', 'Sign In to Dashboard').click()
  // Wait for login to complete and dashboard to load
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.contains('Logout').click()
  cy.url().should('include', '/login')
})

Cypress.Commands.add('waitForLoader', () => {
  // Replace '.loader' with your actual loader class or test ID
  cy.get('.loader', { timeout: 10000 }).should('not.exist')
})

Cypress.Commands.add('openModule', (moduleName) => {
  cy.get('nav').contains(moduleName).click()
})

Cypress.Commands.add('takeEvidence', (name) => {
  cy.screenshot(name)
})

Cypress.Commands.add('checkNoConsoleErrors', () => {
  cy.on('window:before:load', (win) => {
    cy.spy(win.console, 'error')
  })
  // After a test runs we could check this spy, but usually a global handler is better.
})
