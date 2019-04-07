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

    abstract isloaded();

    open() {
        return browser.get(this.url).then(() => {
            return this.isloaded();
        });
    };

    // get Toast Text only when text length > 0
    getToastText() {
        return browser.wait(
            protractor.ExpectedConditions.and(
                protractor.ExpectedConditions.visibilityOf(this.toast),
            ), browser.params.timeouts.medium)
            .then(() => {
                return browser.wait(
                    this.toast.getText()
                        .then((v) => {
                            return (v.length > 0 === true)
                        }).then(() => {
                            return this.toast.getText();
                        })
                    , browser.params.timeouts.medium)
            });
    };

    getAlerts(i: number) {
        return this.alerts.get(i).getText();
    };

    getAlertNumber() {
        return this.alerts.count();
    };


};

