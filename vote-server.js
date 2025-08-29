const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const db = new sqlite3.Database("./votes.db");

app.use(express.json());
app.use(express.static(path.join(__dirname))); // ✅ เสิร์ฟ index.html, videos.json, etc.

app.post("/api/vote", (req, res) => {
  const { machineId, videoId } = req.body;
  db.get("SELECT * FROM votes WHERE machineId = ?", [machineId], (err, row) => {
    if (row) return res.json({ success: false, message: "โหวตไปแล้ว" });
    db.run(
      "INSERT INTO votes (machineId, videoId) VALUES (?, ?)",
      [machineId, videoId],
      (err) => {
        if (err) return res.json({ success: false, message: "เกิดข้อผิดพลาด" });
        res.json({ success: true });
      }
    );
  });
});

// ✅ เพิ่มฟังก์ชันนับโหวต
app.get("/api/vote-count", (req, res) => {
  db.get("SELECT COUNT(*) AS total FROM votes", (err, row) => {
    if (err) {
      console.error("❌ อ่านฐานข้อมูลผิดพลาด:", err);
      return res.status(500).json({ total: 0 });
    }
    res.json({ total: row.total });
  });
});

app.get("/api/vote-stats", (req, res) => {
  db.all(
    "SELECT videoId, COUNT(*) AS total FROM votes GROUP BY videoId ORDER BY total DESC",
    (err, rows) => {
      if (err) {
        console.error("❌ ดึงสถิติโหวตผิดพลาด:", err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

app.listen(3000, () => console.log("✅ Server ready on http://localhost:3000"));
