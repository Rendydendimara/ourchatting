const Users = require('../models/users');
const UsersAccount = require('../models/usersAccount');
const Messages = require('../models/messages');
const mailService = require('../config/email')({userMail: 'Genjitapaleuk@gmail.com', userPasswordMail: 'Dendimara'});
const mongoose = require('mongoose');
const crypto = require('crypto'); 
const socketController = require('./appControllerSocket');
const fs = require('fs');

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
                console.log(user.password);
                console.log(result[0].salt);
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

// fungsi untuk mendapatkan seluruh account user di ourchatting 
const getAllUserAccount = () => (new Promise((resolve, reject) => {
    UsersAccount.find((err, allUser) => {
        if(err) reject(err);
        else resolve(allUser); 
    });
}));

// fungsi untuk mengupdate field fotoProfile ke dalam UserAccount collection
const updateFotoProfile = (req, newFotoProfile) => (new Promise((resolve, reject) => {
    UsersAccount.updateOne(
        {_id: req.session.user._id},
        { $set: {fotoProfile: newFotoProfile}}, (err, result) => {
            if(err) reject(err);
            else{
                // setelah berhasil mengupdate foto profile
                // kita update juga req.session.user agar mendapatkan database user yang baru
                UsersAccount.find({_id: req.session.user._id}, (err, userUpdate) => {
                    if(err) reject(err);
                    else{
                        req.session.user = userUpdate[0];
                        resolve(userUpdate);    
                    }
                 });
             }  
        }
    );
}));

// fungsi untuk mengupdate field name ke dalam UserAccount collection
const updateUserNameAccount = (req, newUserName) => (new Promise((resolve, reject) => {
    UsersAccount.updateOne(
        {_id: req.session.user._id}, 
        {$set: {name: newUserName}}, (err, result) => {
            if(err) reject(err);
            else {
                // setelah berhasil mengupdate username account
                // kita update juga req.session.user agar menggunakan database user yang baru
                UsersAccount.find({_id: req.session.user._id}, (err, userUpdate) => {
                    if(err) reject(err);
                    else {
                        req.session.user = userUpdate[0];
                        resolve(userUpdate);    
                    }
                });
            }
        }
    );
}));

// fungsi untuk mengupdate field bio ke dalam UserAccount collection
const updateUserBioAccount = (req, newBio) => (new Promise((resolve, reject) => {
    UsersAccount.updateOne(
        {_id: req.session.user._id},
        {$set: {bio: newBio}}, (err, result) => {
            if(err) reject(err)
            else {
                // setelah berhasil mengupdate user bio account
                // kita update juga req.session.user agar menggunakan database user yang baru
                UsersAccount.find({_id: req.session.user._id}, (err, userUpdate) => {
                    if(err) reject(err);
                    else {
                        req.session.user = userUpdate[0];
                        resolve(userUpdate);
                    }
                });
            }
        }
    );
}));

// fungsi untk mengubah field passwordHash user kedalam UserAccount collection
const changeUserPassword = (req, newPassword) => (new Promise((resolve, reject) => {
    // kita ubah ke dalam bentuk hash dulu password yang mau di ubah
    const newPasswordHash = crypto.pbkdf2Sync(newPassword, req.session.user.salt, 10000, 512, 'sha512').toString('hex'); // buat hash dengan tipe sha512 untuk password yang sudah di campur salt
    UsersAccount.updateOne(
        {_id: req.session.user._id},
        {$set: {passwordHash: newPasswordHash}}, (err, result) => {
            if(err) reject(err);
            else resolve(result);
        }
    );
}));

// fungsi untuk menghapus akun user di dalam database dan repositori milik user
const deleteUserAccount = (req) => (new Promise((resolve, reject) => {
    UsersAccount.deleteOne({_id: req.session.user._id}, (err, result) => {
        if(err) reject(err);
        else {
            // hapus repository user
            // fs.rmdirSync('users/' + req.session.user._id + '/', (err, result) => {
            //     if(err) reject(err);
            //     else resolve(result);
            // });
            // hapus user di Users collection
            Users.deleteOne({email: req.session.user.email}, (err, result) => {
                if(err) reject(err);
                else resolve(result);
            });
         }
    });
}));

