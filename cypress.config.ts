import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: false,
    screenshotOnRunFailure: false,
    // eslint-disable-next-line no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
