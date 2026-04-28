// import mysql from "mysql2";
// import dotenv from "dotenv";

// dotenv.config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Error al conectar a MySQL:", err);
//     process.exit(1);
//   }
//   console.log("Conectado a la DB");
// });

// export default connection;

import mysql from "mysql2"
import dotenv from "dotenv"

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:10,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error al conectar a MySQL: ", err);
    process.exit(1);
  }
  console.log("Conectado a la DB");
  connection.release();
});

export default pool;