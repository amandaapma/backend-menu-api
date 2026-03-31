const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/menus", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM menus WHERE is_deleted = false"
  );
  res.json(result.rows);
});

app.get("/api/menus/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM menus WHERE id = $1 AND is_deleted = false",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/menus", async (req, res) => {
  const { name, description, price } = req.body;

  const result = await pool.query(
    "INSERT INTO menus (name, description, price) VALUES ($1, $2, $3) RETURNING *",
    [name, description, price]
  );

  res.json(result.rows[0]);
});

app.put("/api/menus/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, is_available } = req.body;

  const result = await pool.query(
    `UPDATE menus 
     SET name=$1, description=$2, price=$3, is_available=$4 
     WHERE id=$5 RETURNING *`,
    [name, description, price, is_available, id]
  );

  res.json(result.rows[0]);
});

app.delete("/api/menus/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "UPDATE menus SET is_deleted = true WHERE id = $1",
    [id]
  );

  res.json({ message: "Data berhasil dihapus" });
});