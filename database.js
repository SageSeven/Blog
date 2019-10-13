const mysql = require('mysql');
const config = require('./config');

/* connect to database */
const database = mysql.createConnection({
	host: config.host,
	user: config.user,
	port: config.port,
	password: config.password,
	database: config.database
});

database.connect();

console.log("mysql connected.")

module.exports = database;