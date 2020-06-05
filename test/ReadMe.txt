WHAT ARE WEBSOCKETS ? :
	- Commnunication between a client (browser) and server
	- Bidirectional (data flows both ways)
	- Allows real-time data flow

				  client
				    |
			   	    |
	clinet -------SERVER ------- client
					|
					|
				  client

USES OF WEBSOCKETS : 
	- Multiplayer browser game
	- Collaborative code editing
	- Live text for sports/news website
	- Online drawing canvas
	- Real-time-to-do apps with multiple users

// Using socket.io : 

				  client
				    |
			   	    |
	clinet -------SERVER ------- client
					|
					|
				  client

Kita gunakan socket.io di back-end dan front-end

// Emitting Message
// Mengirim data socket dari back-end ke front-end atau sebaliknya dengan melihat event socket dari kedua sisi


				    client
				  (socket.io)
				    |
			   	    |
	clinet -------SERVER --------client
  (socket.io)	(socket.io)	    (socket.io)
					|
					|
				  client
				(socket.io)

Server akan menghandle socket yang terkoneksi dari sisi front-end

// Brodcasting Message
// Server mengirim socket back-end pada setiap socket front-end / client
// contoh pada saat pengguna sedang menulis pesan, server mengirim pesan ke setiap client bahwa pengguna A sedang menulis pesan dan ketika pesan berhasil dikirim server berhenti mengirim pesan ke seluruh client bahwa pengguna A sedang menulis pesan
				  client
				(socket.io)
				    |
			   	    |
	clinet -------SERVER --------client
  (socket.io)	(socket.io)	    (socket.io)
					|
					|
				  client
				(socket.io)
