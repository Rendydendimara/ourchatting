let express = require('express');
// use socket.io
let socket = require('socket.io');
// import body-parser module to handle request POST midleware
let bodyParser = require('body-parser');
// import setup database mysql
let db = require('./db-config');

// get Time
let time = new Date();
let year =  String(time.getFullYear());
let bulan = String(time.getMonth()+1);
let tanggal = String(time.getDate());
let today ='`'+ year+'-'+bulan+'-'+tanggal+'`';
console.log(today);
// buat table
// nama table sesuai tanggal 
// query buat table
let sqlCreateTable = "create table if not exists " + today + " ( `user` varchar(100), `socket_id` varchar(30) , `waktu` varchar(30), `pesan` varchar(5000) );";
console.log(sqlCreateTable);

// handle database connect
db.connect((err)=>{
	if(err) throw err;
	console.log(sqlCreateTable);
	console.log("database connected");
	db.query(sqlCreateTable,(err,rows)=>{
		if(err) throw err;
		
		console.log('table has been created');
	});
});
 
// Handle request POST midleware
// parse data request post
let urlencodedParser = bodyParser.urlencoded({extends: false});

// App setup
let app = express(); // use framework express 
let server = app.listen(8000,function() {
	console.log('listening to request on port 8000 ');
});


// Static files
app.use('/assets',express.static('assets/user'));

// setup view engine ejs
app.set('view engine','ejs');

// Socket setup
// socket handle server
let io = socket(server);

// Handle app routing
app.get('/',(req,res)=>{
	res.render('login');
});

// user name
let user_name = "";

// handle request post to routing chatting
app.post('/chatting', urlencodedParser, (req,res)=>{
	// kirim data post kepada view chatting
 	console.log(req.body);
	user_name = req.body.nama;
	res.render('chatting',{user: req.body})
});

// handle app routing chatting
app.get('/chatting',urlencodedParser,(req,res)=>{
	// routing view chatting
	req.url = '/';
	res.render('login');
});

let userData = {};

// Handle Socket IO
// io socket dengar event connection
// fungsi akan berjalan jika ada koneksi socket (dengar koneksi dari sisi front-end)
// parameter 2 callback
io.on('connection',(socket)=>{
	console.log('made socket connection', socket.id); // socket.id = menampilkan id socket yang sedang di handle.	
	  													  // setiap socket memiliki id yang berbeda

	// handle ketika ada client yang  keluar
	socket.on('disconnect',(data)=>{
		console.log('id_socket ' + socket.id+ ' keluar');
	});

	// socket handle event chat
	// parameter 2, data yang dikirim untuk event chat pada socket back-end
	socket.on('chat',(data)=>{
 		userData = data;
		
		// validasi data sebelum di simpan di database
		// hapus baris baru dan karakter yang tab
		userData.message = userData.message.replace('\n',' ' );
		userData.message = userData.message.replace('\t',' ');
		console.log(userData.message);
		console.log(userData);
		console.log(user_name);
		// query tambah tabel database
		let  sqlAddLog = "insert into " + today + " (`user`,`socket_id`,`waktu`,`pesan`) values("+'"'+userData.handle+'"'+","+'"'+socket.id+'"'+","+'"'+userData.time+'"'+","+'"'+userData.message+'"'+");";	
 
		// tambah log pesan ke database
		db.query(sqlAddLog,(err,results)=>{
			console.log("1 record inserted");
			console.log(sqlAddLog);
		});
		db.query('SHOW TABLES',(err, results)=>{
				if(err) throw err;
				console.log(results);
				results.forEach((tabel) => {
					console.log(tabel);
					db.query('SELECT user,pesan FROM ' + tabel,(err, rows, field)=>{
						if(err) throw err;
						console.log(rows);
					});
				});
				console.log('we');
		});
		 	
		// get user data 
 		console.log('\nUser: ' + userData.handle + '\nUser pesan: ' + userData.message + '\nUser socket id: ' + socket.id);
 		
 		// handle emit di io socket
		// kirim data ke socket front lewat event char
		// emit(event,DataYangDiKirim) untuk mengirim data socket
		io.sockets.emit('chat',data);
 	});

	// event typing
	socket.on('typing',(data)=>{
		// broadcast handle
		// broadcast, mengirim data ke seluruh client/pengguna yang ada tapi tidak untuk dirinya sendiri
		// kirim data ke semua socket pengguna/client kecuali pengguna/client yang mengirim socket ke server saat ini. 
		socket.broadcast.emit('typing',data);
	});
});
 
































































































