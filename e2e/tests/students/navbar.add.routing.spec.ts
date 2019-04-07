'use strict';

import LoginPage from '../../pages/login.page';
import  StudentAddPage from '../../pages/student.write.page';
import Helpers from '../../helpers';
import { browser } from 'protractor';

describe('Navbar : Navigation from add page', () => {
    let loginPage = new LoginPage();
    let studentAddPage = new StudentAddPage();
    const userData = require('../../data/login.json').credentials.userData;
    
    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData)
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });


    it('check initial state', async () => {
        await studentAddPage.open();

        expect(await studentAddPage.userListLink.getAttribute('class')).toEqual('w3-bar-item w3-button');
        expect(await studentAddPage.addUserLink.getAttribute('class')).toEqual('w3-bar-item w3-button w3-teal');
        expect(await studentAddPage.logoutLink.getAttribute('class')).toEqual('w3-bar-item w3-button');

    });

    it('navigates from add to list user page', async () => {
        await studentAddPage.clickSideBarUserLink();
        expect(await Helpers.getCurrentUrl()).toContain(browser.baseUrl + browser.params.routes.list);
        // no need to check nav bar state in add page , will be a separate tests
    });




});
