// socket clinet
const client = io.connect('http://localhost:8000');

// QUERY DOM
let userMessage = document.getElementById('message');
let userSendMessage = document.getElementById('button');
let userChatMessage = document.getElementById('logMessages');
var userChatMessageOnTyping = document.getElementById('messagesOnTyping');

// handle event on getLogAllMessages untuk menampilkan seluruh log pesan yang terjadi di ourchatting saat user mengkoneksikan socket pertama kali
client.emit('getLogAllMessages');
client.on('getLogAllMessages', (users) => {
//  console.log(users.allMessages);
    users.allMessages.forEach((messages) => {
        // jika pesan yang tulis adalah pesan user saat ini(client itu sendiri)
        if(messages.id === users.user) {
            // cetak pesan dengan tampilan bahwa user sekarang yang mengetik
            userChatMessage.innerHTML += `
            <div class="container-chat darker">
                <img src=` + messages.fotoProfile + ` width="5%" alt="Avatar" class="right" style="border-radius: 50%;">
                <p class="right" > ` + messages.name + ` </p> <hr>  
                <p class="right" > ` + messages.message + ` </p>  
                <span class="time-right">` + messages.date + `</span>
            </div>  
            `;
        } else {
            // cetak pesan dengan tampilan bahwa user lain yang mengetik
            userChatMessage.innerHTML += `
            <div class="container-chat">
                <img src=` + messages.fotoProfile  + ` width="5%" alt="Avatar" style="border-radius: 50%;">
                <p>` + messages.name + ` </p> <hr> 
                <p>` + messages.message + ` </p> 
                <span class="time-right">` + messages.date + `</span>
            </div>  
            `;
        }
    });
});

// handle user disconnect
if(client.disconnect) {
    // console.log('dis');
    client.emit('disconnect');
}

// handle saat ada user yang sedang mengetik pesan
userMessage.addEventListener('click', () => {
    userSendMessage.innerHTML = `
        <div class="input-group-prepend" style="margin-top: 4%; margin-bottom: 3%">
            <!-- class fa fa-user adalah ikon lambang user dari Font Awesome -->
            <div class="input-group-text" id="sendMessage" class="send">
                <div class="fas fa-paper-plane fa-lg" style="color: gray;"></div>    
            </div>
        </div>`
        
    client.emit('typing');
});

// terima event dari server saat client sedang mengetik pesan
client.on('typing', (user) => {
    userChatMessageOnTyping.innerHTML = `
    <div class="container-chat">
        <img src=` + user.fotoProfile + ` alt="Avatar" style="border-radius: 50%; width :5%;">
        <p>` + user.name + ` Sedang Menulis Pesan...</p> 
        <span class="time-right">` + user.time + `</span>
    </div>
    `;
});

// terima event dari server saat saya/user saat ini sedang mengetik pesan
client.on('typingToMyScreen',(user) => {
    userChatMessageOnTyping.innerHTML = `
    <div class="container-chat">
        <img src=` + user.fotoProfile + ` alt="Avatar" class="right" style="border-radius: 50%; width: 5%;">
        <p class="right">` + user.message + ` </p> 
        <span class="time-right">` + user.time + `</span>
    </div>
    `;
});

// handle event emmit saat user mengrimkan pesan
userSendMessage.addEventListener('click', () => {
    userChatMessageOnTyping.innerHTML = " ";
    userSendMessage.innerHTML = ' ';
    // ambil pesan yang di ketiek
    const messsage = userMessage.value;
    // kirim event ke socket server dengan data pesan yang di ketik user
    client.emit('sendMessage',messsage);    
    userMessage.value = ' ';
});

// handle event on sendMessage saat user mengrimkan pesan dan untuk menampilkan ke user lain
client.on('sendMessageToEveryUsers',(user) => { 
    userChatMessageOnTyping.innerHTML = " ";
    userChatMessage.innerHTML += `
    <div class="container-chat">
        <img src=` + user.fotoProfile + ` width="5%" alt="Avatar" style="border-radius: 50%;">
        <p>` + user.name + ` </p> <hr> 
        <p>` + user.message + ` </p> 
        <span class="time-right">` + user.time + `</span>
    </div>  
    `;
});

// handle event on sendMessage saat user mengrimkan pesan dan untuk menampilkan ke user itu sendiri
client.on('sendMessageToMyScreen',(user) => {
    userChatMessageOnTyping.innerHTML = " ";
    userChatMessage.innerHTML += `
    <div class="container-chat darker">
        <img src=` + user.fotoProfile + ` width="5%" alt="Avatar" class="right" style="border-radius: 50%;">
        <p class="right" > ` + user.name + ` </p> <hr>  
        <p class="right" > ` + user.message + ` </p>  
        <span class="time-right">` + user.time + `</span>
    </div>  
    `;
});
 
 
