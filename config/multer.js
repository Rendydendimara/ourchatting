const multer = require('multer');

// reqular expression untuk mendapatkan ektensi sebuah file
const fileExtensionPattern = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi;

// set storage file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'users/' + req.session.user._id + '/ImageProfile');
    },
    filename: (req, file, cb) => {
        const newFileName = new Date().getTime() + ':' + req.session.user._id + file.originalname.match(fileExtensionPattern)[0];
        cb(null, newFileName);
    }
});

// set upload file
const upload = multer({
    storage: storage,
    // filter file upload
    // hanya menerima file .jpg, .png, .jpeg, .gif
    fileFilter: (req, file, cb) => {
        if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif') {
            // file berupa gambar
            cb(null, true);
        } else {
            // file bukan gambat
            // tidak upload, kembalikan pesan kesalahan
            cb(null, false);
            return cb(new Error('File harus berupa .jpg, .png, .jpeg, .gif'));
        }
    }
});

module.exports = {
    upload
}

