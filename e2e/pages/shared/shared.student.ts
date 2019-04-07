import { browser, by, element, ElementFinder, protractor } from 'protractor';
import Shared from './shared';

/* 
    abstract shared page for students common elements
    it includents :
        - nav bar
        - header
*/

export default abstract class SharedStudent extends Shared {

    sideBarPanel: ElementFinder;
    userListLink: ElementFinder;
    logoutLink: ElementFinder;
    addUserLink: ElementFinder;
    header: ElementFinder;

    constructor(url: string) {
        super(url);
        this.sideBarPanel = element(by.id('mySidebar'));
        this.userListLink = element(by.linkText('User List'));
        this.addUserLink = element(by.linkText('Add new user'));
        this.logoutLink = element(by.linkText('Logout'));
        this.header = element(by.css('.w3-panel.w3-round-small.w3-teal'));
    };

    logout() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.logoutLink), 2000
        ).then(() => { return this.logoutLink.click() });
    };

    clickSideBarUserLink() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.userListLink), 2000
        ).then(() => { return this.userListLink.click() });
    };

    clickSideaddUserLink() {
        return browser.wait(
            protractor.ExpectedConditions.elementToBeClickable(this.addUserLink), 2000
        ).then(() => { return this.addUserLink.click() });
    };

    SideBarIsVisible() {

        return protractor.ExpectedConditions.and(
            protractor.ExpectedConditions.visibilityOf(this.sideBarPanel),
            protractor.ExpectedConditions.visibilityOf(this.logoutLink),
            protractor.ExpectedConditions.visibilityOf(this.userListLink),
            protractor.ExpectedConditions.visibilityOf(this.addUserLink)
        );
    };

    getHeaderTitle() {
        return this.header.getText();
    };
};

