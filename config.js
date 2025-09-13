const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "Manu-MD&zN8UwDrL#NLdvwhJ3yn5DBgKw2s0eMYB72NDlmQ-ORHh0cNGK7WQ", 
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/ue4ppc.jpg",
ALIVE_MS: process.env.ALIVE_MSG || "I'm Alive now"
};
