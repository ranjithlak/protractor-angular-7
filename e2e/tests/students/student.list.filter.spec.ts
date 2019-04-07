'use strict';

import ListPage from '../../pages/student.list.page';
import Helpers from '../../helpers';
import LoginPage from '../../pages/login.page';

describe('List User - Filter Operation ', () => {
    let listPage = new ListPage();
    let loginPage = new LoginPage();
    const userData = require('../../data/login.json').credentials.userData;

    const studentData = require('../../data/student.json');
    const student = studentData.studentsList[1];

    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData);
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });

    // check initial behavior
    it('check number initial load', async () => {
        await listPage.open();
        expect(await listPage.countStudent()).toEqual(5);
    });

    // filter by name
    it('filter by name', async () => {
        await listPage.filterStudent(student.first_name);

        expect(await listPage.countStudent()).toEqual(1);
        expect(await listPage.getFirstName(1)).toEqual(student.first_name);
        expect(await listPage.getLastName(1)).toEqual(student.last_name);
        expect(await listPage.getPhone(1)).toContain(student.phone);
        expect(await listPage.getEmail(1)).toEqual(student.email);

    });

    // filter by unknown user
    it('filter by non existing user', async () => {
        await listPage.filterStudent('someuser');
        expect(await listPage.countStudent()).toEqual(0);
        expect(await listPage.getEmptyGridCardText()).toContain(studentData.warnings.noUser);        
    });


    // filter by last name
    it('filter by last name', async () => {
        await listPage.filterStudent(student.last_name);

        expect(await listPage.countStudent()).toEqual(1);
        expect(await listPage.getFirstName(1)).toEqual(student.first_name);
        expect(await listPage.getLastName(1)).toEqual(student.last_name);
        expect(await listPage.getPhone(1)).toContain(student.phone);
        expect(await listPage.getEmail(1)).toEqual(student.email);
    });
});
