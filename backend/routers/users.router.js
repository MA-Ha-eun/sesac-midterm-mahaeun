const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

const SECRET_KEY = "sessac"

const authenticateToken = require("../middleware/authenticate-middleware")

//const { signUp } = require("../controllers/auth.controller.js")
const AuthController = require("../controllers/auth.controller.js")

// 데이터베이스 연동.. (6/13 수업)
const prisma = require('../utils/prisma/index.js')

// 이 검증 더 간단하게.. express-validator 설치(npm i express-validator)
const { body, validationResult } = require('express-validator')

// 비번 암호화
const bcrypt = require('bcrypt')

//회원가입
/*
router.post('/sign-up', async (req, res, next) => {
  const { email, password, nickname } = req.body;

  // 1. 검증 세 개 다 왔는지
  if (!email || !password || !nickname) {
    return next(new Error("InputValidation"));
  }

  // 2번 검증
  if (password.length < 6) {
    return next(new Error("PasswordValidation"));
  }

  // 3번 검증 -> 데이터베이스 확인.. 가져와야겠지 하고 try catch 사용
  try {
  const user = await prisma.users.findFirst({
    where : { email }
  })

  if (user) {
    return next(new Error("ExistEmail"));
  }

  // 4. 데이터베이스에 저장
  await prisma.users.create({
    data : {
      email, // 원래는 email: email 이 모양인데 변수명 같으면 이렇게 써도 됨
      password,
      nickname
    }
  })
  return res.status(201).json({
    message : "회원가입이 성공적으로 완료되었습니다."
  });
  } catch(e) {
    return next(new Error(DataBaseError));
  }
})
*/

// 미들웨어로 따로 빼서 관리

const { signUpValidator, handleValidationResult, loginValidator } = require('../middleware/validation-result-handler.js')

/* 미들웨어로
// 1번 2번
const signUpValidator = [
  body('email')
    .isEmail().withMessage('이메일 형식이 아닙니다.')
    .notEmpty().withMessage('이메일이 없습니다.'),
  body('password')
    .isLength({min : 6}).withMessage('비밀번호가 6자 이하')
    .notEmpty().withMessage('비밀번호가 없습니다.'),
  body('nickname')
    .notEmpty().withMessage('닉네임이 없습니다.'),
]
*/

//router.post('/auth/signup', signUpValidator, handleValidationResult, AuthController.signUp)

router.post('/sign-up', signUpValidator, handleValidationResult, async (req, res, next) => {
  const { email, password, username } = req.body;

  // 3번
  try {
    const user = await prisma.users.findFirst({
      where: { email }
    })
    if (user) {
      return next(new Error("ExistEmail"));
    }
  
  // 4번
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const bcryptPassword = await bcrypt.hash(
    password,
    salt
  )

  console.log(bcryptPassword)
  
  const newUser = await prisma.users.create({
    data: {
      email,
      password: bcryptPassword, // 암호화한 비번 들어가게 됨
      username
    }
  })

    return res.status(201).json({
      message: 'Created',
      data: newUser
    });
  } catch (e) {
    console.log(e)
    return next(new Error("DataBaseError"));
  }
})



/* 로그인 API
1. 이메일, 비번 입력 여부 확인
2. 이메일에 해당하는 사용자 찾기
3. 사용자 존재 여부
4. 비밀번호 일치 여부 확인
5. JWT 토큰 발급
6. 생성된 데이터를 전달
*/
//router.post('/auth/login', loginValidator, handleValidationResult, AuthController.login)

router.post('/auth/login', loginValidator, handleValidationResult, async (req, res, next) => {

  /* 이것도 validator로
  const user = {
    id: 1,
    username: "홍길동",
    role: "user"
  }
  const token = jwt.sign(user, SECRET_KEY, {
    expiresIn: '5s' // 유효시간
  })
  console.log(token)
  
  return res.json({
    token
  })
  */
  
  const { email, password } = req.body;
  console.log(email, password) // 2번까지 완료

  const user = await prisma.users.findFirst({
    where: {email}
  })
  if (!user) { // 유저가 없는 경우
    return next(new Error("UserNotFound"))
  }

  // 비번?
  const verifyPassword = await bcrypt.compare(password, user.password)

  if (!verifyPassword) {
    return next(new Error("PasswordError"))
  }
  
  //if (password !== user.password) {
  //  return next(new Error("PasswordError"))
  //} 암호화해서..

  const token = jwt.sign({
    userId: user.userId
  }, SECRET_KEY, {
    expiresIn: '12h'
  })
  console.log(token)
  
  return res.json({
    token
  })
})


// 토큰 검증
router.get('/user', authenticateToken, (req, res, next) => { //authenticateToken(req, res) 이걸 위로 올린 거 소괄호 안에.. 미리 검증? 미들웨어에 맡긴다
  console.log(req.user)

  // 비밀번호가 다르다 조건!
  //next(new Error("password")); // 강제로 에러 발생시킨 것

})

//function authenticateToken(req, res, next) {
//  const authHeader = req.headers['authorization'];
//  const token = authHeader && authHeader.split(' ')[1]; // Bearer 빼고 출력하려고
//  const user = jwt.verify(token, SECRET_KEY); // 검증하는법..
//  req.user = user;
//  next(); // 미들웨어에서 넥스트함수 만나면 다음으로 넘어가란 소리 즉 authenticateToken 다음인 (req, res, next)로 넘어감 // 파라미터에 next 추가..
//
//  //console.log(authHeader)
//  //console.log(token)
//
//  //console.log(user)
//}
// -> 이것도 미들웨어로..

module.exports = router;