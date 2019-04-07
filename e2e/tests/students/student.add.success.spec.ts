'use strict';

import { browser, protractor, WebDriver } from 'protractor';
import LoginPage from '../../pages/login.page';
import Helpers from '../../helpers';
import StudentWrite from '../../pages/student.write';

// Functional Test Checks Process of user creation
// UI behavior checked in a different test

describe('Create New User ', () => {
    let loginPage = new LoginPage();
    let studentAddPage = new StudentWrite();
    const userData = require('../../data/login.json').credentials.userData;
    const studentData = require('../../data/student.json');

    const listPageUrl = browser.baseUrl + browser.params.routes.list;

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);
        await studentAddPage.open();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });


    it('enter valid user data', async () => {
        await studentAddPage.setFirstName(studentData.aStudent.validData.firstName);
        await studentAddPage.setLastName(studentData.aStudent.validData.lastName);
        await studentAddPage.setEmail(studentData.aStudent.validData.email);
        await studentAddPage.setPhone(studentData.aStudent.validData.phone);

        expect(await studentAddPage.submitButtonIsEnabled()).toBe(true);
    });

    it('submit user data successfully', async () => {
        await studentAddPage.submit();

        expect(await browser.getCurrentUrl()).toEqual(listPageUrl);
        expect(await studentAddPage.getToastText()).toContain(studentData.messages.studentAdded);
    });

    xit('check user in List Page', async () => {
        // count changes
        // to be checked later
        // once list page is added
    });

});
