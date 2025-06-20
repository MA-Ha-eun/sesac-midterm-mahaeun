// 에러 처리만 하는 파일 분리한 것. 따로 모아서 관리하려고


module.exports = function (err, req, res, next) {
  console.error("🔥 에러 메시지:", err.message);
  console.error("🔥 에러 스택:", err.stack);

  switch(err.message){
    case "InputValidation" :
    case "PasswordValidation": // 이렇게 묶을 수도
      return res.status(409).send({
      errorMessage : "Conflict"
    })

    case "ExistEmail" : return res.status(409).send({
      errorMessage : "Conflict"
    })

    //case "DataBaseError" : return res.status(500).send({
    //  errorMessage : "데이터베이스에 오류가 있습니다."
    //}) 아래 default로

    case "PasswordError" : return res.status(401).send({
      errorMessage : "Unauthorized"
    })

    case "Forbidden" : return res.status(401).send({
      errorMessage : "접근 권한이 없습니다."
    })

    case 'UserNotFound': return res.status(404).send({ // 찾는 값 없을 땐 다 404
      errorMessage : "해당 유저가 없습니다."
    })

    // 나머지들.. 묶어놓기
    case 'Need login':
    case 'accessTokenNotMatched':
      res.status(401).send({
      errorMessage : "로그인을 해주세요."
      });
    
    case 'PostNotFound' : return res.status(404).send({
      errorMessage : "게시글을 찾을 수 없습니다."
    })

    //case 'Need userId' : return res.status(404).send({
    //  errorMessage : "userId를 입력해 주세요."
    //})

    // else.. 다 서버 오류
    default: return res.status(500).send({
      errorMessage : "서버에 오류가 있습니다."
    })

  }
}