import { browser } from 'protractor';

/*
    Helper Class, it allows : 
    - interaction with local storage (read-write-delete).
    - provide the current Url
*/

export default class Helpers {

    // get value from local storage
    static getLocalStorage(key) {
        return browser.executeScript(`return window.localStorage.getItem("${key}");`);
    };

    // delete an item from the local storage
    static deleteLocalStorageItem(key) {
        return browser.executeScript(`return window.localStorage.removeItem("${key}");`);
    };

    // clear the local storage
    static clearLocalStorage() {
        return browser.executeScript(`return window.localStorage.clear();`);
    };

    // returns the current url
    static getCurrentUrl() {
        return browser.getCurrentUrl();
    };
};