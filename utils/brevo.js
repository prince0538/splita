const BrevoClient = require("@getbrevo/brevo");

const brevoClient = new BrevoClient.TransactionalEmailsApi()
brevoClient.setApiKey(BrevoClient.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const brevo = async (userEmail, userName, html) => {
    try {
        const sendSmtpEmail = new BrevoClient.SendSmtpEmail()
    const data = {
        htmlContent: `<html><head></head><body>
        <p>Hello ${userName} ,</p>Welcome to backend!.</p>
        </body>
        </html>`,
        sender: {
            email: "princewilludoigwe5@gmail.com",
            name: "Princewill from Splita",
        },
        subject: "Hello from Splita!",
    };
    sendSmtpEmail.to = [{
        email: userEmail
    }] 
    sendSmtpEmail.subject = data.subject
    sendSmtpEmail.htmlContent = html
    sendSmtpEmail.sender = data.sender
   
    await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
        console.log('Error sending email:', error);
    }
}

module.exports = {brevo}