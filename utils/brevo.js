const BrevoClient = require("@getbrevo/brevo");

const brevoClient = new BrevoClient.TransactionalEmailsApi()
brevoClient.setApiKey(BrevoClient.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)
const brevo = async (userEmail, userName, html, subject = "Hello from Splita!") => {
    try {
        const sendSmtpEmail = new BrevoClient.SendSmtpEmail()
        sendSmtpEmail.to = [{
            email: userEmail,
            name: userName
        }]
        sendSmtpEmail.subject = subject
        sendSmtpEmail.htmlContent = html
        sendSmtpEmail.sender = {
            email: "princewilludoigwe5@gmail.com",
            name: "Princewill from Splita",
        }
   
        await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
        console.log('Error sending email:', error);
    }
}

module.exports = {brevo}