'use strict';

import LoginPage from '../../pages/login.page'
import Helpers from '../../helpers';

// UI Behavior Tests - Focus on the warning displayed when user enters invalid data

describe('Check Login Form Behavior', () => {
    let loginPage = new LoginPage();
    const loginData = require('../../data/login.json');

    beforeEach(async () => {
        await loginPage.open();
        await Helpers.clearLocalStorage();
    });

    it('Default Behavior', async () => {
        
        expect(await loginPage.loginBtn.isEnabled()).toBe(false);
        expect(await loginPage.getAlertNumber()).toEqual(0);
    });

    it('Behavior : Invalid Email - Invalid Password Length', async () => {
        // we could split this test in 2 smaller tests 
        // test 1 : check invalid email
        // test 2 : check invalid password
        // but prefer to combine : check submit button behavior even if 2 elements are enterd

        await loginPage.setEmail(loginData.credentials.invalidEmail);
        await loginPage.setPassword(loginData.credentials.invalidPasswordLength);

        expect(await loginPage.loginBtn.isEnabled()).toBe(false);
        expect(await loginPage.getAlertNumber()).toEqual(2);
        expect(await loginPage.getAlerts(0)).toEqual(loginData.warnings.invalidEmail);
        expect(await loginPage.getAlerts(1)).toEqual(loginData.warnings.invalidPassword);
    });

    it('Behavior : Invalid Password Format', async () => {

        await loginPage.setPassword(loginData.credentials.invalidPasswordNoNumber);

        expect(await loginPage.loginBtn.isEnabled()).toBe(false);
        expect(await loginPage.getAlertNumber()).toEqual(1);
        expect(await loginPage.getAlerts(0)).toEqual(loginData.warnings.invalidPassword);
    });

    it('Behavior : Right Credentials Format', async () => {

        await loginPage.setEmail(loginData.credentials.correctUsername);
        await loginPage.setPassword(loginData.credentials.correctPassword);

        expect(await loginPage.loginBtn.isEnabled()).toBe(true);
        expect(await loginPage.getAlertNumber()).toEqual(0);
    });

});
