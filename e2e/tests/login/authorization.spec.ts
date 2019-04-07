'use strict';

import LoginPage from '../../pages/login.page';
import ListPage from '../../pages/student.list.page';
import Helpers from '../../helpers';
import { browser } from 'protractor';
import StudentDetail from '../../pages/student.details.page';
import StudentWritePage from '../../pages/student.write.page';

describe('Authorization : Login is Mandatory to navigate to all pages', () => {
    let loginPage = new LoginPage();

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.clearLocalStorage();
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });


    it('List User Page requires login', async () => {
        await browser.get(browser.params.routes.list);

        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.login);
    });

    it('Add User Page requires login', async () => {
        await browser.get(browser.params.routes.add);

        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.login);
    });

    it('Edit User Page requires login', async () => {
        await browser.get(browser.params.routes.update + '/0');

        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.login);
    });

    it('Detail User Page requires login', async () => {
        await browser.get(browser.params.routes.detail + '/0');

        expect(await Helpers.getCurrentUrl()).toContain(browser.params.routes.login);
    });

});
