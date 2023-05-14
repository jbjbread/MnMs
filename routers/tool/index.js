const express = require("express")

const router = express.Router();

const toolController = require('../../controllers/tool');

//쿼리별 툴 불러오기
router.get('/getToolQuery', toolController.getToolQuery);

//홈 툴 불러오기
router.get('/getToolHome', toolController.getToolHome)



module.exports = router;