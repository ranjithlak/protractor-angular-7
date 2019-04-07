import { browser, by, element, ElementFinder, protractor } from 'protractor';
import SharedPage from './shared/shared';

export default class LoginPage extends SharedPage {

    email: ElementFinder;
    password: ElementFinder;
    loginBtn: ElementFinder;

    constructor() {
        super(browser.params.routes.login);
        this.email = element(by.css("input[formControlName=email]"));
        this.password = element(by.css("input[formControlName=password]"));
        this.loginBtn = element(by.css("button[type='submit']"));
    };

    //    open page and wait until all page elements are visible
    //    tests starts only when page is loaded - reduce false positive
    open() {
        return this.navigateTo().then(() => {
            return browser.wait(protractor.ExpectedConditions.and(
                protractor.ExpectedConditions.visibilityOf(this.email),
                protractor.ExpectedConditions.visibilityOf(this.password),
                protractor.ExpectedConditions.visibilityOf(this.loginBtn),
            ));
        });
    };

    setEmail(email: string) {
        return this.email.clear().then(() => {
            return this.email.sendKeys(email)
        });
    };

    setPassword(password: string) {
        return this.password.clear().then(() => {
            return this.password.sendKeys(password)
        });
    };

    submit() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.loginBtn), 2000
        ).then(() => { return this.loginBtn.click() });
    };

};