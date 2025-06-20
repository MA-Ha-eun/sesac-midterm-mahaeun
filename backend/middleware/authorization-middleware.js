const prisma = require("../utils/prisma/index");

exports.checkPostOwner = async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user;

  // userId랑 post의 동일한지 확인
  const post = await prisma.post.findUnique({
    where : { postId: +postId }
  })

  if (!post) {
    return next(new Error("PostNotFound"))
  }
  if (post.userId !== userId) {
    return next(new Error("Forbidden"))
  }
  
  res.locals.post = post;
  next();
}