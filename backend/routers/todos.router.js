const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const SECRET_KEY = "sessac"
const authenticateToken = require("../middleware/authenticate-middleware")

const prisma = require('../utils/prisma/index.js');

const { body, validationResult } = require('express-validator')

const { postsValidator, getPostsValidator, putPostsValidator, deletePostsValidator, handleValidationResult } = require("../middleware/validation-result-handler.js")

const { checkPostOwner } = require("../middleware/authorization-middleware.js")

//const PostController = require("../controllers/posts.controller.js")

// 전체 게시글 조회 -> 누구나 조회 ㄱㄴ & 작성자 정보도 같이 보내기 -> 조인 써서

router.get('/posts', async (req, res, next) => {
  const posts = await prisma.post.findMany({
    include : { // 이게 조인?같은?
      User : {
        select : {
          userId : true, // 이거 true로 하면 가져오란 뜻
          nickname : true
        }
      }
    },
    orderBy: { // 생략 시 디폴트값이 asc로 나옴
      createdAt: "desc"
    },
  });
  return res.status(200).json({ data: posts });
});

// 특정 게시글 조회 -> 누구나 조회 ㄱㄴ
router.get('/posts/:postId', getPostsValidator, handleValidationResult, async (req, res, next) => {
  const { postId } = req.params;
  const post = await prisma.post.findUnique({
    where : { postId: +postId }, // +는 형변환하려고. parseInt 대신 이게 더 편해서
    include : {
      User : {
        select : {
        userId : true,
        nickname : true
        }
      }  
    }
  })
  if (!post) {
    //return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    return next(new Error("PostNotFound"));
  }
  return res.status(200).json(post);
});

// 게시글 작성 -> 로그인된 사람만! -> 토큰으로!!!
router.post('/posts', authenticateToken, postsValidator, handleValidationResult, async (req, res, next) => {
  const { title, content} = req.body;
  const userId = req.user;
  const newPost = await prisma.post.create({
    data: {
      userId,
      title,
      content
    },
  });
  return res.status(201).json({ message: '게시글이 저장되었습니다.', data: newPost });
});

// 게시글 수정 (작성자만 ㄱㄴ)
router.put('/posts/:postId', authenticateToken, putPostsValidator, handleValidationResult, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  //const existingPost = await prisma.post.findUnique({
  //  where: { postId: +postId },
  //});

  //if (!existingPost) {
  //  //return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  //  return next(new Error("PostNotFound"));
  //}

  const updatedPost = await prisma.post.update({
    where: { postId: +postId },
    data: {
      title,
      content
    }
  });

  return res.status(200).json({ message: '게시글이 수정되었습니다.', data: updatedPost });
});

// 게시글 삭제 (작성자만 ㄱㄴ)
router.delete('/posts/:postId', authenticateToken, deletePostsValidator, handleValidationResult, checkPostOwner, async (req, res, next) => {
  const { postId } = req.params;

  //const existingPost = await prisma.post.findUnique({
  //  where: { postId: +postId },
  //});
  //
  //if (!existingPost) {
  //  //return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  //  return next(new Error("PostNotFound"));
  //}

  await prisma.post.delete({
    where: { postId: +postId },
  });

  return res.status(200).json({ message: "게시글이 삭제되었습니다." });
});

module.exports = router;