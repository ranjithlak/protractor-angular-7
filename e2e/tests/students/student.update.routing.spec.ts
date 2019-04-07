'use strict';

import { browser } from 'protractor';
import LoginPage from '../../pages/login.page';
import Helpers from '../../helpers';
import StudentWrite from '../../pages/student.write';

// test different navigation option from add page
// side bar navigation is not including

describe('Check Navigations from Update Page ', () => {
    let loginPage = new LoginPage();
    const userData = require('../../data/login.json').credentials.userData;
    const chosen = 0;
    let studentEditPage = new StudentWrite(chosen);

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);
        await studentEditPage.open();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });

    it('navigate from update to list page', async () => {

        await studentEditPage.clickBack();
        expect(await Helpers.getCurrentUrl()).toContain(browser.baseUrl + browser.params.routes.list);

    });


});
