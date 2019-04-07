import { browser, by, element, ElementFinder, protractor, ElementArrayFinder } from 'protractor';
import SharedStudent from './shared/shared.student';

// studentDetail Page abstract Shared Student

export default class StudentDetail extends SharedStudent {

    id: number;
    url: string;

    editButton: ElementFinder;
    backButton: ElementFinder;
    userCardDetails: ElementFinder;

    firstName: ElementFinder;
    lastName: ElementFinder;
    email: ElementFinder;
    phone: ElementFinder;
    cardTitle: ElementFinder;

    private grid: ElementArrayFinder = element.all(by.css('.w3-table.w3-bordered tr'));

    // Student Details Page is defined by the user id
    constructor(id: number) {
        super(browser.params.routes.detail + '/' + id);
        this.id = id;
        this.editButton = element(by.css('.w3-button.w3-blue.custom-button'));
        this.backButton = element(by.css('.w3-button.w3-green.custom-button.margin-right'));
        this.userCardDetails = element(by.css('.w3-card.custom-card'));

        this.cardTitle = element(by.css('.text-center'))

        this.firstName = this.grid.get(0).all(by.css('td b')).get(0);
        this.lastName = this.grid.get(1).all(by.css('td b')).get(0);
        this.email = this.grid.get(2).all(by.css('td b')).get(0);
        this.phone = this.grid.get(3).all(by.css('td b')).get(0);
    };

    // make sure elements are visible before manipulating the web elements.
    isloaded() {
        return browser.wait(protractor.ExpectedConditions.and(
            protractor.ExpectedConditions.visibilityOf(this.editButton),
            protractor.ExpectedConditions.visibilityOf(this.userCardDetails),
            protractor.ExpectedConditions.visibilityOf(this.userCardDetails),
            this.SideBarIsVisible()
        ), 5000);
    };

    clickEditUser() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.editButton), 2000
        ).then(() => { return this.editButton.click() });
    };

    clickBack() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.backButton), 2000
        ).then(() => { return this.backButton.click() });
    };

    getFirstName() {
        return this.firstName.getText();
    };

    getLastName() {
        return this.lastName.getText();
    };

    getPhone() {
        return this.phone.getText();
    };

    getEmail() {
        return this.email.getText();
    };

    getStudentCardTitle() {
        return this.cardTitle.getText();
    };
};