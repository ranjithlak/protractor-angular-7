'use strict';

import ListPage from '../../pages/student.list.page';
import Helpers from '../../helpers';
import LoginPage from '../../pages/login.page';
import { browser } from 'protractor';

describe('Check Navigations from Add Page', () => {
    let listPage = new ListPage();
    let loginPage = new LoginPage();
    const userData = require('../../data/login.json').credentials.userData;


    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);
        await listPage.open();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });

    // check initial behavior
    it('navigate from list to list add page', async () => {
        await listPage.clickAddNewUserButton();
        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.add);
    });

});
