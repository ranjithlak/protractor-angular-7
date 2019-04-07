'use strict';
import { browser } from 'protractor';
import StudentDetail from '../../pages/student.details.page';
import LoginPage from '../../pages/login.page';
import Helpers from '../../helpers';

describe('Check Navigations from details Page ', () => {
    let loginPage = new LoginPage();
    const userData = require('../../data/login.json').credentials.userData;
    const chosen = 0;
    const studentDetailPage = new StudentDetail(chosen);

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);

    });

    beforeEach(async () => {
        await studentDetailPage.open();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });

    it('from details to list page', async () => {
        await studentDetailPage.clickBack();
        expect(await Helpers.getCurrentUrl()).toContain(browser.baseUrl + browser.params.routes.list);
    });

    it('navigate from details to list page', async () => {
        await studentDetailPage.clickBack();
        expect(await Helpers.getCurrentUrl()).toContain(browser.baseUrl + browser.params.routes.list);
    });

    it('navigate from details to update page', async () => {
        await studentDetailPage.clickEditUser();
        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.update + '/' + chosen);
    });


});
