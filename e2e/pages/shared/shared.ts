import { browser, by, element, ElementFinder, ElementArrayFinder, protractor } from 'protractor';

// abstract page
// contains shared element accross the application

export default abstract class Shared {

    url: string;
    toast: ElementFinder;
    alerts: ElementArrayFinder;

    constructor(url: string) {
        this.url = url;
        this.toast = element(by.css('.toast-bottom-right'));
        this.alerts = element.all(by.css('.w3-panel.w3-red'));
    };

    navigateTo() {
        return browser.get(this.url);
    };

    getToastText() {
        return browser.wait(
            protractor.ExpectedConditions.visibilityOf(this.toast), 2000
        ).then(() => { return this.toast.getText() });
    };

    getAlerts(i: number) {
        return this.alerts.get(i).getText();
    };

    getAlertNumber() {
        return this.alerts.count();
    };


};

