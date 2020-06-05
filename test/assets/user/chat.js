// Make connection in front-end side
// Socket running in front-end
// koneksi socket ke localhost port 8000
var socket = io.connect('http://localhost:8000');

// Handle Query DOM 
var pesan = document.getElementById('message');
const namaPengguna = document.getElementById('handle');
var	btn = document.getElementById('send');	
var	output = document.getElementById('output');	
var feedback = document.getElementById('feedback');

// handle time
let time = new Date();
let timeNow = String(time.getHours())+":"+String(time.getMinutes())+":"+String(time.getSeconds());

// variabel yang di gunakan untk mengambil user yang pertama kali login
let firstTime = true;
// variabel yang menyimpan nama asli user yang pertama kali login
let trueName = ''; 

// jika user pertama kali login
if(firstTime === true){
	trueName = namaPengguna.value; // ambil nama asli user saat pertama kali login
	firstTime = false; // hentika cek user pertama kali login
}

 
// Emit events
// dengar event
// event ketika tombol send di tekan
btn.addEventListener('click',()=>{
	alert(name);
	// kirim data socket front-end ke socket back-end/server dengan fungsi emit
	// emit(namaEventYangAkanMenghandle,dataYangDiKirim)
	// parameter 1, nama event yang akan di handle socket di sisi back-end
	// parameter 2, data socket yang akan dikirm ke socket back-end
	let data_socket = {
		message: String(pesan.value),
		handle: trueName,
		time: timeNow
	}
	socket.emit('chat',data_socket);

	pesan.value = " ";

	document.getElementById('handle').value = trueName;
});

// // saat pengguna sedang menulis pesan
// message.addEventListener('keypress',()=>{
// 	// kirim ke socket back-end lewat event typing
// 	// kirim data berupa nama pengguna yang sedang menulis pesan.
// 	socket.emit('typing',trueName);
// });

// Listen for events
// dengar event chat di socket front-end dimana socket back-end akan mengirim ke socket front-end sesuai event

// socket back-end akan mengrim data berupa nama pengguna dan pesannya ke socket front-end untuk di cetak
socket.on('chat',(data)=>{
	feedback.innerHTML = "";
	// cetak isi pesan yang dikirim ke front-end
	output.innerHTML += '<p><strong>' + data.handle + ' : </strong>' + data.message + '</p>';

});

// handle event typing
socket.on('typing',(data)=>{
	feedback.innerHTML = '<p><em>' + data + ' sedang menulis pesan...</em></p>';
});

function sedangKetik(){
	// kirim ke socket back-end lewat event typing
	// kirim data berupa nama pengguna yang sedang menulis pesan.
	socket.emit('typing', trueName);
}

// handle ketika socket/client disconnect
if(socket.disconnect){
	// beritahu server
	socket.emit('disconnect');
}
 