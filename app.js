const departments = [];
const students = [];
const courses = [];
const enrollments = [];
let currentUser = null;

// 管理員頁面用函式
function initAdmin() {
  currentUser = { name: getQueryParam("username"), role: "admin" };
  refreshDepartments();
  refreshStudents();
  refreshCourses();
}

function addDepartment() {
  const name = document.getElementById("deptName").value;
  if (name) {
    departments.push({ id: Date.now(), name });
    refreshDepartments();
  }
}

// function refreshDepartments() {
//   const list = document.getElementById("departments");
//   const select = document.getElementById("studentDept");
//   list.innerHTML = "";
//   select.innerHTML = "";
//   departments.forEach((dept) => {
//     list.innerHTML += `<li>${dept.name}</li>`;
//     select.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
//   });
// }

function addStudent() {
  const name = document.getElementById("studentName").value;
  const deptId = document.getElementById("studentDept").value;
  students.push({ id: Date.now(), name, deptId });
  refreshStudents();
}

function refreshStudents() {
  const list = document.getElementById("students");
  list.innerHTML = "";
  students.forEach((stu) => {
    const dept = departments.find((d) => d.id == stu.deptId);
    list.innerHTML += `<li>${stu.name} (${dept?.name})</li>`;
  });
}

function addCourse() {
  const name = document.getElementById("courseName").value;
  const credit = document.getElementById("courseCredit").value;
  courses.push({ id: Date.now(), name, credit, enrolled: 0 });
  refreshCourses();
}

function refreshCourses() {
  const list = document.getElementById("courses");
  list.innerHTML = "";
  courses.forEach((c) => {
    list.innerHTML += `<li>${c.name} - ${c.credit} 學分（${c.enrolled}人修課）</li>`;
  });
}

// 學生頁面用函式
function initStudent() {
  const username = getQueryParam("username");
  currentUser = { name: username, role: "student" };
  document.getElementById("selfName").value = username;
  refreshStudentCourses();
}

function updateSelfData() {
  const name = document.getElementById("selfName").value;
  currentUser.name = name;
  alert("修改成功");
}

function refreshStudentCourses() {
  const list = document.getElementById("myCourses");
  list.innerHTML = "<li>尚未選課（僅提供展示）</li>";
}

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
