const mongoose = require('mongoose');
const crypto = require('crypto'); 

const { Schema } = mongoose;

const serverSchema = new Schema({   
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },   
});

// Setting UsersSchema untuk methods setPassword
// (ENCRYPTION PASSWORD)
usersSchema.methods.setPassword = function(password) {
    this.passwordSalt = crypto.randomBytes(16).toString('hex'); // buat salt untuk password user
    this.passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 10000, 512, 'sha512').toString('hex'); // buat hash dengan tipe sha512 untuk password yang sudah di campur salt
};

// setting UsersSchema untuk methods validasiPassword
// (DESCRYPTION PASSWORD)
usersSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.passwordSalt, 100000, 512, 'sha512').toString('hex'); // deskripsi hash password

    return this.passwordHash === hash; // kembalikan true jika password valid, atau false jika password invalid
}

const user = mongoose.model('User', usersSchema);

module.exports = user;rver = mongoose.model('Server', serverSchema );
module.exports = server;