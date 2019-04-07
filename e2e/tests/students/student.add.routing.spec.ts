'use strict';

import { browser } from 'protractor';
import LoginPage from '../../pages/login.page';
import Helpers from '../../helpers';
import StudentWrite from '../../pages/student.write';

// test different navigation option from add page
// side bar navigation is not including

describe('Check Navigations from Add Page ', () => {
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

    it('navigate from add to list page', async () => {

        await studentAddPage.clickBack();
        expect(await Helpers.getCurrentUrl()).toContain(browser.baseUrl + browser.params.routes.list);

    });

});
