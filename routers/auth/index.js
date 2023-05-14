const express = require("express")

const router = express.Router();

const authController = require('../../controllers/auth');

//인증문자 발송
router.post('/postRandomNumber', authController.postRandomNumber);
//인증번호 유효성 검사
router.post('/postRandomNumberVerify', authController.postRandomNumberVerify);

//
router.post('/postUserInfo', authController.postUserInfo)


module.exports = router;