// fungsi untuk mendapatkan 1 account di ourchatting
const getOtherUserProfile = (id) => (new Promise((resolve, reject) => {
    UsersAccount.find({_id: id}, (err, user) => { 
        if(err) reject(err);
        else resolve(user[0]); 
    });
})); 

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

// fungsi menghandle request ke /profile method get
async function getUserProfile(req, res ,next) { 
    // setting request user
    socketController.setUsersSession(req);
    console.log(req.session.user.fotoProfile.path);
    res.render('userProfile',{name: req.session.user.name, bio: req.session.user.bio, image: req.session.user.fotoProfile.path ,email: req.session.user.email, message: ''});
}

// fungsi menghandle request ke /logout method get
async function getUserLogout(req, res ,next) {
	console.log('user >> ' + req.session.user._id + ' logout');
    req.session.destroy((err) => {
        if(err){
            console.log('Terjadi error saat user melakukan logout yang di sebabkan oleh >> ', err);
            // next(err);
        } else {
            res.redirect('/ourchatting');
        }
    });
}

// fungsi menghandle request ke /online method get
async function getAbout(req, res ,next) {
    res.render('about');
}

// fungsi menghandle request ke /contact method get
async function getContact(req, res ,next) {
    res.render('contact');
}

// fungsi menghandle request ke /home method get
async function getHome(req, res ,next) {
	// buat socket baru    
	console.log('owowow');    
    socketController.setUsersSession(req);
    res.render('room');
}

// fungsi menghandle request ke /feedback method get
async function getFeedback(req, res ,next){
    res.render('feedback');
}

// fungsi untuk mendapatkan banyak user yang sedang online
async function getUserTeman(req, res, next){ 
    try {
        let listUsersOnline = []; // array yang menampung user online
        let listUsersOffline = []; // array yang menampung user offline

        // ambil daftar user online
        const getUserOnline = socketController.getUserOnline();
        // console.log(getUserOnline)
        // ambil seluruh daftar user pengguna ourchatting
        const allUserAccount = await getAllUserAccount();
        //  console.log(allUserAccount);
        // filter user yang online dan offline
        allUserAccount.forEach((user) => {
            console.log(getUserOnline);
            console.log(user._id);
            if(getUserOnline.includes(user.email)) {
                // tambah user yang sedang online   
                listUsersOnline.push({
                    name: user.name,
                    path: '/ourchatting/user/daftar_teman/' + user._id, 
                    fotoProfile: user.fotoProfile.path,
                    status: 'Sedang Aktif' 
                });
            } else {
                // tambah user yang sedang offline
                // kita tidak boleh menambah akun kita yang ke dalam daftar user ofline karena kita sedang online
                if(user.email !== req.session.user.email) {
                    listUsersOffline.push({
                        name: user.name,
                        path: '/ourchatting/user/daftar_teman/' + user._id, 
                        fotoProfile: user.fotoProfile.path,
                        status: 'Tidak Aktif' 
                    });    
                }
             }
        });

        console.log('user online');
        console.log(listUsersOnline);
        console.log('userOffline');
        console.log(listUsersOffline);

        res.render('teman', {userOnline: listUsersOnline, userOffline: listUsersOffline});
    } catch(err) {
        console.error('Terjadi error saat mengambil daftar teman aktif/ofline yang di sebabkan oleh >> ', err);
        // next(err);
    }
}

