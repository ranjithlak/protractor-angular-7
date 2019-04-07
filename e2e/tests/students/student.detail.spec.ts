'use strict';

import { browser } from 'protractor';
import StudentDetail from '../../pages/student.details.page';
import LoginPage from '../../pages/login.page';
import Helpers from '../../helpers';

describe('Display User Detail for the student ', () => {
    let loginPage = new LoginPage();
    const studentData = require('../../data/student.json');
    const userData = require('../../data/login.json').credentials.userData;
    const student = studentData.studentsList[0];
    const headers = studentData.headers;
    const messages = studentData.messages;
    const studentDetailPage = new StudentDetail(student.id - 1);

    beforeAll(async () => {
        // avoid manual login - set user Data in local storage directely
        // if login is broken, this test will not be blocled
        // reduce execution time (many tests require login)
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });

    it('should navigate to the list page', async () => {
        await studentDetailPage.open();

        expect(await studentDetailPage.getToastText()).toContain(messages.studentDetailsFetched);
        expect(await studentDetailPage.getHeaderTitle()).toContain(headers.detail);
        expect(await studentDetailPage.getStudentCardTitle()).toEqual(student.first_name + ' ' +student.last_name);
        expect(await studentDetailPage.getFirstName()).toEqual(student.first_name);
        expect(await studentDetailPage.getLastName()).toEqual(student.last_name);
        expect(await studentDetailPage.getEmail()).toEqual(student.email);
        expect(await studentDetailPage.getPhone()).toEqual(student.phone);
    });


});
