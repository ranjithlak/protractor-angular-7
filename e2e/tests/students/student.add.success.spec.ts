'use strict';

import { browser } from 'protractor';
import LoginPage from '../../pages/login.page';
import StudentDetail from '../../pages/student.details.page';
import ListPage from '../../pages/student.list.page';
import Helpers from '../../helpers';
import StudentWrite from '../../pages/student.write.page';

// Functional Test Checks Process of user creation
// UI behavior checked in a different test

describe('Create New User ', () => {
    let loginPage = new LoginPage();
    let studentAddPage = new StudentWrite();
    let listPage = new ListPage();
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

    it('checks user is saved with entred values', async () => {
        await listPage.isloaded();

        expect(await listPage.countStudent()).toEqual(6);
        expect(await listPage.getFirstName(1)).toEqual(studentData.aStudent.validData.firstName);
        expect(await listPage.getLastName(1)).toEqual(studentData.aStudent.validData.lastName);
        expect(await listPage.getEmail(1)).toEqual(studentData.aStudent.validData.email);
        expect(await listPage.getPhone(1)).toContain(studentData.aStudent.validData.phone);
    });

});
