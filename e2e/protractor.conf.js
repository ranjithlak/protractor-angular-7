const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  // disable promise manger - allows usage of async/await
  SELENIUM_PROMISE_MANAGER: false,
  
  params: {
    routes: {
      'list': '/',
      'add': '/add',
      'update': '/update',
      'detail': '/detail',
      'login': '/login'
    }
  },

  allScriptsTimeout: 11000,
  specs: [
    './tests/**/*.spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () { }
  },
  onPrepare() {
    browser.driver.manage().window().maximize();
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};