'use strict';

import LoginPage from '../../pages/login.page';
import ListPage from '../../pages/student.list.page';
import Helpers from '../../helpers';
import { browser } from 'protractor';

describe('Navbar : Navigation from list page', () => {
    let loginPage = new LoginPage();
    let listPage = new ListPage();
    const userData = require('../../data/login.json').credentials.userData;

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData)
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });


    it('check initial state', async () => {
        await listPage.open();
        await listPage.logout();

        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.login);
    });

});
