var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "List User Page requires login|Authorization : Login is Mandatory to navigate to all pages",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00d60046-000d-007d-00de-002b0036007f.png",
        "timestamp": 1554682536066,
        "duration": 1096
    },
    {
        "description": "Add User Page requires login|Authorization : Login is Mandatory to navigate to all pages",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00a600f8-00a7-00f2-00ed-0079008600f6.png",
        "timestamp": 1554682537617,
        "duration": 1320
    },
    {
        "description": "Edit User Page requires login|Authorization : Login is Mandatory to navigate to all pages",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00040095-0011-00f5-00e0-008200ac00a2.png",
        "timestamp": 1554682539397,
        "duration": 1502
    },
    {
        "description": "Detail User Page requires login|Authorization : Login is Mandatory to navigate to all pages",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0015004c-00f4-00f3-0016-00ed00a9009b.png",
        "timestamp": 1554682541355,
        "duration": 1350
    },
    {
        "description": "Wrong Username|Login Fail With Wrong Credentials",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002c00de-007a-00e5-00a3-008200b8001a.png",
        "timestamp": 1554682544308,
        "duration": 611
    },
    {
        "description": "Wrong Password|Login Fail With Wrong Credentials",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e0007d-009b-002b-002e-00e0008b005b.png",
        "timestamp": 1554682545311,
        "duration": 3263
    },
    {
        "description": "right credentials|Login Successful with right Credentials ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "ng:///AppModule/StudentListComponent_Host.ngfactory.js 4:31 \"ERROR\" TypeError: Cannot read property 'length' of null\n    at StudentListComponent.push../src/app/components/student/list/student-list.component.ts.StudentListComponent.success (http://localhost:4200/main.js:828:50)\n    at StudentListComponent.push../src/app/components/student/list/student-list.component.ts.StudentListComponent.getStudentList (http://localhost:4200/main.js:823:14)\n    at StudentListComponent.push../src/app/components/student/list/student-list.component.ts.StudentListComponent.ngOnInit (http://localhost:4200/main.js:818:14)\n    at checkAndUpdateDirectiveInline (http://localhost:4200/vendor.js:59768:19)\n    at checkAndUpdateNodeInline (http://localhost:4200/vendor.js:61032:20)\n    at checkAndUpdateNode (http://localhost:4200/vendor.js:60994:16)\n    at debugCheckAndUpdateNode (http://localhost:4200/vendor.js:61628:38)\n    at debugCheckDirectivesFn (http://localhost:4200/vendor.js:61588:13)\n    at Object.eval [as updateDirectives] (ng:///AppModule/StudentListComponent_Host.ngfactory.js:9:5)\n    at Object.debugUpdateDirectives [as updateDirectives] (http://localhost:4200/vendor.js:61580:21)",
                "timestamp": 1554682550497,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "ng:///AppModule/StudentListComponent_Host.ngfactory.js 4:31 \"ERROR CONTEXT\" DebugContext_",
                "timestamp": 1554682550500,
                "type": ""
            }
        ],
        "screenShotFile": "009600a7-0003-0025-0087-008e00ac00bb.png",
        "timestamp": 1554682550062,
        "duration": 581
    },
    {
        "description": "Default Behavior|Check Login Form Behavior",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00cb0021-00c9-0024-0038-00be004100b5.png",
        "timestamp": 1554682550993,
        "duration": 1399
    },
    {
        "description": "Behavior : Invalid Email - Invalid Password Length|Check Login Form Behavior",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0020005a-009a-0043-0017-004300460036.png",
        "timestamp": 1554682552754,
        "duration": 1633
    },
    {
        "description": "Behavior : Invalid Password Format|Check Login Form Behavior",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00180055-001c-00f2-008c-0002002900e7.png",
        "timestamp": 1554682554702,
        "duration": 1535
    },
    {
        "description": "Behavior : Right Credentials Format|Check Login Form Behavior",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ea002d-003e-002b-0035-0064005c0045.png",
        "timestamp": 1554682556585,
        "duration": 1718
    },
    {
        "description": "check initial state|Navbar : Navigation from list page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "005b0064-0076-0049-00a2-00890049007a.png",
        "timestamp": 1554682559821,
        "duration": 1917
    },
    {
        "description": "check initial state|Navbar : Navigation from add page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00d2005d-0087-0093-00df-009d00c6009a.png",
        "timestamp": 1554682563360,
        "duration": 1891
    },
    {
        "description": "navigates from add to list user page|Navbar : Navigation from add page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "005e0064-00b4-00b3-0037-0039009200ee.png",
        "timestamp": 1554682565571,
        "duration": 178
    },
    {
        "description": "check initial state|Navbar : Navigation from list page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006400f5-006f-0047-002f-0060009a004c.png",
        "timestamp": 1554682567366,
        "duration": 1828
    },
    {
        "description": "navigates from list to add user page|Navbar : Navigation from list page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b7008c-0099-0026-00a7-005c000100bd.png",
        "timestamp": 1554682569519,
        "duration": 176
    },
    {
        "description": "enter valid user data - existing email|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b000d6-007e-00ab-00d6-0052007e004c.png",
        "timestamp": 1554682572851,
        "duration": 538
    },
    {
        "description": "submit user data successfully|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00720065-0033-00cf-00ec-003a00ac0017.png",
        "timestamp": 1554682573690,
        "duration": 270
    },
    {
        "description": "navigate from add to list page|Check Navigations from Add Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "007f008f-0099-0078-00b8-005400160018.png",
        "timestamp": 1554682577095,
        "duration": 226
    },
    {
        "description": "enter valid user data|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001400db-00c3-00c6-009d-009700be0058.png",
        "timestamp": 1554682580692,
        "duration": 549
    },
    {
        "description": "submit user data successfully|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "000a00db-00e3-00e5-0078-001000ae009b.png",
        "timestamp": 1554682581582,
        "duration": 299
    },
    {
        "description": "checks user is saved with entred values|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00d20008-0090-0050-0055-00200065009f.png",
        "timestamp": 1554682582274,
        "duration": 584
    },
    {
        "description": "from details to list page|Check Navigations from details Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00d7005f-005a-0064-006f-000a003c0027.png",
        "timestamp": 1554682584434,
        "duration": 1900
    },
    {
        "description": "navigate from details to list page|Check Navigations from details Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009300cd-0033-005b-000d-00ee00270041.png",
        "timestamp": 1554682586679,
        "duration": 2100
    },
    {
        "description": "navigate from details to update page|Check Navigations from details Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004a00e9-0071-00d0-0006-0051002200f5.png",
        "timestamp": 1554682589218,
        "duration": 2171
    },
    {
        "description": "should navigate to the list page|Display User Detail for the student ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e0003d-001d-0038-00b8-00c3009200b0.png",
        "timestamp": 1554682593065,
        "duration": 2187
    },
    {
        "description": "approve user deletion|List User - Navigate to Edit Page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0010006e-003d-0026-0028-00e200050000.png",
        "timestamp": 1554682598452,
        "duration": 1965
    },
    {
        "description": "cancel user deletion|List User - Navigate to Edit Page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001f0016-002c-00ea-009b-000300f800fe.png",
        "timestamp": 1554682600816,
        "duration": 1617
    },
    {
        "description": "navigate to user update Page|List User - Navigate to Edit Page",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": [
            "Expected 'http://localhost:4200/detail/0' to contain '/detail/1'."
        ],
        "trace": [
            "Error: Failed expectation\n    at Object.<anonymous> (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\e2e\\tests\\students\\student.list.filter.detail.action.spec.ts:32:47)\n    at step (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:133:27)\n    at Object.next (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:114:57)\n    at fulfilled (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:104:62)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:189:7)"
        ],
        "browserLogs": [],
        "screenShotFile": "00570019-001f-00ec-0007-004a008700e4.png",
        "timestamp": 1554682605835,
        "duration": 278
    },
    {
        "description": "check number initial load|List User - Filter Operation ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0055009f-006f-0036-00c4-0084005e00ca.png",
        "timestamp": 1554682607792,
        "duration": 1838
    },
    {
        "description": "filter by name|List User - Filter Operation ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ad0097-0024-0050-006f-006500f000c8.png",
        "timestamp": 1554682609972,
        "duration": 322
    },
    {
        "description": "filter by non existing user|List User - Filter Operation ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002e0010-00fa-00e6-0032-00ec00f400d2.png",
        "timestamp": 1554682610624,
        "duration": 177
    },
    {
        "description": "filter by last name|List User - Filter Operation ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "005c00a4-00ce-00af-0080-008f005e00f5.png",
        "timestamp": 1554682611184,
        "duration": 288
    },
    {
        "description": "navigate to user update Page|List User - Navigate to Edit Page",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": [
            "Expected 'http://localhost:4200/update/0' to contain '/update/1'."
        ],
        "trace": [
            "Error: Failed expectation\n    at Object.<anonymous> (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\e2e\\tests\\students\\student.list.filter.update.action.spec.ts:32:47)\n    at step (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:133:27)\n    at Object.next (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:114:57)\n    at fulfilled (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:104:62)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:189:7)"
        ],
        "browserLogs": [],
        "screenShotFile": "001f0040-0086-00ad-0018-00b40083006f.png",
        "timestamp": 1554682615203,
        "duration": 381
    },
    {
        "description": "navigate from list to list add page|Check Navigations from Add Page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e4006b-00e6-005b-0071-0091000c00f2.png",
        "timestamp": 1554682619462,
        "duration": 195
    },
    {
        "description": "navigate from update to list page|Check Navigations from Update Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 96835 WebSocket connection to 'ws://localhost:4200/sockjs-node/458/tx2suvpk/websocket' failed: WebSocket is closed before the connection is established.",
                "timestamp": 1554682621426,
                "type": ""
            }
        ],
        "screenShotFile": "001b0034-002c-00d5-00a1-003900c700a1.png",
        "timestamp": 1554682622895,
        "duration": 209
    },
    {
        "description": "check initial state|Update New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00480076-00b8-0014-00d6-000c005c0074.png",
        "timestamp": 1554682624786,
        "duration": 2021
    },
    {
        "description": "enter valid user data|Update New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004700f1-00dc-0099-00de-00ff006f0034.png",
        "timestamp": 1554682627148,
        "duration": 535
    },
    {
        "description": "submit user data successfully|Update New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00fe002b-00b6-003e-0081-00b100a6008d.png",
        "timestamp": 1554682628007,
        "duration": 317
    },
    {
        "description": "check user in List Page|Update New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 379672,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001700f2-00f0-0033-0035-00dc00f70061.png",
        "timestamp": 1554682628737,
        "duration": 659
    },
    {
        "description": "List User Page requires login|Authorization : Login is Mandatory to navigate to all pages",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "003200e7-0054-00ce-0070-008500230064.png",
        "timestamp": 1554682994628,
        "duration": 977
    },
    {
        "description": "Add User Page requires login|Authorization : Login is Mandatory to navigate to all pages",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002f0030-0094-00a4-00e9-00d4000b0030.png",
        "timestamp": 1554682996055,
        "duration": 960
    },
    {
        "description": "Edit User Page requires login|Authorization : Login is Mandatory to navigate to all pages",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00fb008b-0090-002c-00ac-009200d70023.png",
        "timestamp": 1554682997399,
        "duration": 1150
    },
    {
        "description": "Detail User Page requires login|Authorization : Login is Mandatory to navigate to all pages",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00fe00c4-0065-0062-00c8-00ca009d004e.png",
        "timestamp": 1554682998930,
        "duration": 1009
    },
    {
        "description": "Wrong Username|Login Fail With Wrong Credentials",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001900be-0038-00e2-00ee-004e00f1008f.png",
        "timestamp": 1554683001512,
        "duration": 661
    },
    {
        "description": "Wrong Password|Login Fail With Wrong Credentials",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "007200d3-0023-008b-0013-00e30044001d.png",
        "timestamp": 1554683002558,
        "duration": 3281
    },
    {
        "description": "right credentials|Login Successful with right Credentials ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "ng:///AppModule/StudentListComponent_Host.ngfactory.js 4:31 \"ERROR\" TypeError: Cannot read property 'length' of null\n    at StudentListComponent.push../src/app/components/student/list/student-list.component.ts.StudentListComponent.success (http://localhost:4200/main.js:828:50)\n    at StudentListComponent.push../src/app/components/student/list/student-list.component.ts.StudentListComponent.getStudentList (http://localhost:4200/main.js:823:14)\n    at StudentListComponent.push../src/app/components/student/list/student-list.component.ts.StudentListComponent.ngOnInit (http://localhost:4200/main.js:818:14)\n    at checkAndUpdateDirectiveInline (http://localhost:4200/vendor.js:59768:19)\n    at checkAndUpdateNodeInline (http://localhost:4200/vendor.js:61032:20)\n    at checkAndUpdateNode (http://localhost:4200/vendor.js:60994:16)\n    at debugCheckAndUpdateNode (http://localhost:4200/vendor.js:61628:38)\n    at debugCheckDirectivesFn (http://localhost:4200/vendor.js:61588:13)\n    at Object.eval [as updateDirectives] (ng:///AppModule/StudentListComponent_Host.ngfactory.js:9:5)\n    at Object.debugUpdateDirectives [as updateDirectives] (http://localhost:4200/vendor.js:61580:21)",
                "timestamp": 1554683008052,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "ng:///AppModule/StudentListComponent_Host.ngfactory.js 4:31 \"ERROR CONTEXT\" DebugContext_",
                "timestamp": 1554683008053,
                "type": ""
            }
        ],
        "screenShotFile": "006700f4-003c-0024-0095-00e000140015.png",
        "timestamp": 1554683007592,
        "duration": 618
    },
    {
        "description": "Default Behavior|Check Login Form Behavior",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004300dc-00dc-0030-00d4-006e001a007d.png",
        "timestamp": 1554683008580,
        "duration": 1603
    },
    {
        "description": "Behavior : Invalid Email - Invalid Password Length|Check Login Form Behavior",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "005c00f5-009b-0074-00dc-0061005b0073.png",
        "timestamp": 1554683010569,
        "duration": 1936
    },
    {
        "description": "Behavior : Invalid Password Format|Check Login Form Behavior",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0007002a-003f-0041-001e-0023004e006b.png",
        "timestamp": 1554683012852,
        "duration": 1834
    },
    {
        "description": "Behavior : Right Credentials Format|Check Login Form Behavior",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00be0037-006f-0011-00a3-008000bb00e3.png",
        "timestamp": 1554683015001,
        "duration": 1666
    },
    {
        "description": "check initial state|Navbar : Navigation from list page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0056000a-0093-003e-0089-0073001200ab.png",
        "timestamp": 1554683018196,
        "duration": 1928
    },
    {
        "description": "check initial state|Navbar : Navigation from add page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00980053-00f4-004e-00a4-0004000900b5.png",
        "timestamp": 1554683022103,
        "duration": 2037
    },
    {
        "description": "navigates from add to list user page|Navbar : Navigation from add page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00bd00fd-0054-0022-00d6-002400880018.png",
        "timestamp": 1554683024452,
        "duration": 183
    },
    {
        "description": "check initial state|Navbar : Navigation from list page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006e00ff-0080-00ac-00c6-00250027005a.png",
        "timestamp": 1554683026206,
        "duration": 1677
    },
    {
        "description": "navigates from list to add user page|Navbar : Navigation from list page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "007b0015-00b8-00c8-00cc-00d300590077.png",
        "timestamp": 1554683028248,
        "duration": 189
    },
    {
        "description": "enter valid user data - existing email|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00eb00d6-005b-00a4-002f-0063000c0099.png",
        "timestamp": 1554683032278,
        "duration": 630
    },
    {
        "description": "submit user data successfully|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009700c6-00f6-00c7-0015-0001000400a2.png",
        "timestamp": 1554683033302,
        "duration": 354
    },
    {
        "description": "navigate from add to list page|Check Navigations from Add Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00a00071-00cd-0056-0097-00f8006e0099.png",
        "timestamp": 1554683037352,
        "duration": 190
    },
    {
        "description": "enter valid user data|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00880071-0012-0009-00b8-002e00b300b2.png",
        "timestamp": 1554683041040,
        "duration": 517
    },
    {
        "description": "submit user data successfully|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00af00ee-00e1-00f9-00ec-00ce0069000d.png",
        "timestamp": 1554683041863,
        "duration": 338
    },
    {
        "description": "checks user is saved with entred values|Create New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c500cf-0051-00e3-00ef-0020000a0034.png",
        "timestamp": 1554683042568,
        "duration": 592
    },
    {
        "description": "from details to list page|Check Navigations from details Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009e005c-00ce-0083-008d-0056006b0000.png",
        "timestamp": 1554683044863,
        "duration": 2433
    },
    {
        "description": "navigate from details to list page|Check Navigations from details Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00750010-0039-0037-00ac-002d00c80014.png",
        "timestamp": 1554683047754,
        "duration": 2416
    },
    {
        "description": "navigate from details to update page|Check Navigations from details Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00cd0096-00c6-00c7-007c-005100dd009f.png",
        "timestamp": 1554683050618,
        "duration": 2126
    },
    {
        "description": "should navigate to the list page|Display User Detail for the student ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 96835 WebSocket connection to 'ws://localhost:4200/sockjs-node/264/ujcpimog/websocket' failed: WebSocket is closed before the connection is established.",
                "timestamp": 1554683054688,
                "type": ""
            }
        ],
        "screenShotFile": "004b0018-00e9-00f8-0020-006d00f800ff.png",
        "timestamp": 1554683054611,
        "duration": 1893
    },
    {
        "description": "approve user deletion|List User - Navigate to Edit Page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00570012-007c-00c1-00d8-002300e70077.png",
        "timestamp": 1554683060317,
        "duration": 1815
    },
    {
        "description": "cancel user deletion|List User - Navigate to Edit Page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0024000e-00d5-00a0-000a-00e700f60070.png",
        "timestamp": 1554683062551,
        "duration": 1763
    },
    {
        "description": "navigate to user update Page|List User - Navigate to Edit Page",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": [
            "Expected 'http://localhost:4200/detail/0' to contain '/detail/1'."
        ],
        "trace": [
            "Error: Failed expectation\n    at Object.<anonymous> (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\e2e\\tests\\students\\student.list.filter.detail.action.spec.ts:32:47)\n    at step (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:133:27)\n    at Object.next (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:114:57)\n    at fulfilled (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:104:62)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:189:7)"
        ],
        "browserLogs": [],
        "screenShotFile": "00b30028-00f4-0082-0045-000800b200db.png",
        "timestamp": 1554683067764,
        "duration": 217
    },
    {
        "description": "check number initial load|List User - Filter Operation ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 96835 WebSocket connection to 'ws://localhost:4200/sockjs-node/316/0wbzgzsp/websocket' failed: WebSocket is closed before the connection is established.",
                "timestamp": 1554683069912,
                "type": ""
            }
        ],
        "screenShotFile": "00bb007d-00f8-0024-00cc-00cc00920036.png",
        "timestamp": 1554683069813,
        "duration": 1586
    },
    {
        "description": "filter by name|List User - Filter Operation ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00f700f6-0077-005b-007b-002800930073.png",
        "timestamp": 1554683071735,
        "duration": 301
    },
    {
        "description": "filter by non existing user|List User - Filter Operation ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004c00a6-00fb-0065-00cd-00070086003b.png",
        "timestamp": 1554683072387,
        "duration": 166
    },
    {
        "description": "filter by last name|List User - Filter Operation ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0018006c-0031-00c9-004e-00de00af00df.png",
        "timestamp": 1554683072877,
        "duration": 278
    },
    {
        "description": "navigate to user update Page|List User - Navigate to Edit Page",
        "passed": false,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": [
            "Expected 'http://localhost:4200/update/0' to contain '/update/1'."
        ],
        "trace": [
            "Error: Failed expectation\n    at Object.<anonymous> (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\e2e\\tests\\students\\student.list.filter.update.action.spec.ts:32:47)\n    at step (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:133:27)\n    at Object.next (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:114:57)\n    at fulfilled (C:\\Users\\slim.zouari\\itpx\\protractor-angular-7\\node_modules\\tslib\\tslib.js:104:62)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:189:7)"
        ],
        "browserLogs": [],
        "screenShotFile": "00370079-004c-0044-0004-00a300120037.png",
        "timestamp": 1554683076848,
        "duration": 353
    },
    {
        "description": "navigate from list to list add page|Check Navigations from Add Page",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006f0030-00f6-0006-00f9-0053000100eb.png",
        "timestamp": 1554683080554,
        "duration": 180
    },
    {
        "description": "navigate from update to list page|Check Navigations from Update Page ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00870033-0070-002e-005f-00d3005a0049.png",
        "timestamp": 1554683084141,
        "duration": 190
    },
    {
        "description": "check initial state|Update New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00a300ce-00cc-0081-0060-00b600c40002.png",
        "timestamp": 1554683085866,
        "duration": 1870
    },
    {
        "description": "enter valid user data|Update New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c90064-004e-0062-0062-005800ac00c2.png",
        "timestamp": 1554683088081,
        "duration": 683
    },
    {
        "description": "submit user data successfully|Update New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00d0005b-00fc-0070-00cf-005d00a6009f.png",
        "timestamp": 1554683089108,
        "duration": 336
    },
    {
        "description": "check user in List Page|Update New User ",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "instanceId": 381872,
        "browser": {
            "name": "chrome",
            "version": "73.0.3683.86"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001e002f-0074-00b4-002d-00bc0066006e.png",
        "timestamp": 1554683089854,
        "duration": 545
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

