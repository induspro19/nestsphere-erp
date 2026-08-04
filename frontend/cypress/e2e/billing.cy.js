describe('Resident Billing Module Smoke Test', () => {
  beforeEach(() => {
    cy.login('resident@nestsphere.local', 'password123')
  })

  it('loads billing page and verifies data with stable selectors', () => {
    // Navigate via Sidebar Link
    cy.visit('/resident/dashboard')
    cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible')
    
    // Find the My Bills link in the sidebar and click it
    cy.contains('a', 'My Bills').click()
    
    // Verify no 404 and URL is correct
    cy.url().should('include', '/resident/bills')
    cy.contains('Page Not Found').should('not.exist')
    
    // Wait for loader to disappear
    cy.get('.lucide-loader2').should('not.exist')
    
    // Check for console errors
    cy.checkNoConsoleErrors()
    
    // Verify stable identifiers
    cy.get('[data-testid="billing-page"]').should('be.visible')
    
    cy.get('[data-testid="billing-summary"]').should('be.visible')
    cy.get('[data-testid="outstanding-balance"]').should('contain.text', '₹')
    
    cy.get('[data-testid="invoice-table"]').should('be.visible')
    cy.get('[data-testid="pay-now"]').should('be.visible')
    
    cy.get('[data-testid="payment-history"]').should('be.visible')
    cy.get('[data-testid="recent-payments"]').should('be.visible')
    
    cy.get('[data-testid="download-invoice"]').should('be.visible')
    
    cy.takeEvidence('Billing_Module_Success')
  })
})
