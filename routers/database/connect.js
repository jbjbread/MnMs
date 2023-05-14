const pool = require('./query')

async function connectDB(req, res) {
    let client;
    try {
        client = await pool.connect();
        console.log('데이터베이스 연결 성공')
    } catch (err) {
        console.log(err);
        console.log('데이터베이스 연결오류')
        return
    }
}

module.exports = {connectDB}