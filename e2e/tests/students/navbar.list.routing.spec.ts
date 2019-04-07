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

        expect(await listPage.userListLink.getAttribute('class')).toEqual('w3-bar-item w3-button w3-teal');
        expect(await listPage.addUserLink.getAttribute('class')).toEqual('w3-bar-item w3-button');
        expect(await listPage.logoutLink.getAttribute('class')).toEqual('w3-bar-item w3-button');

    });

    it('navigates from list to add user page', async () => {
        await listPage.clickSideBarAddUserLink();
        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.add);
        // no need to check nav bar state in add page , will be a separate tests
    });




});
