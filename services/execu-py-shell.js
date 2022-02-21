let { PythonShell } = require('python-shell');
// control BoomCrypto
class ExecuPy {
    async startGame() {
        return await new Promise((resolve, reject) => {
            PythonShell.run('core-boom/click-accept.py', {}, function (err, result) {
                if (err) {
                    throw err
                }
                resolve({ res: result, status: 1 });
                console.log(`Accept: ${result}`);
            })
        });
    }
}
module.exports.ExecuPy = ExecuPy;