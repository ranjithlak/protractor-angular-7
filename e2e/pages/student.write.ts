import { browser, by, element, ElementFinder, protractor } from 'protractor';
import SharedStudent from './shared/shared.student';

export default class StudentWrite extends SharedStudent {

    firstName: ElementFinder;
    lastName: ElementFinder;
    email: ElementFinder;
    phone: ElementFinder;
    backButton: ElementFinder;
    submitButton: ElementFinder;

    constructor(id?: string) {
        const url = (id === undefined ? browser.params.routes.add : browser.params.routes.update + '/' + id);
        super(url);
        this.firstName = element(by.css("input[formControlName=first_name]"));
        this.lastName = element(by.css("input[formControlName=last_name]"));
        this.email = element(by.css("input[formControlName=email]"));
        this.phone = element(by.css("input[formControlName=phone]"));
        this.submitButton = element(by.css("button[type='submit']"));
        this.backButton = element(by.css('.w3-button.w3-green.custom-button.margin-right'));
    };

    // make sure that page is opened before manipulating it.
    open() {
        return this.navigateTo().then(() => {
            return browser.wait(protractor.ExpectedConditions.and(
                protractor.ExpectedConditions.visibilityOf(this.firstName),
                protractor.ExpectedConditions.visibilityOf(this.lastName),
                protractor.ExpectedConditions.visibilityOf(this.email),
                protractor.ExpectedConditions.visibilityOf(this.phone),
                protractor.ExpectedConditions.visibilityOf(this.submitButton),
                this.SideBarIsVisible()
            ), 5000);
        });
    };

    submitButtonIsEnabled() {
        return this.submitButton.isEnabled();
    };

    submit() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.submitButton), 2000
        ).then(() => { return this.submitButton.click() });
    };

    getFirstName() {
        return this.firstName.getAttribute('value');
    };

    getLastName() {
        return this.lastName.getAttribute('value');
    };

    getPhone() {
        return this.phone.getAttribute('value');
    };

    getEmail() {
        return this.email.getAttribute('value');
    };

    setFirstName(firstName) {
        return this.firstName.clear().then(() => {
            return this.firstName.sendKeys(firstName)
        });
    };

    setLastName(lastName) {
        return this.lastName.clear().then(() => {
            return this.lastName.sendKeys(lastName)
        });
    };

    setEmail(email) {
        return this.email.clear().then(() => {
            return this.email.sendKeys(email)
        });
    };

    setPhone(phone) {
        return this.phone.clear().then(() => {
            return this.phone.sendKeys(phone)
        });
    };

    clickBack() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.backButton), 2000
        ).then(() => { return this.backButton.click() });
    };
};

