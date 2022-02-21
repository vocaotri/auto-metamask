require('dotenv').config()
const { BotMetaMask } = require('./services/bot-metamask');
const { ExecuPy } = require('./services/execu-py-shell');
const path = require('path');
async function init() {
    const pathsExt = path.resolve(__dirname, "resource/exts/metamask_10_9_3_0");
    const botMetaMask = new BotMetaMask(process.env.PHRASE_WORDS, process.env.PASS_WALLET);
    // const execuPy = new ExecuPy();
    await botMetaMask.start(pathsExt);
    await botMetaMask.signupMetamask();
    // await botMetaMask.signinMetaMask();
    // await botMetaMask.addNetWork();
    // await botMetaMask.gotoGame();
    // await execuPy.startGame();
    const checkEndBot = await botMetaMask.closeBrowser();
    if (checkEndBot) {
        init();
    }
}
init()