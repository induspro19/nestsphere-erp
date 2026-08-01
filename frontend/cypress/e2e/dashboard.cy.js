describe("Dashboard Test", () => {

  it("Open Dashboard", () => {

    cy.visit("http://localhost:3000");

    cy.wait(3000);

    cy.contains("Dashboard").should("exist");

  });

});