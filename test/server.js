const mongoose = require('mongoose');
const { Schema } = mongoose;

const serverSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    users: {
        type: Array
    },
    pesan: {
        type: Array
    },

});

const server = mongoose.model('Server', serverSchema );
module.exports = server;