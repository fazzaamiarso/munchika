/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: 'netlify',
  server: './server.js',
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: 'app',
  // assetsBuildDirectory: 'public/build',
  // serverBuildPath: 'netlify/functions/server/index.js',
  // publicPath: '/build/',
  // devServerPort: 8002,
  routes(defineRoutes) {
    return defineRoutes(route => {
      if (process.env.ENABLE_TEST_ROUTES === 'true') {
        route('__test/login', '__test_routes__/login.tsx');
      }
    });
  },
};
