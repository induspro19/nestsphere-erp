describe('Login Smoke Test', () => {
  it('loads login page and verifies elements', () => {
    cy.visit('/login')
    cy.contains('Society ERP Portal').should('be.visible')
    cy.get('input[placeholder="admin@society.com"]').should('exist')
    cy.get('input[placeholder="••••••••"]').should('exist')
    cy.contains('button', 'Sign In to Dashboard').should('be.visible')
  })
})
