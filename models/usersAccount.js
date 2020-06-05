// Collection ini hanya digunakan untuk menampung document berupa informasi tentang akun milik user(nama,email,salt,passwordHash,pesan,foto profile).
// digunakan untuk menge-track akun user lebih detail

const mongoose = require('mongoose');
const crypto = require('crypto'); 

const { Schema } = mongoose;

const userAcccountSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    salt:{
        type: String,
        required: true
    } ,
    pesan: Array,
    fotoProfile: {
        path: String,
        contentType: String,
  //      imgBuf: Buffer
    },
    bio: {
        type: String
    },
    created:{
        type: Date,
        default: Date.now
    }
});

// Setting UsersSchema untuk methods setPassword
// (ENCRYPTION PASSWORD)
userAcccountSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex'); // buat salt untuk password user
    this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex'); // buat hash dengan tipe sha512 untuk password yang sudah di campur salt
};

// setting UsersSchema untuk methods validasiPassword
// (DESCRYPTION PASSWORD)
// userAcccountSchema.methods.validatePassword = function(password) {
//     const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex'); // deskripsi hash password

//     return this.passwordHash === hash; // kembalikan true jika password valid, atau false jika password invalid
// }

const userAccount = mongoose.model('UserAccount', userAcccountSchema);

module.exports = userAccount;