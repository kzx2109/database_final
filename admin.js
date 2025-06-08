const departments = [];
const students = [];
let editingStudentId = null;
const departSelction = [];

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

document.getElementById("showDepartmentsBtn").addEventListener("click", () => {
  // 隱藏其他區塊
  document.getElementById("studentSection").style.display = "none";
  // document.getElementById("courseSection").style.display = "none";

  // 顯示科系管理區塊
  document.getElementById("departmentSection").style.display = "block";

  // 重新載入科系資料
  refreshDepartments();
});

document.getElementById("showStudentsBtn").addEventListener("click", () => {
  document.getElementById("departmentSection").style.display = "none";
  // document.getElementById("courseSection").style.display = "none";
  document.getElementById("studentSection").style.display = "block";
  refreshStudent();
  loadDepartmentsForStudentForm();
});

//Departments
async function refreshDepartments() {
  const table = document.getElementById("departmentsTable");
  const select = document.getElementById("studentDept");

  fetch("http://localhost:3000/department")
    .then((res) => {
      if (!res.ok) throw new Error("無法載入科系資料");
      return res.json();
    })
    .then((data) => {
      //   console.log(data);

      // 清空表格與下拉選單
      table.innerHTML = "";
      // select.innerHTML = "";

      // 更新全域資料
      departments.length = 0; // 清空原始資料
      data.forEach((dept) => departments.push(dept));

      // 動態產生表格內容與下拉選單
      departments.forEach((dept) => {
        table.innerHTML += `
    <tr id="dept-row-${dept.departments_Id}">
      <td id="dept-name-${dept.departments_Id}">${dept.department_name}</td>
      <td id="dept-action-${dept.departments_Id}">
        <button onclick="editDepartment(${dept.departments_Id}, '${dept.department_name}')">修改</button>
        <button onclick="deleteDepartment(${dept.departments_Id})">刪除</button>
      </td>
    </tr>
  `;
        // select.innerHTML += `<option value="${dept.departments_Id}">${dept.department_name}</option>`;
      });
    })
    .catch((err) => {
      console.error(err);
      alert("讀取科系資料失敗");
    });
}

//新增科系
function addDept() {
  const name = document.getElementById("deptName").value.trim();
  if (!name) return alert("請輸入科系名稱");

  fetch("http://localhost:3000/department", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ department_name: name }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("新增科系失敗");
      return res.json();
    })
    .then((data) => {
      console.log("新增成功：", data);
      document.getElementById("deptName").value = "";
      refreshDepartments(); // 重新渲染科系表格
    })
    .catch((err) => {
      console.error("錯誤：", err);
      alert("新增科系時發生錯誤：" + err.message);
    });
}
function loadDepartmentsForStudentForm() {
  fetch("http://localhost:3000/department")
    .then((res) => res.json())
    .then((data) => {
      // 清空並儲存至全域變數
      departSelction.length = 0;
      data.forEach((d) => departSelction.push(d));

      // 更新下拉選單
      const select = document.getElementById("s_deptId");
      select.innerHTML = `<option value="">請選擇科系</option>`;
      departSelction.forEach((dept) => {
        select.innerHTML += `<option value="${dept.departments_Id}">${dept.department_name}</option>`;
      });
    })
    .catch((err) => {
      console.error("載入科系選單失敗", err);
    });
}

function editDepartment(id, currentName) {
  const nameCell = document.getElementById(`dept-name-${id}`);
  const actionCell = document.getElementById(`dept-action-${id}`);

  // 先檢查是否已經是編輯狀態，避免重複切換
  if (nameCell.querySelector("input")) return;

  // 將名稱換成 input 框，預設值是現有名稱
  nameCell.innerHTML = `<input type="text" id="edit-input-${id}" value="${currentName}" />`;

  // 按鈕變成「確定」，點擊後送出修改
  actionCell.innerHTML = `
    <button onclick="confirmEditDepartment(${id})">確定</button>
    <button onclick="cancelEditDepartment(${id}, '${currentName}')">取消</button>
  `;
}

