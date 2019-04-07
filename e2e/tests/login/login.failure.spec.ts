'use strict';

import { browser, protractor } from 'protractor';
import LoginPage from '../../pages/login.page'
import Helpers from '../../helpers';

// Functional Test - should focus on the logic behind the login - negative scenario

describe('Login Fail With Wrong Credentials', () => {
    let loginPage = new LoginPage();
    const loginData = require('../../data/login.json');

    beforeAll(async () => {
        // clear Local Storage to make sure user is not redirected to main page
        await loginPage.open();
        await Helpers.clearLocalStorage();
    });

    beforeEach(async () => {
        await browser.wait(protractor.ExpectedConditions.invisibilityOf(loginPage.toast), browser.params.timeouts.medium)
    });

    it('Wrong Username', async () => {
        await loginPage.setEmail(loginData.credentials.wrongUsername);
        await loginPage.setPassword(loginData.credentials.userData.password);
        await loginPage.submit();

        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.login);
        expect(await loginPage.getToastText()).toContain(loginData.message.failure);
    });



    it('Wrong Password', async () => {
        await loginPage.setEmail(loginData.credentials.userData.email);
        await loginPage.setPassword(loginData.credentials.wrongPassword);
        await loginPage.submit();

        expect(await loginPage.getToastText()).toContain(loginData.message.failure);
        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.login);
    });

});