// fungsi untuk mengupload sekaligus mengupdate foto profile user yang di upload
async function postUploadUserImageProfile(req, res, next){  
    // cek isi file
    if(!req.file) {
        // jika tidak ada file
        // tampilkan view userProfile dan berikan pesan bahwa user belum memasukan pesan
        res.render('userProfile',{name: req.session.user.name, bio: req.session.user.bio, image: req.session.user.fotoProfile.path, email: req.session.user.email, message: 'ANDA BELUM MEMASUKAN FILE'});
    } else {
        // file ada
        // proses simpan foto profile baru ke dalam UserAccount Collection
        // get image buffer
        // const imageBuffer = fs.readFileSync(req.file.path);
        // get image encoded
        // const imageEncoded = imageBuffer.toString('base64');
        // set new fotoProfileObject

        let newFotoProfile = {
            // kita harus hapus rute /users karena kita sudah menggunakan express static file yang mengarah ke direkrori users
            path: req.file.path.substr(6, req.file.path.length),
            contentType: req.file.mimetype,
           // img: new Buffer(imageEncoded, 'base64')
        }

        try {
            // update fotoProfile field into UserAccount collection
            const resultUpdateFotoProfile = await updateFotoProfile(req, newFotoProfile);
            console.log(req.session.user._id);
            console.log(resultUpdateFotoProfile);
            console.log('berhasil ubah foto profile');
            // redirect ke rute user/Profile
            res.redirect('/ourchatting/user/profile');
        } catch(err){
            // tangkap kesalahan saat update foto Profile User Kedalam UserAccount collection
            console.error('Terjadi kesalahan saat mengupdate foto profile ' + req.session.user._id + ' ke dalam UserAccount collection yang di sebakan oleh >> ' + err);
            // next(err);
            // tampilkan view userProfile dan berikan pesan bahwa user belum memasukan pesan
            // res.render('userProfile',{name: req.session.user.name, image: req.session.user.fotoProfile.path, email: req.session.user.email, bio: 'Masukan bio singkat anda', message: 'Maaf Server Sedang Sibuk Untuk '});
        }
    }   
}

//  fungsi update username account
async function postUpdateUserName(req, res ,next) {
    const { name } = req.body;
    // cek field name di form
    if(!name) {
        // jika nama yang diubah kosong
        // tampilkan view userProfile dan berikan pesan bahwa user belum memasukan pesan
        res.redirect('/ourchatting/user/profile');
    } else {
        // nama baru ada
        try {
            // update username account
            const resultUpdateUserName = await updateUserNameAccount(req, name);
        	console.log(req.session.user._id);
            console.log(resultUpdateUserName);
            console.log('berhasil ubah nama akun');
    	
            // redirect ke rute user/profile
            res.redirect('/ourchatting/user/profile');
        } catch(err) {
            // tangkap kesalahan saat update name ke dalam UserAccount collection
            console.error('Terjadi kesalahan saat mengupdate username ' + req.session.user._id + ' kedalam UserAccount collection yang di sebabkan oleh >> ', err);
            // next(err);
        }    
    }
}

// fungsi update bio user account
async function postUpdateUserBio(req, res, next) {
    const { bio } = req.body;
    console.log(bio)
    // cek field bio di form
    if(!bio) {
        // jika bio yang diubah kosong
        // tampilkan view userProfile dan berikan pesan bahwa user belum memasukan pesan
        // res.render('userProfile',{name: req.session.user.name, bio: req.session.user.bio, image: req.session.user.fotoProfile.path, email: req.session.user.email, message: 'ANDA BELUM MEMASUKAN BIO BARU'});
        res.redirect('/ourchatting/user/profile');
    } else {
        // bio baru ada
        try {
            // update username account
            const resultUpdateUserBio = await updateUserBioAccount(req, bio);
            console.log(req.session.user._id);
            console.log(resultUpdateUserBio);
            console.log('berhasil ubah bio akun');
    		
            // redirect ke rute user/profile
            res.redirect('/ourchatting/user/profile');
        } catch(err) {
            // tangkap kesalahan saat update name ke dalam UserAccount collection
            console.error('Terjadi kesalahan saat mengupdate bio user ' + req.session.user._id + ' kedalam UserAccount collection yang di sebabkan oleh >> ', err);
            // next(err);
        }    
    }
}