function cancelEditDepartment(id, oldName) {
  const nameCell = document.getElementById(`dept-name-${id}`);
  const actionCell = document.getElementById(`dept-action-${id}`);

  // 回復原本顯示
  nameCell.textContent = oldName;
  actionCell.innerHTML = `
    <button onclick="editDepartment(${id}, '${oldName}')">修改</button>
    <button onclick="deleteDepartment(${id})">刪除</button>
  `;
}
function confirmEditDepartment(id) {
  const input = document.getElementById(`edit-input-${id}`);
  const newName = input.value.trim();
  if (!newName) {
    alert("科系名稱不能為空");
    return;
  }

  fetch(`http://localhost:3000/department/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ department_name: newName }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("更新失敗");
      return res.json();
    })
    .then((data) => {
      alert(data.message);
      refreshDepartments();
    })
    .catch((err) => {
      alert(err.message);
    });
}
function deleteDepartment(id) {
  if (!confirm("確定要刪除嗎？")) return;

  fetch(`http://localhost:3000/department/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("刪除失敗");
      return res.json();
    })
    .then((data) => {
      alert(data.message || "刪除成功");
      refreshDepartments(); // 刪除後重新載入列表
    })
    .catch((err) => {
      console.error(err);
      alert("刪除失敗：" + err.message);
    });
}

//學生資料
async function refreshStudent() {
  const table = document.getElementById("studentsTable");

  fetch("http://localhost:3000/student")
    .then((res) => {
      if (!res.ok) throw new Error("無法載入科系資料");
      return res.json();
    })
    .then((data) => {
      console.log(data);

      // 清空表格與下拉選單
      table.innerHTML = "";
      //   select.innerHTML = "";

      // 更新全域資料
      students.length = 0; // 清空原始資料
      data.forEach((stud) => students.push(stud));

      // 動態產生表格內容
      students.forEach((stud) => {
        datt = stud.birth_date.split("T")[0];
        table.innerHTML += `
          <tr id="stud-row-${stud.student_Id}">
          <td >${stud.student_Id}</td>
            <td >${stud.name}</td>
            <td >${stud.gender}</td>
            <td >${datt}</td>
            <td >${stud.phone}</td>
            <td >${stud.email}</td>
            <td>${stud.address}</td>
            <td >${stud.department_name}</td>
            <td id="stud-action-${stud.student_Id}">
              <button onclick="renderStudentEdit('${stud.student_Id}')">修改</button>
              <button onclick="deleteStudent('${stud.student_Id}')">刪除</button>
            </td>
          </tr>
        `;
        // select.innerHTML += `<option value="${stud.departments_Id}">${stud.department_name}</option>`;
      });
    })
    .catch((err) => {
      console.error(err);
      alert("讀取科系資料失敗");
    });
}

//新增學生
function addStudent() {
  const student_Id = document.getElementById("s_Id").value.trim();
  const name = document.getElementById("s_name").value.trim();
  const gender = document.getElementById("s_gender").value.trim();
  const birth = document.getElementById("s_birth").value.trim();
  const phone = document.getElementById("s_phone").value.trim();
  const email = document.getElementById("s_mail").value.trim();
  const address = document.getElementById("s_address").value.trim();
  const deptId = document.getElementById("s_deptId").value;
  console.log(name, gender, birth, phone, email, phone, address, deptId);
  if (
    !name ||
    !gender ||
    !birth ||
    !phone ||
    !email ||
    !address ||
    !deptId ||
    !student_Id
  ) {
    return alert("請填寫所有欄位");
  }

  fetch("http://localhost:3000/addstudent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      student_Id: student_Id,
      name: name,
      gender: gender,
      birth_date: birth,
      phone: phone,
      email: email,
      address: address,
      department_Id: parseInt(deptId),
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("新增學生失敗");
      return res.json();
    })
    .then((data) => {
      alert("新增學生成功！");
      refreshStudent();
      // 清空欄位
      document.getElementById("s_name").value = "";
      document.getElementById("s_gender").value = "";
      document.getElementById("s_birth").value = "";
      document.getElementById("s_phone").value = "";
      document.getElementById("s_mail").value = "";
      document.getElementById("s_address").value = "";
      document.getElementById("s_deptId").value = "";

      // 若有學生列表，這邊也可以 refreshStudent();
    })
    .catch((err) => {
      console.error(err);
      alert("新增失敗：" + err.message);
    });
}

