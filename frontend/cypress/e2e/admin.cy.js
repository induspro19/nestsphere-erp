describe('Admin Portal Smoke Test', () => {
  beforeEach(() => {
    cy.login('admin@nestsphere.local', 'password123')
  })

  it('navigates to Admin Dashboard and verifies all core widgets and layout elements', () => {
    // Navigate to Admin Dashboard
    cy.visit('/admin/dashboard')
    
    // Verify no 404 and URL is correct
    cy.url().should('include', '/admin/dashboard')
    cy.contains('Page Not Found').should('not.exist')
    
    // Wait for loader to disappear (no infinite loading)
    cy.get('.lucide-loader2').should('not.exist')
    
    // Check for console errors
    cy.checkNoConsoleErrors()
    
    // 1. Dashboard loads successfully
    cy.get('[data-testid="admin-dashboard"]', { timeout: 10000 }).should('be.visible')
    
    // 2. Dashboard title exists
    cy.get('[data-testid="dashboard-title"]').should('be.visible').and('contain.text', 'Welcome back')
    
    // 3. Sidebar exists
    cy.get('[data-testid="sidebar"]').should('be.visible')
    
    // 4. Header exists
    cy.get('[data-testid="header"]').should('be.visible')
    
    // 5. Profile menu exists
    cy.get('[data-testid="user-profile-menu"]').should('be.visible')
    
    // 6. Notification icon exists
    cy.get('[data-testid="notification-icon"]').should('be.visible')
    
    // 7. KPI cards are visible
    cy.get('[data-testid="kpi-cards"]').should('be.visible')
    
    // 8. Recent Activity widget exists
    cy.get('[data-testid="recent-activity-widget"]').should('be.visible')
    
    // 9. Quick Actions widget exists
    cy.get('[data-testid="quick-actions-widget"]').should('be.visible')
    
    // 10. Charts render correctly
    cy.get('[data-testid="charts-widget"]').should('be.visible')
    
    // Save screenshot proof
    cy.takeEvidence('Admin_Dashboard_Success')
  })
})
