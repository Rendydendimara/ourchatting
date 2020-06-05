const router = require('express').Router();
const controller = require('../controller/appController');
 
// rute root method get
// rute ini merupakan rute root yang akan menampilkan halamant utama applikasi our chatting
router.get('/', (req, res, next) => {
    controller.getRoot(req, res, next);
});

// rute signup method get
// rute ini akan menampilkan view singup
router.get('/signup', (req, res, next) => {
    controller.getSignup(req, res, next);
});

// rute login method get
// rute ini akan menampilkan view login
router.get('/login', (req, res, next) => {
    controller.getLogin(req, res, next);
});

// rute verification method get.
// menampilkan view verification. untuk menggunakan rute ini req.body harus berisi data user yang mau di buatkan akunnya berupa nama,password,dan email
router.get('/signup/verification', controller.getReqBodyNewUser, (req, res, next) => {
    controller.getVerification(req, res, next);
});

// rute gettoken verification
// rute ini akan membuat dan mengirimkan token 5 digit angka ke email akun user yang diingin dibuat. setelah itu pergi ke rute /verification method GET
router.get('/signup/verification/gettoken', controller.getReqBodyNewUser, (req, res, next) => {
    controller.getVerificationToken(req, res, next);
});

// rute login method post
// rute ini digunakan untuk mengambil data FORM login kemudian memerikasa dan melakukan pencarian user di database user. kalau user ada maka pergi ke rute /ourchatting/home method GET. 
// jika user tidak ada di dalam database user atau data FORM tidak lengkap/tidak benar pergi ke rute /login method GET sambil memberikan pesan Error kepada user
router.post('/login', (req, res, next) => {
    controller.postLogin(req, res, next);
});

// rute signup method post
// rute ini digunakan untuk mengambil data FORM signup kemudian memeriksa dan membuat akun untuk user.
// jika data FORM tidak lengkap/tidak benar/email yang mau didaftarkan sudah di gunakan oleh akun lain maka pergi ke rute signup method GET sambil memberikan pesan error ke user
router.post('/signup', (req, res, next) => {
    controller.postSignup(req, res, next);
});

// rute verification method post
// rute ini digunakan untuk melakukan verifikasi token pembuatan akun user. rute ini akan mengambil FORM verification token. 
// jika data form token tidak sama/kurang/tidak benar dengan token yang telah di kirimkan ke akun user maka pergi ke rute verivication method GET sambil memberikan pesan error
// jika token benar maka buatkan akun dan database untuk user kemudian pergi ke rute ourchatting/home method GET
router.post('/verification', controller.getReqBodyNewUser, (req, res, next) => {
    controller.postVerifcation(req, res, next);
});

// rute about method get
// rute ini akan menampilkan view about applikasi. untuk menggunakan rute ini, user sudah login di applikasi 
router.get('/about', (req, res, next) => {
    controller.getAbout(req, res, next);
});

// rute login method get
// rute ini akan menampilkan view contact si pemilik applikasi. untuk menggunakan rute ini, user sudah login di applikasi 
router.get('/contact', (req, res, next) => {
    controller.getContact(req, res, next);
});

// rute feedback method get
// rute ini akan menampilkan view feedback applikasi. untuk menggunakan rute ini, user sudah login di applikasi 
router.get('/feedback', (req, res, next) => {
    controller.getFeedback(req, res, next);
});

module.exports = router;