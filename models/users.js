// Collection ini hanya digunakan untuk menampung document berupa pengguna yang telah terdaftar di OurChatting(nama,email,passwordSalt,passwordHash).
// digunakan untuk menge-track seluruh akun yang terdaftar di ourchatting

const mongoose = require('mongoose');
const crypto = require('crypto'); 

const { Schema } = mongoose;

const usersSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    created:{
        type: Date,
        default: Date.now
    }
});

const users = mongoose.model('Users', usersSchema);

module.exports = users;