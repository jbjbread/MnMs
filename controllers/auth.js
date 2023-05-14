require('dotenv').config();
const axios = require('axios')
const jwt = require('jsonwebtoken');
const send_message = require('../routers/auth/sms');
const create_user_id = require('../routers/users/create_user_id');
const generateAccessToken = require('../routers/auth/jwt_access');
//인증문자 발송
exports.postRandomNumber = async (req, res, next) => {
    //휴대폰 번호
    const phone_num = req.body.phone_num;

    // create random number
    let test_num = Math.random().toString().substring(2, 8)
    // create_at
    var created_at = new Date();
    
    // expired_at
    var expired_at = new Date();
    expired_at.setMinutes(expired_at.getMinutes() + 2); 
    expired_at = new Date(expired_at); 
    //insert to db
    const sql = "INSERT INTO sms_verify (phone_num, verify_num, verified_flag, created_at, expired_at) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const values = [phone_num, test_num, false, created_at, expired_at];
    res.setHeader('Content-Type', 'application/json')

    try {
    	//user 정보를 db에 저장한 후
        pool.connect()
        .then(client => {
            return client.query(sql, values)
            .then(row => {
                client.release()
                const sql1 = 'SELECT user_id FROM users WHERE phone_num = $1'
                const values1 = [phone_num]
                try {
                    pool.connect()
                    .then(client1 => {
                        return client1.query(sql1, values1)
                        .then(row1 => {
                            client1.release()
                            //send_message(test_num, phone_num)
                            if(row1.rows.length === 0) {
                                send_message(test_num, phone_num)
                                console.log(test_num)
                                res.json({status : 200, data : test_num, result : true})
                            } else {
                                res.json({status : 200, data : '', result : false})
                            }
                            console.log('postRandomNumber 호출 성공')
                        }) 
                        .catch(err => {
                            console.log('postRandomNumber 에러 발생', err)
                            res.json({status : 304, desc : err})
                        })
                    })
                } catch (err) {
                    console.log('postRandomNumber 에러 발생', err)
                    res.json({status : 304, desc : err})
                }
            })
            .catch(err => {
                console.log('postRandomNumber 에러 발생', err)
                res.json({status : 304, desc : err})
            })
        })
    }catch(err){
        console.log('postRandomNumber 에러 발생', err)
        res.json({status : 304, desc : err})
    }
}

/**
 * @swagger
 * paths:
 *  /auth/postRandomNumber:
 *   post:
 *    tags:
 *    - Auth
 *    description: 인증번호 문자 발송
 *    content:
 *      application/x-www-form-urlencoded:
 *    parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      schema:
 *       properties:
 *        phone_num:
 *         type: string
 *        
 *         
 *
 *    responses:
 *     202:
 *      description: 인증번호 발송 성공
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *     401:
 *      description: 인증번호 발송 실패
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *
 */

//인증문자 확인
exports.postRandomNumberVerify = async (req, res, next) => {
    //입력한 인증번호
    const input_num = req.body.input_num;
    const phone_num = req.body.phone_num;
    var verify = 0;
    //지금 시간
    const created_at = new Date()
    //인증번호 유효성 검사
    //가장 최근에 발송한 인증번호 가져오기
    const sql = `SELECT "verify_num", "expired_at" FROM sms_verify WHERE phone_num = '${phone_num}' ORDER BY expired_at DESC`;
    //인증 성공시 flag 변경
    const sql1 = `UPDATE "sms_verify" SET "verified_flag" = $1 WHERE "verify_num" = $2`;
    
    try {
        pool.connect()
        .then(client => {
            return client.query(sql)
            .then(row => {
                client.release()
                //정상작동
                var expired_at = new Date(row.rows[0].expired_at)
                var verify_num = row.rows[0].verify_num
                if (created_at < expired_at && input_num === verify_num) {
                    
                    //유효성 검사
                    try {
                        //해당 인증번호 인증완료 업데이트
                        pool.connect()
                        .then(client1 => {
                            return client1.query(sql1, [true, input_num])
                            .then(row1 => {
                                client1.release()
                            })
                            .catch(err => {
                                console.log('postRandomNumberVerify 에러 발생', err)
                                
                                res.json({status : 304, desc : err})
                            })
                        })
                        console.log('일치')
                        res.json({status : 200, verify : 0})
                    } catch (err) {
                        console.log('postRandomNumberVerify 에러 발생', err)
                        res.json({status : 304, desc : err})
                    }
                } else {
                    console.log('불일치')
                    res.json({status : 304, verify : 1})
                }
            })
            .catch(err => {
                console.log('postRandomNumberVerify 에러 발생', err)
                res.json({status : 304, desc : err})
            })
        })
    } catch (err) {
        console.log('postRandomNumberVerify 에러 발생', err)
        res.json({status : 304, desc : err})
    }
}

/**
 * @swagger
 * paths:
 *  /auth/postRandomNumberVerify:
 *   post:
 *    tags:
 *    - Auth
 *    description: 인증번호 문자 유효성 검사
 *    content:
 *      application/x-www-form-urlencoded:
 *    parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      schema:
 *       properties:
 *        phone_num:
 *         type: string
 *        input_num:
 *         type: string
 * 
 *        
 *         
 *
 *    responses:
 *     0:
 *      description: 인증번호 확인 성공
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *     1:
 *      description: 인증번호 확인 실패
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *
 */

//회원가입 최종단계
// exports.postUserInfo = async (req, res) => {
//     const phone_num = req.body.phone_num;
//     const email = req.body.email;
//     const user_type = req.body.user_type;

//     const sql = 'INSERT INTO users (user_id, phone_num, created_at, is_using, user_type, email) VALUES ($1, $2, $3, $4, $5) RETURNING *'
//     const values = [create_user_id(20), phone_num, new Date(), true, user_type, email]

//     try {
//         pool.connect()
//         .then(client => {
//             return client.query(sql, values)
//             .then(row => {
//                 client.release()
//                 res.json({status : 200, data : '저장 성공'})
//             })
//             .catch(err => {
//                 console.log('postUserInfo 호출성공')
//                 res.json({status : 304, desc : err})
//             })
//         })
//     } catch (err) {
//         console.log('postUserInfo 호출성공')
//         res.json({status : 304, desc : err})
//     }
// }

/**
 * @swagger
 * paths:
 *  /auth/postRandomNumberVerify:
 *   post:
 *    tags:
 *    - Auth
 *    description: 인증번호 문자 유효성 검사
 *    content:
 *      application/x-www-form-urlencoded:
 *    parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      schema:
 *       properties:
 *        phone_num:
 *         type: string
 *        input_num:
 *         type: string
 * 
 *        
 *         
 *
 *    responses:
 *     0:
 *      description: 인증번호 확인 성공
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *     1:
 *      description: 인증번호 확인 실패
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *
 */