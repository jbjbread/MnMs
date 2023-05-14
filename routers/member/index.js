const express = require("express")

const router = express.Router();

const memberController = require('../../controllers/member');

//멤버 생성
router.post('/createMember', memberController.createMember);

//멤버 불러오기
router.get('/getMemberList', memberController.getMemberList);

//멤버 검색 불러오기
router.get('/getMemberListQuery', memberController.getMemberListQuery);

//멤버 필터 불러오기
router.get('/getMemberListFilter', memberController.getMemberListFilter);

//멤버 상세정보 불러오기
router.get('/getMemberInfo', memberController.getMemberInfo);

//멤버 정보 수정하기
router.post('/updateMemberInfo', memberController.updateMemberInfo);

//멤버 삭제하기
router.post('/deleteMember', memberController.deleteMember);

//멤버 메모 수정하기
router.post('/updateMemberMemo', memberController.updateMemberMemo);

//회원 개인 정보 불러오기
router.get('/getMemberMyInfo', memberController.getMemberMyInfo)

module.exports = router;