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

database.connect((err)=>{
	if (err) {
		setTimeout(handleDisconnection, 2000);
	}
});

database.on('error', ()=>{
	logger.error('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        logger.error('db error执行重连:'+err.message);
        handleDisconnection();
    } else {
        throw err;
    }
});

function handleDisconnection() {
	let connection = mysql.createConnection({
		host: config.host,
		user: config.user,
		port: config.port,
		password: config.password,
		database: config.database
	});

	connection.connect((err)=>{
		if (err) {
			setTimeout(handleDisconnection, 2000);
		}
	});

	connection.on('error', ()=>{
		logger.error('db error', err);
	    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
	        logger.error('db error执行重连:'+err.message);
	        handleDisconnection();
	    } else {
	        throw err;
	    }
	});

	module.exports = connection;
}

console.log("mysql connected.")

module.exports = database;