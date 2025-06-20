// validator


const { body, validationResult } = require('express-validator');
//const { param } = require('../routers/post.router');
const { param } = require('express-validator');

// 회원가입
exports.signUpValidator = [
  body('email')
    .isEmail().withMessage('이메일 형식이 아닙니다.')
    .notEmpty().withMessage('이메일이 없습니다.'),
  body('password')
    //.isLength({min : 6}).withMessage('비밀번호가 6자 이하')
    .notEmpty().withMessage('비밀번호가 없습니다.'),
  body('username')
    .notEmpty().withMessage('이름이 없습니다.'),
];

// 로그인 입력 검사
exports.loginValidator = [
  body('email')
    .isEmail().withMessage('이메일 형식이 아닙니다.')
    .notEmpty().withMessage('이메일이 없습니다.'),
  body('password')
    //.isLength({min : 6}).withMessage('비밀번호가 6자 이하')
    .notEmpty().withMessage('비밀번호가 없습니다.'),
];

// 게시글 작성 관련
exports.postsValidator = [
  body('title')
    .notEmpty().withMessage('타이틀이 없습니다.'),
  body('content')
    .notEmpty().withMessage('컨텐츠가 없습니다.'),
];

// 
exports.getPostsValidator = [
  param('postId')
  .isInt().withMessage("id가 숫자여야 함")
  .notEmpty().withMessage('postId가 필요합니다.'),
];

//
exports.putPostsValidator = [
  body('title')
    .notEmpty().withMessage('타이틀이 없습니다.'),
  body('content')
    .notEmpty().withMessage('컨텐츠가 없습니다.'),
];

//
exports.deletePostsValidator = [
  param('postId').isInt().withMessage('postId는 정수여야 합니다.')
];

exports.handleValidationResult = (req, res, next) => {
  const result = validationResult(req).errors;
  if (result.length !== 0) {
    // 입력 오류가 있는 경우
    const extracteError = result.map(err => err.msg)
    return next(new Error("InputValidation"))
  }
  next();
};