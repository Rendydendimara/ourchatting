let mysql = require('mysql');

// koneksi ke database
let db = mysql.createConnection({
	host: 'localhost',
	password: '',
	database: 'our_chatting',
	port: 3306,
	user: 'root'
});

module.exports = db;
