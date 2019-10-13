var express = require('express');
var crypto = require('crypto');
var mysql = require('./../database');
var router = express.Router();
var session = require('express-session');

router.use(session({
	secret: 'blog',
	cookie: {maxAge:1000*60*24*30},
	resave: false,
	saveUninitialized: true
}));

/* GET home page. */
router.get('/', function(req, res, next) {
	let query = 'select * from article order by articleID desc';
	mysql.query(query, (err, rows, fields)=>{
		let articles = rows;
		articles.forEach((ele)=>{
			let year = ele.articleTime.getFullYear();
			let month = ele.articleTime.getMonth() + 1 > 10 ?
				ele.articleTime.getMonth() : '0' + (ele.articleTime.getMonth() + 1);
			let date = ele.articleTime.getDate() > 10 ? ele.articleTime.getDate() :
				'0' + ele.articleTime.getDate();
			ele.articleTime = year + '-' + month + '-' + date;
		});
		res.render('index', {articles});
	});
});
/* GET login page. */
router.get('/login', function(req, res, next) {
	res.render('login', {message:''});
});
router.post('/login', function(req, res, next) {
	let name = req.body.name;
	let password = req.body.password;
	let hash = crypto.createHash('md5');
	hash.update(password);
	password = hash.digest('hex');
	let query = 'select * from author where authorName=' + mysql.escape(name)
	 + 'and authorPassword=' + mysql.escape(password);
	mysql.query(query, (err, rows, fields)=>{
		if(err) {
			console.log(err);
			return;
		}
		let user = rows[0];
		if(!user){
			res.render('login', {message:'用户名或者密码错误'});
			return;
		}
		req.session.user = user;
		res.redirect('/');
	});
});

/* Get Article page */
router.get('/articles/:articleID', (req, res, next)=>{
	let articleID = req.params.articleID;
	let query = 'select * from article where articleID=' + mysql.escape(articleID);
	mysql.query(query, (err, rows, fields)=>{
		if(err) {
			console.log(err);
			return;
		}
		let query1 = 'update article set articleClick=articleClick+1 where articleID='
			+ mysql.escape(articleID);
		let article = rows[0];
		mysql.query(query1, (err, rows, fields)=>{
			if(err) {
				console.log(err);
				return;
			}
			let year = article.articleTime.getFullYear();
			let month = article.articleTime.getMonth() + 1 > 10 ?
				article.articleTime.getMonth() : '0' + (article.articleTime.getMonth() + 1);
			let date = article.articleTime.getDate() > 10 ? article.articleTime.getDate() :
				'0' + article.articleTime.getDate();
			article.articleTime = year + '-' + month + '-' + date;
			res.render('article', {article});
		});
	});
});

/* Get edit page */
router.get('/edit', (req, res, next)=>{
	let user = req.session.user;
	if(!user) {
		res.redirect('/login');
		return;
	}
	res.render('edit');
});
router.post('/edit', (req, res, next)=>{
	let title = req.body.title;
	let content = req.body.content;
	let author = req.session.user.authorName;
	let query = 'insert article set articleTitle=' + mysql.escape(title) + 
		',articleAuthor=' + mysql.escape(author) + ',articleContent=' + mysql.escape(content)
		+ ',articleTime=curdate()';
	mysql.query(query, (err, rows, fields)=>{
		if(err) {
			console.log(err);
			return;
		}
		res.redirect('/');
	});
});

router.get('/friends', (req, res, next)=>{
	res.render('friends');
})

module.exports = router;