// fungsi mengubah password user account
async function postChangePassword(req ,res, next) {
    const { oldPassword, newPassword, rewriteNewPassword } = req.body; 
    console.log(oldPassword, newPassword, rewriteNewPassword);
    // kita ambil passwordHash lama dulu yang di disi di form changePassword
    const hashOldPassword = crypto.pbkdf2Sync(oldPassword, req.session.user.salt, 10000, 512, 'sha512').toString('hex'); // deskripsi hash password
    // kita samakan dengan passwordHash lama yang ada di database
    const isPasswordRight = hashOldPassword === req.session.user.passwordHash;

    // cek field password di form
    // kita validasi password baru
    if(newPassword.search(/[0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]/) == -1 || newPassword.length < 6 || newPassword !== rewriteNewPassword || isPasswordRight === false) {
        let message = '';
        // cek bagian mana yang error untk di kirim ke user
        if(newPassword.search(/[0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]/) == -1){
            message += ' Password baru harus ada angka ';
        }
        if(newPassword.length < 6){
            message += ' Password baru harus lebih dari 6 karakter ';
        }                    
        if(newPassword !== rewriteNewPassword){
            message += ' Password baru yang di tulis kembali TIDAK SAMA dengan password baru yang di tulis pertama kali ';
        }
        if(isPasswordRight === false) {
            message += 'Password lama anda SALAH'
        }

        res.statusCode = 402;
        res.render('setelanAkun', {message: message});
        // res.render('changePassword', {message: message});
    } else {
        // password baru lengkap baru ada dan lolos dalam validasi password
        try {
            // update username account
            const resultChageUserPassword = await changeUserPassword(req, newPassword);
            console.log(resultChageUserPassword);
            console.log(req.session.user._id);
            console.log('berhasil ubah password');
    
            // redirect ke rute login untk mengetes password baru
            res.redirect('/ourchatting/login');
        } catch(err) {
            // tangkap kesalahan saat update name ke dalam UserAccount collection
            console.error('Terjadi kesalahan saat mengubah password user ' + req.session.user._id + ' kedalam UserAccount collection yang di sebabkan oleh >> ', err);
            // next(err);
        }    
    }
}

// fungsi menampilkan view setelan akun
async function getSetelanAkun(req, res, next) {
    res.render('setelanAkun', {message: ''});
}

// fungsi untuk menghapus akun ourchatting user
async function postDeleteAkun(req, res, next) {
    const { password } = req.body;

    // kita ambil passwordHash dulu yang di disi di form delete_akun
    const hashPassword = crypto.pbkdf2Sync(password, req.session.user.salt, 10000, 512, 'sha512').toString('hex'); // deskripsi hash password
    // kita samakan dengan passwordHash lama yang ada di database
    const isPasswordRight = hashPassword === req.session.user.passwordHash;

    // cek password yang ditulis
    if(isPasswordRight === false) {
        // user salah memasukan password
        // akun tidak bisa di hapus
        res.render('setelanAkun', {message: 'Password Anda Salah'});
    } else {
        // passowrd benar
        try{
            // proses penghapus akun ourchatting user di dalam database dan repositorinya
            const resultDeleteUserAccount = await deleteUserAccount(req);
            console.log(req.session.user._id);
            console.log('berhasil di delete akun');
            console.log(resultDeleteUserAccount);
	            
            // redirect ke halaman utama ourchatting
            res.redirect('/ourchatting');
        } catch(err) {
            console.error('Terjadi error saat menghapus akun user ' + req.session.user._id + ' yang di sebabkan oleh >> ' + err);
            // next(err);
        }
     }

}

// fungsi untk menampilkan profile teman di ourchatting yang dipilih berdasarkan _id nya
async function getProfileTeman(req, res, next) {
    try {
        // kita ambil data account user di dalam database
        const otherUserProfileAccount = await getOtherUserProfile(req.params.id);
        // kita render ke view otherUserProfile dengan memberikan data berupa
        // nama, email, bio, fotoProfile
        res.render('otherUserProfile', {name: otherUserProfileAccount.name, email: otherUserProfileAccount.email, bio: otherUserProfileAccount.bio, fotoProfile: otherUserProfileAccount.fotoProfile.path});
    } catch(err) {
    	res.status(404).send('404 PAGE NOT FOUND');
        console.error('Terjadi error saat menampilkan profile ' + req.params.id + ' yang di sebabkan oleh >> ' + err);
        // next(err);
    }
}

module.exports = {
    postUploadUserImageProfile,
    postUpdateUserName,
    postUpdateUserBio,
    postChangePassword,
    postDeleteAkun,
    getHome,
    getUserProfile,
    getUserTeman,
    getFeedback,
    getUserLogout,
    getAbout,
    getProfileTeman,
    getContact,
    getSetelanAkun,
    checkUserSession
};