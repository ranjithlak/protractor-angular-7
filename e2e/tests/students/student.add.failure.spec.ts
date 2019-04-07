'use strict';

import { browser, protractor, WebDriver } from 'protractor';
import LoginPage from '../../pages/login.page';
import Helpers from '../../helpers';
import StudentWrite from '../../pages/student.write.page';

// Functional Test Checks Process of user creation
// UI behavior checked in a different test

describe('Create New User ', () => {
    let loginPage = new LoginPage();
    let studentAddPage = new StudentWrite();
    const userData = require('../../data/login.json').credentials.userData;
    const studentData = require('../../data/student.json');

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);
        await studentAddPage.open();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });


    it('enter valid user data - existing email', async () => {
        await studentAddPage.setFirstName(studentData.aStudent.validData.firstName);
        await studentAddPage.setLastName(studentData.aStudent.validData.lastName);
        await studentAddPage.setEmail(studentData.studentsList[0].email);
        await studentAddPage.setPhone(studentData.aStudent.validData.phone);

        expect(await studentAddPage.submitButtonIsEnabled()).toBe(true);
    });

    it('submit user data successfully', async () => {
        await studentAddPage.submit();

        expect(await browser.getCurrentUrl()).toContain(studentAddPage.url);
        expect(await studentAddPage.getToastText()).toContain(studentData.messages.existingEmail);
    });

});
