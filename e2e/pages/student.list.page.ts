import { browser, by, element, ElementFinder, protractor, ElementArrayFinder } from 'protractor';
import SharedStudent from './shared/shared.student';

export default class StudentList extends SharedStudent {

    filter: ElementFinder;
    addNewStudentButton: ElementFinder;
    grid: ElementArrayFinder;
    emptyGridCard: ElementFinder;

    constructor() {
        super(browser.params.routes.list);
        this.filter = element(by.css("input[type='text']"));
        this.addNewStudentButton = element(by.css('.w3-button.w3-green.custom-button'));
        this.grid = element.all(by.css('.w3-table.w3-striped.w3-bordered tr'));
        this.emptyGridCard = element(by.css('.w3-panel.w3-green'));
    };

    // make sure page is loaded before manupulating its element

    isloaded() {
        return browser.wait(protractor.ExpectedConditions.and(
            protractor.ExpectedConditions.visibilityOf(this.filter),
            protractor.ExpectedConditions.visibilityOf(this.addNewStudentButton),
            protractor.ExpectedConditions.visibilityOf(this.grid.first()),
            this.SideBarIsVisible()
        ), 5000)
    };

    filterStudent(s: string) {
        return this.filter.clear().then(() => {
            return this.filter.sendKeys(s)
        });
    };

    clickAddNewUserButton() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.addNewStudentButton), 2000
        ).then(() => { return this.addNewStudentButton.click() });
    };

    private getRow(i: number) {
        return this.grid.get(i).all(by.css('td'));
    };

    // row(0) is the header, so if 0 set 1
    getFirstName(i: number) {
        if (i === 0) i = 1;
        return this.getRow(i).get(1).getText();
    };
    // row(0) is the header, so if 0 set 1
    getLastName(i: number) {
        if (i === 0) i = 1;
        return this.getRow(i).get(2).getText();
    };
    // row(0) is the header, so if 0 set 1
    getPhone(i: number) {
        if (i === 0) i = 1;
        return this.getRow(i).get(4).getText();
    };
    // row(0) is the header, so if 0 set 1
    getEmail(i: number) {
        if (i === 0) i = 1;
        return this.getRow(i).get(3).getText();
    };
    // row(0) is the header, so if 0 set 1
    clickUpdateStudent(i: number) {
        if (i === 0) i = 1;
        let btn = this.getRow(i).get(5);
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(btn), 2000
        ).then(() => { return btn.click() });
    };
    // row(0) is the header, so if 0 set 1
    clickDeleteUser(i: number) {
        if (i === 0) i = 1;
        let btn = this.getRow(i).get(6);
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(btn), 2000
        ).then(() => { return btn.click() });
    };

    getEmptyGridCardText() {
        return this.emptyGridCard.getText();
    };

    countStudent() {
        return this.grid.count().then((count) => {
            if (count <= 0) return count;
            else return count - 1;
        });
    };

};