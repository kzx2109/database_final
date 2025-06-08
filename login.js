const departments = [];
const students = [];
const courses = [];
const enrollments = [];
let currentUser = null;

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const roleStr = document.getElementById("role").value;
  const role = roleStr === "admin" ? 0 : 1;

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("登入成功！");
      window.location.href =
        role === 0
          ? "admin.html?username=" + encodeURIComponent(username)
          : "students.html?username=" + encodeURIComponent(username);
    } else {
      alert("登入失敗：" + data.message);
    }
  } catch (err) {
    console.error("登入請求錯誤", err);
    alert("伺服器無回應！");
  }
}
