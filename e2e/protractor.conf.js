const { SpecReporter } = require('jasmine-spec-reporter');
const HtmlReporter = require('protractor-beautiful-reporter');



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
    },
    timeouts: {
      small: 1000,
      medium: 5000,
      large: 10000
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
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: false, displayDuration : true } }));
    jasmine.getEnv().addReporter(new HtmlReporter({
      baseDirectory: require('path').join(__dirname, './htmlReport'),
    }).getJasmine2Reporter());
  }
};