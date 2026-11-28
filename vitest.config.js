const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: 'text',
      include: ['utils/**/*.js', 'models/**/*.js', 'controllers/apiController.js', 'services/**/*.js'],
      exclude: ['**/node_modules/**'],
    },
  },
});
