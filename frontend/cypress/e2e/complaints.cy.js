describe('Complaints Smoke Test', () => {
  beforeEach(() => {
    cy.login()
  })

  it('loads complaints page', () => {
    cy.visit('/resident/complaints')
    cy.checkNoConsoleErrors()
    cy.url().should('include', '/complaints')
    cy.contains(/complaint|ticket/i).should('exist')
  })
})
