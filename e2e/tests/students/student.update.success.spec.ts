'use strict';

import { browser } from 'protractor';
import LoginPage from '../../pages/login.page';
import ListPage from '../../pages/student.list.page';

import Helpers from '../../helpers';
import StudentWrite from '../../pages/student.write.page';

describe('Update New User ', () => {
    let loginPage = new LoginPage();
    let listPage = new ListPage();
    const userData = require('../../data/login.json').credentials.userData;
    const studentData = require('../../data/student.json');
    
    const student = studentData.studentsList[0];
    const aStudent = studentData.aStudent.validData;
    const listPageUrl = browser.baseUrl + browser.params.routes.list;
    let studentEditPage = new StudentWrite(student.id - 1);
    
    beforeAll(async () => {
        await loginPage.open();
        await Helpers.setLocalStorage('userData', userData)
    });

    afterAll(async () => {
        await Helpers.clearLocalStorage();
    });


    it('check initial state', async () => {
        await studentEditPage.open();

        expect(await browser.getCurrentUrl()).toContain(studentEditPage.url);
        expect(await studentEditPage.getFirstName()).toEqual(student.first_name);
        expect(await studentEditPage.getLastName()).toEqual(student.last_name);
        expect(await studentEditPage.getEmail()).toEqual(student.email);
        expect(await studentEditPage.getPhone()).toEqual(student.phone);
        expect(await studentEditPage.submitButtonIsEnabled()).toBe(true);
        expect(await studentEditPage.getAlertNumber()).toBe(0);

    });

    it('enter valid user data', async () => {
        // update email mandatory because of the system limitation
        await studentEditPage.setFirstName(aStudent.firstName);
        await studentEditPage.setLastName(aStudent.lastName);
        await studentEditPage.setEmail(aStudent.email);
        await studentEditPage.setPhone(aStudent.phone);
        
        expect(await (studentEditPage.submitButtonIsEnabled())).toBe(true);
        expect(await (studentEditPage.getAlertNumber())).toBe(0);
    });

    it('submit user data successfully', async () => {
        await studentEditPage.submit();

        expect(await browser.getCurrentUrl()).toEqual(listPageUrl);
        expect(await studentEditPage.getToastText()).toContain(studentData.messages.studentUpdate);
    });

    it('check user in List Page', async () => {
        await listPage.isloaded();

        expect(await listPage.countStudent()).toEqual(5);
        expect(await listPage.getFirstName(1)).toEqual(aStudent.firstName);
        expect(await listPage.getLastName(1)).toEqual(aStudent.lastName);
        expect(await listPage.getPhone(1)).toContain(aStudent.phone);
        expect(await listPage.getEmail(1)).toEqual(aStudent.email);

    });

});
