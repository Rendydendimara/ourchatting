const express = require('express');
const app = express();
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const socketController =  require('./controller/appControllerSocket');
const fs = require('fs');
const PORT = process.env.PORT || 8000; // PORT
const HOST = 'localhost'; // HOST
const server = require('http').Server(app);
server.listen(PORT, HOST, () => console.log(`Server listening on port ${PORT}`));
const io = require('socket.io')(server);
//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';
//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;
// io.promise = global.Promise;
// const socketController = require('./controller/appController');

/*
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient; // database untuk client(dalam hal ini applikasi kita, karena kita akan upload di herokuapp)
const URI = process.env.MONGODB_URI || 'mongodb://heroku'; // pilih URI database mongodb dari heroku atau kita sendiri yang setting sendiri
 
const DB_NAME = process.env.DB_NAME; // database name
*/

// set app log
const accessLogStream = fs.createWriteStream(path.join(__dirname,'server-log:' + new Date().getFullYear() + '-' + ( new Date().getMonth() + 1) + '-' + new Date().getDate() + '-' + new Date().getHours() + ':' + new Date().getMinutes() +'.log'),({ flag: 'a' }));


// set up app
app.use(express.static(path.join(__dirname,'./public')));
app.use('/ourchatting/user/profile',express.static(path.join(__dirname,'./users')));
app.use('/ourchatting/user/home', express.static(path.join(__dirname,'./users')));
app.use('/ourchatting/user/teman', express.static(path.join(__dirname,'./users')));
app.use('/ourchatting/user/daftar_teman/:id', express.static(path.join(__dirname,'./users')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.disable('x-powered-by');
app.use(cookieParser());


// app.use(helmet.csp());
// app.use(helmet.xframe('someorigin'));
// uncomment when using SSL
// app.use(helmet.hsts());
// app.use(helmet.iexss());
// app.use(helmet.cacheControl());

app.use(session({
    secret: 'ini key enkripsi applikasi saya',
    name: 'sessionId',
    // cookie:{httpOnly: true, secure: true},
    // resave: false,
    // saveUninitialized: false
}));
 

app.set('view engine', 'ejs');
app.use(morgan('combined',{ stream: accessLogStream }));

// connect to database
mongoose.connect('mongodb+srv://rendy:testpassword@cluster0-x0xe9.mongodb.net/ourchatting?retryWrites=true&w=majority', {useNewUrlParser: true}, (err) => {
    if(err) {
        console.log('Terjadi error saat koneksi ke database yang disebakan oleh >> ',err);
    } else {
        console.log('database connected');
        // cek node envoirentment production
        if(!isProduction) {
            socketController.setSocket(io);
            app.use(require('./routes'));
         } else {
            console.log('SET PRODUCTION ENVIROITMENT');
            console.log('SERVER CAN\'T USE');
        }   
    }
});

  
// hanlder app error
// app.use((err, req, res, next) => {
//   res.status(err.status || 500).send(err);
//   next();
// });


 

 


 