const puppeteer = require('puppeteer');
const fs = require('fs');
var csvWriter = require('csv-write-stream');
var writer = csvWriter({ sendHeaders: false });
const path = require('path');
class BotMetaMask {
    constructor(phraseWords, passWallet) {
        this.browser;
        this.page;
        this.pages;
        this._phraseWords = phraseWords,
            this._passWallet = passWallet
    }
    async start(pathExtMetamask = "D:\\FEXT\\\extension_10_9_3_0", executablePathChrome = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe") {
        this.browser = await puppeteer.launch({
            headless: false,
            // executablePath: executablePathChrome,
            defaultViewport: null,
            args: [
                `--no-sandbox`,
                `--disable-setuid-sandbox`,
                `--disable-extensions-except=${pathExtMetamask}`,
                `--load-extension=${pathExtMetamask}`,
                `--window-size=1000,1000`,
            ]
        });
        this.page = await this.browser.newPage();
    }
    async signinMetaMask() {
        await this.page.goto("chrome-extension://gfcibkpnmenjpdjdagecgboacldppple/home.html#initialize/create-password/import-with-seed-phrase", { waitUntil: 'networkidle2' });
        this.pages = await this.browser.pages();
        this.pages[0].close();
        this.pages[2].close();
        await this.page.type('#app-content > div > div.main-container-wrapper > div > div > form > div.first-time-flow__textarea-wrapper > div.MuiFormControl-root.MuiTextField-root.first-time-flow__textarea.first-time-flow__seedphrase > div > input', this._phraseWords);
        await this.page.type('#password', this._passWallet);
        await this.page.type('#confirm-password', this._passWallet);
        await this.page.click('#app-content > div > div.main-container-wrapper > div > div > form > div.first-time-flow__checkbox-container > div');
        await this.page.click('#app-content > div > div.main-container-wrapper > div > div > form > button');
        await this.page.waitForNavigation();
        await this.page.click('#app-content > div > div.main-container-wrapper > div > div > button');
        await this.page.click('#popover-content > div > div > section > header > div > button');
        console.log("import wallet done");
    }
    async signupMetamask() {
        await this.page.goto("chrome-extension://gfcibkpnmenjpdjdagecgboacldppple/home.html#initialize/create-password", { waitUntil: "networkidle2" });
        this.pages = await this.browser.pages();
        this.pages[0].close();
        this.pages[2].close();
        await this.page.reload({ waitUntil: "networkidle2" });
        await this.page.waitForXPath('//*[@id="create-password"]');
        await this.page.type("#create-password", "123456789");
        await this.page.type("#confirm-password", "123456789");
        await this.page.click("#app-content > div > div.main-container-wrapper > div > div > div:nth-child(2) > form > div.first-time-flow__checkbox-container > div");
        await this.page.click("#app-content > div > div.main-container-wrapper > div > div > div:nth-child(2) > form > button");
        await this.page.waitForXPath('//*[@id="app-content"]/div/div[2]/div/div/div[2]/div/div[1]/div[2]/button');
        await this.page.goto("chrome-extension://gfcibkpnmenjpdjdagecgboacldppple/home.html#initialize/seed-phrase", { waitUntil: "networkidle2" });
        const phraseWords = await this.page.evaluate(() => {
            const textSecret = document.querySelector("#app-content > div > div.main-container-wrapper > div > div > div.reveal-seed-phrase > div.seed-phrase__sections > div.seed-phrase__main > div.reveal-seed-phrase__secret > div.reveal-seed-phrase__secret-words.notranslate.reveal-seed-phrase__secret-words--hidden").textContent;
            return textSecret;
        })
        let phraseWordsArr = phraseWords.split(" ")
        console.log(phraseWords);
        await this.page.goto("chrome-extension://gfcibkpnmenjpdjdagecgboacldppple/home.html#initialize/seed-phrase/confirm", { waitUntil: "networkidle2" });
        await this.page.waitForXPath('//*[@id="app-content"]/div/div[2]/div/div/div[2]/div[4]');
        await this.page.evaluate((phraseWordsArr) => {
            var ItemWorks = [...document.querySelectorAll("#app-content > div > div.main-container-wrapper > div > div > div.confirm-seed-phrase > div.confirm-seed-phrase__sorted-seed-words > div.btn-secondary")];
            phraseWordsArr.forEach(el => {
                ItemWorks.find(element => element.textContent === el).click();
            })
        }, phraseWordsArr)

        await this.page.click("#app-content > div > div.main-container-wrapper > div > div > div.confirm-seed-phrase > button");
        await this.page.waitForXPath('//*[@id="app-content"]/div/div[2]/div/div/button');
        await this.page.click("#app-content > div > div.main-container-wrapper > div > div > button");
        await this.page.click("#popover-content > div > div > section > header > div > button");
        await this.page.click("#app-content > div > div.main-container-wrapper > div > div > div > div.menu-bar > button");
        // wait for popup
        try {
            await this.page.click("#popover-content > div.menu__container.account-options-menu > button:nth-child(2) > span");
        } catch (err) {
            await this.page.click("#app-content > div > div.main-container-wrapper > div > div > div > div.menu-bar > button");
            await this.page.click("#popover-content > div.menu__container.account-options-menu > button:nth-child(2) > span");
        }

        await this.page.waitForXPath('//*[@id="app-content"]/div/span/div[1]/div/div/div/div[3]/div[2]/div/div/div[1]');
        const adrWallet = await this.page.evaluate(() => {
            return document.querySelector("#app-content > div > span > div.modal > div > div > div > div.qr-code > div.qr-code__address-container__tooltip-wrapper > div > div > div.qr-code__address").textContent;
        });
        const csvFilename = path.resolve(__dirname, "../out.csv");
        if (!fs.existsSync(csvFilename)) {
            writer = csvWriter({ sendHeaders: false });
            writer.pipe(fs.createWriteStream(csvFilename));
            writer.write({
                header1: 'Địa chỉ ví',
                header2: 'Chuổi bí mật',
            });
            writer.end();
        }
        writer = csvWriter({ sendHeaders: false });
        writer.pipe(fs.createWriteStream(csvFilename, { flags: 'a' }));
        writer.write({
            header1: adrWallet,
            header2: phraseWords,
        });
        writer.end();
        console.log(adrWallet, phraseWords);
    }
    async addNetWork(networkName = "BSC", newRPCURL = "https://bsc-dataseed.binance.org/", chainID = "56", symbol = "BNB", blockExplorerURL = "https://bscscan.com") {
        await this.page.goto("chrome-extension://gfcibkpnmenjpdjdagecgboacldppple/home.html#settings/networks/add-network", { waitUntil: 'networkidle2' });
        await this.page.type('#app-content > div > div.main-container-wrapper > div > div.settings-page__content > div.settings-page__content__modules > div > div.networks-tab__content > div > div.networks-tab__add-network-form-body > div:nth-child(1) > label > input', networkName);
        await this.page.type('#app-content > div > div.main-container-wrapper > div > div.settings-page__content > div.settings-page__content__modules > div > div.networks-tab__content > div > div.networks-tab__add-network-form-body > div:nth-child(2) > label > input', newRPCURL);
        await this.page.type('#app-content > div > div.main-container-wrapper > div > div.settings-page__content > div.settings-page__content__modules > div > div.networks-tab__content > div > div.networks-tab__add-network-form-body > div:nth-child(3) > label > input', chainID);
        await this.page.type('#app-content > div > div.main-container-wrapper > div > div.settings-page__content > div.settings-page__content__modules > div > div.networks-tab__content > div > div.networks-tab__add-network-form-body > div:nth-child(4) > label > input', symbol);
        await this.page.type('#app-content > div > div.main-container-wrapper > div > div.settings-page__content > div.settings-page__content__modules > div > div.networks-tab__content > div > div.networks-tab__add-network-form-body > div:nth-child(5) > label > input', blockExplorerURL);
        await this.page.click('#app-content > div > div.main-container-wrapper > div > div.settings-page__content > div.settings-page__content__modules > div > div.networks-tab__content > div > div.networks-tab__add-network-form-footer > button.button.btn--rounded.btn-primary')
        console.log(`add ${networkName} network success!!`);
        await this.page.waitFor(1000);
    }
    async gotoGame() {
        await this.page.goto("https://app.bombcrypto.io/", { waitUntil: 'networkidle2' })
    }
    async closeBrowser() {
        await this.browser.close();
        return true;
    }

}
module.exports.BotMetaMask = BotMetaMask;