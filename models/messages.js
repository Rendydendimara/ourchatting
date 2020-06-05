// Collection ini hanya digunakan untuk menampung document berupa pesan(name,profile,message,date) yang di lakukan oleh seluruh pengguna
// digunakan untk menge-track seluruh pesan yang di terjadi di ourchatting

const mongoose = require('mongoose');
 
const { Schema } = mongoose;

const messagesSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAccount'
    },
    message: {
        type: String
    },
    date :{
        type: Date,
        default: Date.now()
    }   
});

const messages = mongoose.model('Messages', messagesSchema);
module.exports = messages;