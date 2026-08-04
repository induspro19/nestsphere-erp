describe('Resident Full Module E2E Test', () => {
  beforeEach(() => {
    cy.login('resident@nestsphere.local', 'password123')
  })

  const modules = [
    { name: 'Dashboard', path: '/resident/dashboard', expectedText: 'Welcome Back' },
    { name: 'Bills', path: '/resident/bills', expectedText: 'My Maintenance Bills' },
    { name: 'Visitors', path: '/resident/visitors', expectedText: 'Pre-Approve Visitors & QR Pass' },
    { name: 'Complaints', path: '/resident/complaints', expectedText: 'My Helpdesk Complaints' },
    { name: 'Meetings', path: '/resident/meetings', expectedText: 'Society Meetings & AGM' },
    { name: 'Polls', path: '/resident/polls', expectedText: 'Society Decision Polls & Voting' },
    { name: 'Vehicles', path: '/resident/parking', expectedText: 'My Parking & Vehicles' },
    { name: 'Profile', path: '/resident/profile', expectedText: 'My Profile & Unit Details' }
  ]

  modules.forEach((mod) => {
    it(`navigates to ${mod.name} and renders without infinite loading`, () => {
      cy.visit(mod.path)
      // Check no console errors
      cy.checkNoConsoleErrors()
      
      // Ensure the loader disappears
      cy.get('.lucide-loader2').should('not.exist')
      
      // Check the text on the page
      cy.contains(mod.expectedText, { matchCase: false, timeout: 10000 }).should('be.visible')
      
      // Take evidence
      cy.takeEvidence(`${mod.name}_Success`)
    })
  })
})