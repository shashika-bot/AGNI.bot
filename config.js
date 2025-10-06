const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "LZ5iEKCI#42yqQY7VbVE1VBINRG_2M-SzhK0wKEOgujQJF5Qd6Fc", 
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/ue4ppc.jpg",
ALIVE_MS: process.env.ALIVE_MSG || "I'm Alive now",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true"
};
