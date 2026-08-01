describe('Meeting Smoke Test', () => {
  beforeEach(() => {
    cy.login()
  })

  it('loads meeting page', () => {
    cy.visit('/resident/meetings') // Adjust path if different
    cy.checkNoConsoleErrors()
    cy.url().should('include', '/meeting')
    cy.contains(/meeting|events/i).should('exist')
  })
})
