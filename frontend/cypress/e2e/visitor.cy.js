describe('Visitor Smoke Test', () => {
  beforeEach(() => {
    cy.login()
  })

  it('loads visitor page', () => {
    cy.visit('/resident/visitors') // Adjust path if different
    cy.checkNoConsoleErrors()
    cy.url().should('include', '/visitor')
    cy.contains(/visitor|guest/i).should('exist')
  })
})
