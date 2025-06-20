// 토큰 -> npm i jsonwebtoken 하고 const jwt = require('jsonwebtoken') -> 라우터로 간 상태

const express = require("express");
const userRouter = require("./routers/user.router");
const postRouter = require("./routers/post.router");
const errorHandlingMiddleware = require("./middleware/error-handling-middleware")

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/", [userRouter, postRouter]);

// 오류 처리 미들웨어.. 에러 났을 때 처리 // 에러 나도 서버가 꺼지진 않게됨
//app.use((err, req, res, next) => {
//  if (err.message==="password") {
//    console.error(err.message)
//  }
//
//  res.status(500).send('Something broke!')
//})

// 위 미들웨어를 error-handling-middleware로 보내고, 아래처럼 씀

app.use(errorHandlingMiddleware)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});