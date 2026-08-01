# NestSphere ERP - QA Automation Guide

## Installation

Cypress is integrated into the frontend project.

```bash
cd frontend
npm install
```

## Commands

Run these commands from the `frontend` folder:

* `npm run cy:open` - Opens the interactive Cypress Test Runner
* `npm run cy:run` - Runs tests headlessly
* `npm run cy:headed` - Runs tests in headed mode
* `npm run cy:chrome` - Runs tests using Chrome browser

## Folder Structure

```
cypress/
  e2e/               # Test files (*.cy.js)
  fixtures/          # Mock data
  support/           # Custom commands and global config
    commands.js      # Reusable commands like cy.login()
    e2e.js           # Global imports
```

## How to write tests

Create a file ending in `.cy.js` inside `cypress/e2e/`.

```javascript
describe('My Feature', () => {
  beforeEach(() => {
    cy.login()
  })

  it('works correctly', () => {
    cy.visit('/feature')
    cy.get('.my-element').should('be.visible')
  })
})
```

## How to run tests

To run all tests headlessly:
```bash
npm run cy:run
```

To run a specific test:
```bash
npx cypress run --spec "cypress/e2e/login.cy.js"
```

## How to debug

1. Use `npm run cy:open` and click on steps.
2. Use `.pause()` in your tests: `cy.get('.element').pause().click()`
3. Use `.debug()` for inspecting element details.

## How to record videos

Videos are automatically recorded when running in headless mode (`npm run cy:run`) and saved to `cypress/videos`.

## How to capture screenshots

Use `cy.screenshot('name')` or `cy.takeEvidence('name')` to manually take a screenshot. Cypress also takes screenshots automatically on test failure, saved to `cypress/screenshots`.
