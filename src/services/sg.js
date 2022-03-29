// import packages
const {default: axios} = require("axios");

// import config
const config = require("../config/index.js");

module.exports = {
    send: async(message) => {
        try {
            await axios.post("https://api.sendgrid.com/v3/mail/send",
                {
                    personalizations: [{
                        to: [{
                            email: message.to
                        }]
                    }],
                    from: {
                        email: message.from
                    },
                    subject: message.subject,
                    content: [
                        {
                            type: "text/plain",
                            value: message.text || ""
                        },
                        {
                            type: "text/html",
                            value: message.html || ""
                        }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${config.sg.key}`,
                        "Content-Type": "application/json"
                    }
                }
            );
        } catch(error) {
            console.error("send() - ", error);
        }
    }
};