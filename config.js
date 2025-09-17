const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "1VUDVazC#B0N9V8Jl9XP9ZjsK3jV88Z8m-wNcGijdHwhlTILqJfA", 
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/ue4ppc.jpg",
ALIVE_MS: process.env.ALIVE_MSG || "I'm Alive now",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true"
};
