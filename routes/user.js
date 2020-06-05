const express = require('express')
const router = express.Router();
const userController = require('../controller/appControllerUser');
const multer = require('../config/multer');


// rute user/profile  method get
// rute ini akan menampilkan view profile user. untuk menggunakan rute ini, user sudah login di applikasi 
router.get('/profile', userController.checkUserSession ,(req, res, next) => {
    userController.getUserProfile(req, res, next);
});

// rute login method get
// rute ini akan digunakan untk logout user dari applikasi. untuk menggunakan rute ini, user sudah login di applikasi. rute ini tidak menampilkan views 
router.get('/logout', userController.checkUserSession , (req, res, next) => {
    userController.getUserLogout(req, res, next);
});

// rute home method get
// rute ini akan menampilkan tampilan room chatting/view room milik akun user. untuk menggunakan rute ini, user sudah login di applikasi. 
// di rute inilah socket.io(websocket) mulai berjalan
router.get('/home', userController.checkUserSession ,(req, res, next) => {
    console.log('get home');
    userController.getHome(req, res, next);
});

// rute about method get
// rute ini akan menampilkan view about. untuk menggunakan rute ini, user sudah login di applikasi. 
router.get('/about', userController.checkUserSession ,(req, res, next) => {
    userController.getAbout(req, res, next);
});
  
// rute contact method get
// rute ini akan menampilkan view contact. untuk menggunakan rute ini, user sudah login di applikasi. 
router.get('/contact', userController.checkUserSession ,(req, res, next) => {
    userController.getContact(req, res, next);
});

// rute feedback method get
// rute ini akan menampilkan view feedback. untuk menggunakan rute ini, user sudah login di applikasi. 
router.get('/feedback', userController.checkUserSession ,(req, res, next) => {
    userController.getFeedback(req, res, next);
});

// rute online method get
// rute ini akan menampilkan view online. untuk menggunakan rute ini, user sudah login di applikasi. 
router.get('/teman', userController.checkUserSession ,(req, res, next) => {
    userController.getUserTeman(req, res, next);
});

// rute upload_image_profile method post
// rute ini akan mengupload foto profile user. untuk menggunakan rute ini, user sudah login di applikasi
router.post('/upload_image_profile',  userController.checkUserSession , multer.upload.single("file") ,(req, res, next) => {
    userController.postUploadUserImageProfile(req, res ,next);
});

// rute update/name method post
// rute ini akan mengubah nama  account user. untuk menggunakan rute ini, user sudah login di applikasi
router.post('/update/name', userController.checkUserSession, (req, res, next) => {
    userController.postUpdateUserName(req, res ,next);
});

// rute update/bio method post
// rute ini akan mengubah bio  account user. untuk menggunakan rute ini, user sudah login di applikasi
router.post('/update/bio', userController.checkUserSession ,(req, res, next) => {
    userController.postUpdateUserBio(req, res ,next);
});

// rute change/password method post
// rute ini akan mengubah password lama user. untk menggunakan rute ini, user sudah login di applikasi
router.post('/change/password', userController.checkUserSession, (req, res, next) => {
    userController.postChangePassword(req, res, next);
});

// rute setelan_akun method get
// rute ini akan menampilkan view setelanAkun.ejs. untuk menggunakan rute ini user sudah login di applikasi
router.get('/setelan_akun', userController.checkUserSession, (req, res, next) => {
    userController.getSetelanAkun(req, res, next);
});

// rute delete_akun method post
// rute ini akan memproses untuk penghapusan akun ourchatting. untuk menggunakan rute ini user sudah login di applikasi
router.post('/delete_akun', userController.checkUserSession, (req, res, next) => {
    userController.postDeleteAkun(req, res, next);
});

// rute daftar_teman:id method get
// rute ini akan menampilkan view profile dari teman ourchatting, yang di pilih sesuai parameter id. untuk menggunakan rute ini user sudah login di applikasi
router.get('/daftar_teman/:id', userController.checkUserSession, (req, res, next) => {
    console.log(req.params.id);
    userController.getProfileTeman(req, res, next);
});


module.exports = router;