const Users = require('../models/users');
const UsersAccount = require('../models/usersAccount');
const Messages = require('../models/messages');
const mailService = require('../config/email')({userMail: 'Genjitapaleuk@gmail.com', userPasswordMail: 'Dendimara'});
const mongoose = require('mongoose');
const crypto = require('crypto'); 
const socketController = require('./appControllerSocket');
const fs = require('fs');
 
// GLOBAL VARIABEL
// variabel untk menyimpan object user yang mau di daftarkan untk sementara
let newUser = {};

// FUNCTIONS DATABASE CONTROLER
// fungsi untuk menambah akun baru ke dalam usersAccount collection
const insertNewUsersAccount = (user) => (new Promise((resolve, reject) => {
    user.save((err, result) => {
        if(err) reject(err);
        else {
            // buat repositori untuk users baru
            fs.mkdir('users/'+ user._id, function(err) {
                if(err) reject(err);
                // buat repositori ImageProfile untk menampung foto profile di dalam repositori users/:id
                fs.mkdir('users/' + user._id + '/ImageProfile', (err) => {
                    if(err) reject(err);
                    else {
                        // salin foto profile default ke dalam repositori users/:id/ImageProfile
                        fs.copyFile(__dirname + '/../public/assets/img/kucing-santuy.jpg', __dirname + '/../users/' + user._id + '/ImageProfile/kucing-santuy.jpg', function(err) {
                            if(err) reject(err);
                            else resolve(result);
                        });
                    }
                });
            });
        }
    });   
}));

// fungsi untuk menambah daftar user ke dalam users collection
const insertUsers = (user) => (new Promise((resolve, reject) => {
    user.save((err, result) => {
        if(err) reject(err);
        else resolve(result);
    });   
}));
 
// fungsi untuk mencari user berdasarkan email didalam users collection
const findUserByEmail = (email) => (new Promise((resolve, reject) => {
    Users.find({email: email}, (err, result) => {
        if(err) reject(err);
        else resolve(result);
    });   
}));
 
// fungsi untku mencari account user di dalam collection usersAccount
const findUserAccount = (user) => (new Promise((resolve, reject) => {
    UsersAccount.find({email: user.email}, (err, result) => {
        if(err) {
            // jika gagal mencari di collection usersAccount
            console.log(err);
            reject(err);
        } else {
            // jika user tidak di temukan
            console.log(result.length);
            if(result.length !== 0) {
                // cek password user
                const isuserPasswordRight = () => {
                    const hash = crypto.pbkdf2Sync(user.password, result[0].salt, 10000, 512, 'sha512').toString('hex'); // deskripsi hash password
                    return result[0].passwordHash === hash; // kembalikan true jika password valid, atau false jika password invalid
                }
                if(isuserPasswordRight() === true) {
                    // jika password benar
                    resolve({status:'success', message: result[0]});
                } else
                    // jika password salah 
                    resolve({status: 'password wrong', message: 'password anda salah'});                   
            } else {
                resolve({status: 'user not found', message: 'User Tidak Terdaftar di OurChatting'})
            }
        }
     });
}));
 
async function saveNewAccount(next,user) {
    let date = new Date().getTime();
    // let imageBuffer = fs.readFileSync(__dirname + '/img/animal-cat.jpg');
    // get image encoded
    // let imageEncoded = imageBuffer.toString('base64');

    // set object usersAccount collection
    let newAccountUser = new UsersAccount({
        _id: new mongoose.Types.ObjectId,
        email: user.email,
        name: user.name,
        fotoProfile: {
            path: '/assets/img/kucing-santuy.jpg',
            contentType: 'image/jpeg',  
       //     imgBuf: new Buffer(imageEncoded, 'base64')  
        }
    });
 
    // set password hash and salt to account user
    newAccountUser.setPassword(user.password);
        
    // set object users collection
    let newUsers = new Users({
        _id: new mongoose.Types.ObjectId,
        name: user.name,
        email: user.email,      
    });

    try {
        // save kedua object di collection yang berbeda dengan metode promise all
        const result = await Promise.all([ insertNewUsersAccount(newAccountUser), insertUsers(newUsers) ]);

        console.log('berhasil menambahkan akun dengan nama >> ' + newAccountUser._id );
        return result;
    } catch(err) {
        console.error('Terjadi error saat menambahkan akun baru ke dalam collection usersAccount dan uses yang di sebabkan oleh >> ', err);
        next(err);
    }
}

