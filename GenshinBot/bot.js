const Discord = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});

client.login('MTEwOTIzMzI5NTI0NzU2MDg0OA.Gu9TLY.RqZ9DH6vnaOkDY3vZ7IlVSnPEtNaL9pG5OPqx4');

client.on('message', (message) => {
    if (message.author.bot) return; // Ignore messages from bots
    if (message.content.startsWith('/scancodes')) {
        message.channel.send('Scanning for codes...');
        // logic to scan web for codes

        const url = "https://genshin-impact.fandom.com/wiki/Promotional_Code";

        axios.get(url)
            .then(response => {
                const html = response.data;
                const $ = cheerio.load(html);
                const codeList = [];

                // look for the specific HTML element(s) containing the codes.

                $('b > code').each(function(_, element) {
                    const code = $(element).text();
                    codeList.push(code);

                    // break after finding GENSHINGIFT - last code
                    if(code.toLowerCase() === "genshingift"){
                        return false; // break the loop
                    }
                });

                // Reply with the list of codes
                if (codeList.length > 0){
                    message.channel.send(`Here are the current Genshin Impact codes: ${codeList.join(', ')}`);
                } else {
                    message.channel.send('No valid codes found at the moment.');
                }
            })
            .catch(console.error);
    }
});
