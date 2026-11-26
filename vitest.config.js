const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['utils/**/*.js', 'models/**/*.js', 'controllers/apiController.js', 'services/**/*.js'],
      exclude: ['**/node_modules/**'],
    },
  },
});