// fungsi menghandle request ke /(root) method get
async function getRoot(req, res ,next) {
    res.render('ourchatting');
}

// fungsi menghandle request ke /login method get
async function getLogin(req, res ,next) {
    res.render('login',{message: ''});
}

// fungsi menghandle request ke /login method post
async function postLogin(req, res ,next) {
    // ambil request body
    const { 
        email,
        password 
    } = req.body;

    console.log("Email Login >> ", email);
    console.log("Password Login >> ", password);

    try {
        const result = await findUserAccount({email, password});
        if(result.status === 'password wrong') {
            console.log(result);
            res.render('login',{message: result.message});
        } else if (result.status === 'user not found') {
            console.log(result);
            res.render('login',{message: result.message});    
        } else {
            console.log(result.message);
            req.session.user = result.message; // buat sesi untuk user yang mau login 
            res.redirect('/ourchatting/user/home');
        }
    } catch(err) {
        // ketika ada yang salah dalam pengecekan email atau password
        console.log('Terjadi error saat mencari account user di dalam collection usersAccount yang di sebabkan oleh >> ', err);
        // res.status(403);
        res.render('login', {message: result.message});
    }
}

// fungsi menghandle request ke /signup method get
async function getSignup(req, res ,next) {
    res.render('signup',{message: ''});
}

// fungsi menghandle request ke /signup method post
async function postSignup(req, res ,next) {
    // ambil request body
    const {
        email,
        password,
        rewritePassword,
        name
    } = req.body;
    
    console.log("Email Signup >> ", email);
    console.log("Password Signup >> ", password);
    console.log("Rewrite Password Signup >> ", password);
    console.log("Nama Signup >> ", password);

    // cari account user berdasarkan email
    const checkEmailUser = await findUserByEmail(email);
    console.log(checkEmailUser.length);

    // validasi data signup
    // validasi password  
    if(password.search(/[0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]/) == -1 || password.length < 6 || password !== rewritePassword || email.indexOf('@') === -1 || email.indexOf('.') === -1 || checkEmailUser.length > 0){
        let message = ''
        // cek bagian mana yang error untk di kirim ke user
        if(password.search(/[0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]/) == -1){
            message += ' Password harus ada angka ';
        }
        if(password.length < 6){
            message += ' Password harus lebih dari 6 karakter ';
        }                    
        
        if(password !== rewritePassword){
            message += ' Password yang di tulis kembali TIDAK SAMA dengan password yang di tulis pertama kali ';
        }
    
        // validasi email
        if(email.indexOf('@') === -1 || email.indexOf('.') === -1){
            message += ' Email tidak benar ';
        }
        if(checkEmailUser.length > 0) { 
            message += 'Email Sudah Digunakan Di Akun Lain, Silakan Masukan Email Yang Lain';
        }

        res.statusCode = 402;
        res.render('signup', {message: message});
    
    } else{
        // data form signup lengkap dan valid, maka selanjutnya kita menuju rute untk memberikan token verifikasi akun kepada user
        // await setNewUser(req);
        await setNewUser(req);
        res.redirect('/ourchatting/signup/verification/gettoken');
    }
}

function setNewUser(req) {
    newUser = {
        email,
        password,
        rewritePassword,
        name,
     } = req.body;
     newUser.hasToke = false // sebagai bukti apakah token sudah di kirimkan ke user atau belum
    console.log(newUser);
}

function clearNewUser() {
    newUser = {}
}

// fungsi untk menjaga akeses ke rute verifikasi token akun tidak di akses sembarangan, user harus mengisi formulir untuk bisa lolos dari fungsi midleware ini
function getReqBodyNewUser(req, res, next) {
    if(newUser.name !== undefined){
        next();
    } else{
        const err = new Error("Bad Request");
        res.send(403,"403 Bad Request");
        next('bad request');
        //next(err);
    }
}

// fungsi midleware untuk menjaga akses rute ke user
// fungsi ini bertugas untuk mengecek session user, jika user tidak memiliki session, user tidak di izikan untuk mengakses rute tersebut
function checkUserSession(req, res, next) {
    if(req.session.user) {
        // jika user telah memiliki session di ourchatting
        next();
    } else{
        // jika user tidak memiliki session
        // redirect ke rute login
        res.redirect('/ourchatting/login');
    }
}

