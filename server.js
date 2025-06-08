// server.js
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// 中介軟體設定
app.use(cors());
app.use(bodyParser.json());

// 建立 MySQL 連線
const db = mysql.createConnection({
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "",
  database: "studentsaddsystem", // 替換成你的資料庫名稱
});

// 測試連線
db.connect((err) => {
  if (err) {
    console.error("MySQL 連線失敗:", err);
    return;
  }
  console.log("成功連接到 MySQL 資料庫");
});

// 🌟 範例 API：取得所有學生
app.get("/students", (req, res) => {
  const sql = "SELECT * FROM students";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

//登入
app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "參數錯誤" });
  }

  db.query(
    "SELECT * FROM accounts WHERE username = ? AND password = ? AND role = ?",
    [username, password, role],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "資料庫錯誤" });
      }
      if (results.length === 0) {
        return res.status(401).json({ message: "帳號或密碼錯誤" });
      }
      return res.json({ username: results[0].username, role: results[0].role });
    }
  );
});

//department
//get all department
app.get("/department", (req, res) => {
  const sql = "SELECT * FROM departments";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
//新增科系
app.post("/department", (req, res) => {
  const { department_name } = req.body;
  const sql = "INSERT INTO departments (department_name) VALUES (?)";
  db.query(sql, [department_name], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true, id: result.insertId });
  });
});
//修改科系
app.put("/department/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { department_name } = req.body;

  if (!department_name || department_name.trim() === "") {
    return res.status(400).json({ message: "科系名稱不可為空" });
  }

  const sql =
    "UPDATE departments SET department_name = ? WHERE departments_Id = ?";
  db.query(sql, [department_name.trim(), id], (err, result) => {
    if (err) return res.status(500).send(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "找不到該科系" });
    }

    res.json({ success: true, message: "更新成功" });
  });
});
//刪除科系
app.delete("/department/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const sql = "DELETE FROM departments WHERE departments_Id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "找不到該科系" });
    }

    res.json({ success: true, message: "刪除成功" });
  });
});

//student
app.get("/student", (req, res) => {
  const sql = `
    SELECT students.*, departments.department_name
    FROM students
    Inner JOIN departments ON students.department_Id = departments.departments_Id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 新增學生
app.post("/addstudent", (req, res) => {
  const {
    student_Id,
    name,
    gender,
    birth_date,
    phone,
    email,
    address,
    department_Id,
  } = req.body;

  if (
    !student_Id ||
    !name ||
    !gender ||
    !birth_date ||
    !phone ||
    !email ||
    !address ||
    !department_Id
  ) {
    return res.status(400).json({ message: "請填寫所有欄位" });
  }

  const sql = `
    INSERT INTO students 
      (student_Id,name, gender, birth_date, phone, email, address, department_Id)
    VALUES (?, ?, ?, ?, ?, ?, ?,?)
  `;

  db.query(
    sql,
    [
      student_Id,
      name,
      gender,
      birth_date,
      phone,
      email,
      address,
      department_Id,
    ],
    (err, result) => {
      if (err) {
        console.error("資料庫錯誤：", err);
        return res.status(500).json({ message: "新增學生失敗" });
      }

      res.json({
        success: true,
        message: "學生新增成功",
        studentId: result.insertId,
      });
    }
  );
});

//get one student data
app.get("/student/:id", (req, res) => {
  const studentId = req.params.id;

  const sql = `
    SELECT s.*, d.department_name
    FROM students s
    JOIN departments d ON s.department_Id = d.departments_Id
    WHERE s.student_Id = ?
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("查詢錯誤：", err);
      return res.status(500).json({ message: "伺服器錯誤" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "找不到該學生" });
    }

    res.json(results[0]); // 傳回單一學生物件
  });
});

//修改學生
app.put("/student/:id", (req, res) => {
  const studentId = req.params.id;
  const { name, gender, birth_date, phone, email, address, department_Id } =
    req.body;

  // 驗證欄位
  if (
    !name ||
    !gender ||
    !birth_date ||
    !phone ||
    !email ||
    !address ||
    !department_Id
  ) {
    return res.status(400).json({ message: "請填寫所有欄位" });
  }

  const sql = `
    UPDATE students SET
      name = ?,
      gender = ?,
      birth_date = ?,
      phone = ?,
      email = ?,
      address = ?,
      department_Id = ?
    WHERE student_Id = ?
  `;

  const values = [
    name,
    gender,
    birth_date,
    phone,
    email,
    address,
    department_Id,
    studentId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("資料庫錯誤：", err);
      return res.status(500).json({ message: "更新學生失敗" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "找不到該學生" });
    }

    res.json({
      success: true,
      message: "學生更新成功",
    });
  });
});

//刪除學生
app.delete("/student/:id", (req, res) => {
  const studentId = req.params.id;

  const sql = "DELETE FROM students WHERE student_Id = ?";
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("資料庫錯誤：", err);
      return res.status(500).json({ message: "刪除學生失敗" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "找不到該學生" });
    }

    res.json({ success: true, message: "刪除學生成功" });
  });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器已啟動 http://127.0.0.1:3000`);
});
