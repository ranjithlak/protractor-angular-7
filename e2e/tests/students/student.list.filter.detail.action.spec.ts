'use strict';

import ListPage from '../../pages/student.list.page';
import Helpers from '../../helpers';
import LoginPage from '../../pages/login.page';
import { browser } from 'protractor';

describe('List User - Navigate to Edit Page', () => {
    let listPage = new ListPage();
    let loginPage = new LoginPage();
    const userData = require('../../data/login.json').credentials.userData;

    const studentData = require('../../data/student.json');
    const chosenStudent = 1;
    const student = studentData.studentsList[chosenStudent];

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);
        await listPage.open();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });

    it('navigate to user update Page', async () => {
        await listPage.filterStudent(student.last_name);
        await listPage.clickOnUserRow(1);

        // Test will fail, it always redirects to /detail/0
        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.detail + '/' + chosenStudent)
    });
});