// fungsi untuk mengirim pesan/token ke email user
const sendEmail = async (to, subj, body) => {
    // kiriim token 5 digit ke email user dengan lampiran berupa HTML
    try {
        const result = await mailService.send(to,subj,body)
        console.log(result);
        console.log('berhasil mengirimkan email ke >> ' + to);
        return ({status:'success', message: result});
    } catch(err) {
       // console.log('Terjadi error saat mengirimkan email yang di sebabkan oleh >> ', err);
        return ({status:'fail', message: err});
    } 
};
    
// fungsi menghandle request ke /verification method get
// di fungsi ini panggil fungsi getVerificationToken agar kita bise mengirimkan token ke email user lalu menampilkan view verification
async function getVerification(req, res ,next) {
    if(newUser.hasToken === false) {
        // cek apakah user sudah mempunyai token atau belum, jika suda tidak usah lagi kirim token
        // jika belum kirim token 
        getVerificationToken(req, res, next);
    } else 
        // jika token sudah terkirim
        res.render('verification', {message: 'Kami Telah Mengirimkan Token 4 Digit Angka Ke Email Anda, Silakan Di Verifikasi'});
}

// fungsi menghandle request ke /signup/verification/gettoken method get
async function getVerificationToken(req, res ,next) {
    // set token 3/4 digit
    const token = Math.floor(Math.random()*9999);
    console.log('Token: ' + token);
    
    const body = 'Hay ' + newUser.name + ' ' + token + ' adalah kode digit anda untuk melakukan verifikasi pembuatan akun ourchatting. Ayo lakukan verifikasi sekarang juga';

    // panggil fungsi sendTokenEmail, untk mengirim token 4 digit angka ke email user
    const result = await sendEmail(newUser.email, token, body);
    console.log(result);

    if(result.status === 'success') {//=== 'success'){
        newUser.token = token;
        // berhasil mengirimkan email 
        if(newUser.hasToken === false) {
            res.render('verification', {messageEmail: 'Kami Telah Mengirimkan Token 4 Digit Angka Ke Email Anda, Silakan Di Verifikasi', message: ''});
        } else {
            res.render('verification', {messageEmail: 'Kami Telah Mengirimkan Ulang Token 4 Digit Angka Ke Email Anda, Silakan Di Verifikasi', message: ''});
        }
    } else {
        
        // berhasil mengirimkan email
        const message = "Maaf, kami tidak Dapat Mengrimkan Token Verifikasi Ke Email Anda, hal ini di sebabkan oleh: \n" + 
                                                                                                                    "\t\t\t\t1. Server Sedang Mengalami Masalah" + 
                                                                                                                    "\t\t\t\t2. Pastikan Email Yang Anda Masukan Benar, dan Masih Aktif"
        res.status(403).send(message);
        next(result.message);
   }
}

// fungsi menghandle request ke /verification method post
async function postVerifcation(req, res ,next) {
    // ambil data dari form verifikasi token
    console.log(req.body.token1);

    // cek apakah token sama dengan token yang dikirim ke email user
    if(parseInt(req.body.token1) === newUser.token ) {// newUser.token){
        // jika token benar
        console.log('akun siap di daftarkan dalam database');
        // panggil fungsi untuk menyimpan akun di dalam databases
        let result = await saveNewAccount(next,newUser);
        // cetak pesan berhasil tambah akun ke dalam collection users dan usersAccount
        console.log(result);
        // reset object newUser
        await clearNewUser();
        // redirect user ke rute login agar user melakukan login akun baru
        res.redirect('/ourchatting/login');
    } else {
        // jika token salah
        // render ke halaman verfication sambil memberikan pesan kesalahan
        res.render('verification', {message: 'Token Yang Anda Masukan Salah, Silakan Masukan Token Dengan Benar', messageEmail: 'Kami Telah Mengirimkan Token 4 Digit Angka Ke Email Anda, Silakan Di Verifikasi'});
    }
}

// modules exports
module.exports = {
    getRoot,
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    getReqBodyNewUser,
    getVerification,
    postVerifcation,
    getVerificationToken,
    checkUserSession
};