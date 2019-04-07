'use strict';

import { browser } from 'protractor';
import LoginPage from '../../pages/login.page'
import Helpers from '../../helpers';

// Functional Test - should focus on the logic behind the login - positive scenario

describe('Login Successful with right Credentials ', () => {
    let loginPage = new LoginPage();
    const loginData = require('../../data/login.json');
    const listUrl = browser.baseUrl + browser.params.routes.list;

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.clearLocalStorage();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });

    it('right credentials', async () => {
        await loginPage.setEmail(loginData.credentials.userData.email);
        await loginPage.setPassword(loginData.credentials.userData.password);
        await loginPage.submit();

        expect(await browser.getCurrentUrl()).toEqual(listUrl);
        expect(await loginPage.getToastText()).toContain(loginData.message.success);
    });
});