//編輯學生資料
function renderStudentEdit(studentId) {
  const student = students.find((s) => s.student_Id === studentId);
  if (!student) return alert("找不到學生");

  const row = document.getElementById(`stud-row-${studentId}`);

  // 生日日格式
  const birth = student.birth_date.split("T")[0];

  // 產生下拉選單 HTML
  const deptSelectHTML = `
    <select id="edit_dept">
      ${departSelction
        .map(
          (dept) =>
            `<option value="${dept.departments_Id}" ${
              dept.department_name === student.department_name ? "selected" : ""
            }>${dept.department_name}</option>`
        )
        .join("")}
    </select>
  `;

  // 替換整列內容
  row.innerHTML = `
    <td>${student.student_Id}</td>
    <td><input type="text" id="edit_name" value="${student.name}" /></td>
    <td><input type="text" id="edit_gender" value="${student.gender}" /></td>
    <td><input type="text" id="edit_birth" value="${birth}" /></td>
    <td><input type="text" id="edit_phone" value="${student.phone}" /></td>
    <td><input type="email" id="edit_email" value="${student.email}" /></td>
    <td><input type="text" id="edit_address" value="${student.address}" /></td>
    <td>${deptSelectHTML}</td>
    <td>
      <button onclick="confirmEditStudent('${student.student_Id}')">確定</button>
      <button onclick="refreshStudent()">取消</button>
    </td>
  `;
}

function confirmEditStudent(studentId) {
  console.log(studentId);

  const name = document.getElementById("edit_name").value.trim();
  const gender = document.getElementById("edit_gender").value.trim();
  const birth = document.getElementById("edit_birth").value.trim();
  const phone = document.getElementById("edit_phone").value.trim();
  const email = document.getElementById("edit_email").value.trim();
  const address = document.getElementById("edit_address").value.trim();
  const deptId = document.getElementById("edit_dept").value;

  if (!name || !gender || !birth || !phone || !email || !address || !deptId) {
    return alert("請填寫所有欄位");
  }
  console.log(name, gender, birth, phone, email, address, deptId);

  fetch(`http://localhost:3000/student/${studentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      gender: gender,
      birth_date: birth,
      phone: phone,
      email: email,
      address: address,
      department_Id: parseInt(deptId),
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("更新失敗");
      return res.json();
    })
    .then((data) => {
      alert("學生資料更新成功！");
      refreshStudent();
      editingStudentId = null;
    })
    .catch((err) => {
      console.error(err);
      alert("更新失敗：" + err.message);
    });
}

//刪除學生資料
function deleteStudent(sid) {
  if (!confirm("確定要刪除這位學生嗎？")) return;

  fetch(`http://localhost:3000/student/${sid}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("刪除失敗");
      return res.json();
    })
    .then((data) => {
      alert(data.message || "刪除成功！");
      refreshStudent(); // 重新載入學生資料
    })
    .catch((err) => {
      console.error(err);
      alert("刪除學生時發生錯誤：" + err.message);
    });
}
function initAdmin() {
  currentUser = { name: getQueryParam("username"), role: "admin" };
  //   refreshDepartments();
  //   refreshStudents();
  //   refreshCourses();
}
