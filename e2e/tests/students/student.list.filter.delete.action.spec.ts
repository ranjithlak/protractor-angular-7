'use strict';

import ListPage from '../../pages/student.list.page';
import Helpers from '../../helpers';
import LoginPage from '../../pages/login.page';
import { browser, protractor } from 'protractor';
import { async } from 'q';

describe('List User - Navigate to Edit Page', () => {
    let listPage = new ListPage();
    let loginPage = new LoginPage();
    const userData = require('../../data/login.json').credentials.userData;

    const deleteMessage = require('../../data/student.json').messages.studentDeleted
    
    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);
        await listPage.open();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });

    beforeEach(async () => {
        browser.refresh();
    })

    it('approve user deletion', async () => {
        await listPage.clickDeleteUser(1);

        await browser.wait(protractor.ExpectedConditions.alertIsPresent(), 10000);
        await browser.switchTo().alert().accept();

        expect(await listPage.countStudent()).toEqual(4);
        expect(await listPage.getToastText()).toContain(deleteMessage);
    });

    it('cancel user deletion', async () => {
        await listPage.clickDeleteUser(1);

        await browser.wait(protractor.ExpectedConditions.alertIsPresent(), 10000);
        await browser.switchTo().alert().dismiss();

        expect(await listPage.countStudent()).toEqual(5);
        expect(await listPage.toast.isPresent()).toBe(false);
    });


});
