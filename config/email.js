const nodemailer = require('nodemailer');
 
module.exports = function(credentials) {
    let mailTransport = nodemailer.createTransport({//'SMTP',{
        service: 'gmail', // Email Service
        auth: {
            user: 'Genjitapaleuk@gmail.com', // YOUR EMAIL
            pass: 'Dendimara' // YOUR PASSWORD EMAIL
        }
    });

    const from = '"OurChatting Team" <Genjitapaleuk@gmail.com>';
    const errorRecipient = 'genjitapaleuk@gmail.com';

    return {
        send: (to, subj, body) => (new Promise((resolve, reject) => {
                mailTransport.sendMail({
                    from: from,
                    to: to,
                    subject: subj,
                    html: body,
                    generateTextHtml: true
                },(err, info) => {
                    if(err) {
                        reject(err);
                    } else{
                        resolve(info);
                    }    
                });
            })),            
        emailError: function(message, filename, exception) {
            const body = '<h1> OurChatting Team Site Error' + 'message:<br><pre>' + message + '</pre><br>';
            if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
            if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';

            mailTransport.sendMail({
                from: from,
                to: errorRecipient,
                subject: 'OurChatting Site Error',
                html: body,
                generateTextHtml: true
            }, function(err) {
                if(err) return err; // console.error('Unable to send email: ' + err);
                 
            });           
        }
    }
}

 /**
 * USAGE: 
 * 
 *  const mailService = require('email)({userMail: 'yourmail@gmail.com', userPasswordMail: 'youpasswordmail'});
 * 
 * // send a message
 * // send(to, subj)
 * mailService.send('client@gmail.com', 'hay client this your server email service');
 * 
 */