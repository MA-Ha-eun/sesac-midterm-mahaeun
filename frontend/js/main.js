import users from './data.js'

ocument.getElementById('saveBtn').addEventListener('click', function () {
  localStorage.setItem("test", "테스트 값입니다");
  document.getElementById('result').textContent = "저장 완료!";
});

document.getElementById('loginBtn').addEventListener('click', function () {
  const value = localStorage.getItem("currentUser");
    if (value) {
      localStorage.setItem("사용자 정보", value);
      //document.getElementById('result').textContent = `저장된 값: ${value}`;
    } else {

      //document.getElementById('result').textContent = "저장된 값이 없습니다.";
    }
});