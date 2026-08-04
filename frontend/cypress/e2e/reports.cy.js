describe('Resident Reports Module Smoke Test', () => {
  beforeEach(() => {
    cy.login('resident@nestsphere.local', 'password123')
  })

  it('navigates to Reports and verifies all features exist', () => {
    // Navigate via Sidebar Link
    cy.visit('/resident/dashboard')
    // Let dashboard load
    cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible')
    
    // Find the Reports link in the sidebar and click it
    cy.contains('a', 'Reports').click()
    
    // Verify no 404 and URL is correct
    cy.url().should('include', '/resident/reports')
    cy.contains('Page Not Found').should('not.exist')
    
    // Wait for loader to disappear and no infinite loading
    cy.get('.lucide-loader2').should('not.exist')
    
    // Check for console errors
    cy.checkNoConsoleErrors()
    
    // Verify Root Page Test ID and Header
    cy.get('[data-testid="reports-page"]').should('be.visible')
    cy.contains('Resident Reports & Analytics').should('be.visible')
    
    // Verify Sections via data-testid
    cy.get('[data-testid="maintenance-summary"]').should('be.visible')
    cy.get('[data-testid="payment-history"]').should('be.visible')
    cy.get('[data-testid="complaint-stats"]').should('be.visible')
    cy.get('[data-testid="visitor-stats"]').should('be.visible')
    
    // Verify Action Buttons via data-testid
    cy.get('[data-testid="download-pdf"]').should('be.visible')
    cy.get('[data-testid="export-excel"]').should('be.visible')
    cy.get('[data-testid="print-report"]').should('be.visible')
    
    // Proof
    cy.takeEvidence('Reports_Module_Success')
  })
})
