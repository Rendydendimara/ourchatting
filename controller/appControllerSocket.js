const Messages = require('../models/messages');
const UsersAccount = require('../models/usersAccount');
const Users = require('../models/users');
const mongoose = require('mongoose');

let usersSesssion; // variabel ynag akun mengambil session user yang terhubung dengan socket
let usersOnline = []; // variabel array yang menampung user online

// fungsi mengsetting session user
let setUsersSession = (users) => {
    console.log('set session socket untuk user >> ' + users.session.user._id);
    usersSesssion = users.session.user;
}

// fungsi mengambil session user
const getUsersSession = () => {
    return usersSesssion;
}

// fungsi mengambil user online
const getUserOnline = () => {
    let userIdOnline = [];
    usersOnline.forEach((user) => {
        console.log('hhhh');
        console.log(user);
        userIdOnline.push(user.userEmail);
    });

    console.log(userIdOnline);
    return userIdOnline;
}

// fungsi untuk mencari sumber/user mana yang mengetik pesan
const findUserMessageAccount = (messages) => (new Promise((resolve, reject) => {
    UsersAccount.findById({_id: messages.user}, (err, user) => {
        if(err) reject(err);
        else {
            if(user === null) {
                // user belum memiliki pesan
                // resolve dengan object null
                resolve(null);
            } else {
                // resolve pesan yang di tulis user saat ini
                resolve({
                    id: messages.user,
                    name: user.name,
                    fotoProfile: user.fotoProfile.path,
                    message: messages.message,
                    date: messages.date.getHours() + ':' + messages.date.getMinutes()
                });    
            }
        }
    });
}));
 
// fungsi untuk mengambil seluruh log/database pesan yang terjadi  di dalam collection messages
const getAllLogMessages = () => (new Promise((resolve, reject) => {
    Messages.find(async (err, result) => {
        if(err) reject(err);
        else {
            // data array yang menampung seluh log message secara lebih lengkap(nama,fotoProfle)
            let usersMessages = [];
            // variabel sebagai titik akhir untuk di resolve jika sudah membaca seluruh log pesan
            let step = 0;
            await result.forEach( async(allMessage) => {
                let message = await findUserMessageAccount(allMessage);
                // jika pesan kosong
                if(message !== null) {
                    // jangan push daftar pesan
                    usersMessages.push(message);
                }
                step++;
                // jika sudah habis membaca seluruh pesan, kembalikan object pesan yang lengkap dengan indentitas pengrim pesan
                if(step === result.length){
                    resolve(usersMessages);
                }
            });
         }
    }).sort({date: 1});
}));

// fungsi untuk menambah document pesan ke dalam collection Messages
const insertMessagesToMessagesCollection = (message) => (new Promise((resolve, reject) => {
    message.save((err, result) => {
        if(err) reject(err);
        else resolve(result);
    });
}));

// fungsi untuk menambah document pesan ke dalam collection UserAccount
const pushMessageToUserAccount = (id, message) => (new Promise((resolve, reject) => {
    UsersAccount.updateOne(
        { _id: id,},
        {$push: {pesan: message}}, (err, result) => {
            if(err) reject(err);
            else resolve(result);
        }
    );
}));

 
// FUNGSI YANG MENGHANDLE SOCKET CLIENT-SERVER(MAIN SOCKET HANDLE)
const setSocket = (io) => {
    io.on('connection', async (client) => {
        let user = getUsersSession();
        // console.log(user);
        usersOnline.push({userId:user._id, userEmail: user.email, userSocketId: client.id});
        console.log(usersOnline);
        try{
        
            // ambil seluruh log messages yang ada di collection messages
            // kirim ke screem room user seluruh log pesan yang pernah terjadi pada saat socket terkoneksi
            // kirim lewat event emit getLogMessages
            client.on('getLogAllMessages', async () => {
                const messages = await getAllLogMessages();
                client.broadcast.emit('getLogAllMessages',{allMessages: messages, user: user._id});
                client.emit('getLogAllMessages',{allMessages: messages, user: user._id}); 
             });
            
            client.on('disconnect', () => {
                console.log('disconnect >> ', user._id);
                // hapus user dalam daftar user online
                usersOnline = usersOnline.filter((user) => {user.userSocketId != client.id });
            });

            // handle event on typing saat user sedang ketik pesan
            client.on('typing', () => {
                console.log('client typing ...');
                // kirim broadcast ke event typing saat user sedang mengetik pesan
                client.broadcast.emit('typing', {name: user.name, fotoProfile: user.fotoProfile.path, time: new Date().getHours() + ':' + new Date().getMinutes()});
                client.emit('typingToMyScreen',{name:user.name, fotoProfile: user.fotoProfile.path, message: 'Anda Sedang Mengetik...', time: new Date().getHours() + ':' + new Date().getMinutes()});
                console.log('typing ' + user.name);
            });
    
            // handle event on sendMessage saat user mengirimkan pesan
            client.on('sendMessage', async (message) => {
                try{
                    console.log('send message ' + user.name);
                    // set message object before insert to messages collection
                    let userMessage = new Messages({
                        _id: new mongoose.Types.ObjectId,
                        user: user._id,
                        message: message,
                        date: new Date()
                        });
                     
                    // goto insert pesan document into Message collection and UserAccount collection use Promise All
                    const resultToInsertMessageIntoMessageAndUserAccountCollection = await Promise.all([ insertMessagesToMessagesCollection(userMessage), pushMessageToUserAccount(user._id, message) ]);
                    console.log(resultToInsertMessageIntoMessageAndUserAccountCollection);

                    // kirim event sendMessage ke user itu sendiri 
                    client.broadcast.to(client.id).emit('sendMessageToMyScreen',{name:user.name, fotoProfile: user.fotoProfile.path, message: message, time: new Date().getHours() + ':' + new Date().getMinutes()}); 
                    // kirim event sendMessage broadcast 
                    client.broadcast.emit('sendMessageToEveryUsers',{name:user.name, fotoProfile: user.fotoProfile.path, message: message, time: new Date().getHours() + ':' + new Date().getMinutes()});
                    client.emit('sendMessageToMyScreen',{name:user.name, fotoProfile: user.fotoProfile.path, message: message, time: new Date().getHours() + ':' + new Date().getMinutes()});    
                } catch(err) {
                    console.error('terjadi error saat menambah document pesan kedalam Messages Collection yang di sebabakan oleh >> ', err);
                }
            });
        } catch(err) {
            // tangkap error saat melakukan opreasi database/socket
            console.error('Terjadi error saat melakukan operasi database/socket yang di sebabkan oleh >> ', err);
        }
    });
};

module.exports =  {
    setSocket,
    setUsersSession,
    getUserOnline
};