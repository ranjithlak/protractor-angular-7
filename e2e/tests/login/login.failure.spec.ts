'use strict';

import { browser } from 'protractor';
import LoginPage from '../../pages/login.page'
import Helpers from '../../helpers';

// Functional Test - should focus on the logic behind the login - negative scenario

describe('Login Fail With Wrong Credentials', () => {
    let loginPage = new LoginPage();
    const loginData = require('../../data/login.json');
    const loginUrl = browser.baseUrl + browser.params.routes.login;


    beforeAll(async () => {
        // clear Local Storage to make sure user is not redirected to main page
        await loginPage.open();
        await Helpers.clearLocalStorage();
    });

    it('Wrong Username', async () => {
        await loginPage.setEmail(loginData.credentials.wrongUsername);
        await loginPage.setPassword(loginData.credentials.correctPassword);
        await loginPage.submit();

        expect(await loginPage.getToastText()).toContain(loginData.message.success);
        expect(await Helpers.getCurrentUrl()).toEqual(loginUrl);
    });

    it('Wrong Password', async () => {
        await loginPage.setEmail(loginData.credentials.correctUsername);
        await loginPage.setPassword(loginData.credentials.wrongPassword);
        await loginPage.submit();

        expect(await loginPage.getToastText()).toContain(loginData.message.failure);
        expect(await Helpers.getCurrentUrl()).toEqual(loginUrl);
    });

});
