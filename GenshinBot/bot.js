const Discord = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const client = new Discord.Client();
const reminders = new Map(); // Store reminders in a Map, using Discord user ID as the key

client.once('ready', () => {
    console.log('Ready!');
});

client.login('INSERT YOUR TOKEN HERE');

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
                    if (code.toLowerCase() === "genshingift") {
                        return false; // break the loop
                    }
                });

                // Reply with the list of codes
                if (codeList.length > 0) {
                    message.channel.send(`Here are the current Genshin Impact codes: ${codeList.join(', ')}`);
                } else {
                    message.channel.send('No valid codes found at the moment.');
                }
            })
            .catch(console.error);
    } else if (message.content.startsWith('/imjared')) {
        message.channel.send('Please confirm that you are Jared.');
        const collector = new Discord.MessageCollector(
            message.channel,
            (m) => m.author.id === message.author.id,
            { time: 10000 }
        );

        collector.on('collect', (msg) => {
            const uid = msg.content;
            if (uid === 'confirm') {
                message.channel.send('Praise be to you, our God, Jared!');
            } else {
                message.channel.send('You are not Jared, you are not our God');
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                message.channel.send('No response received. Command canceled.');
            }
        });
    } else if (message.content.startsWith('/remind')) {
        const [duration, reminderText] = parseReminder(message.content);
        if (duration) {
            const reminderTime = Date.now() + duration; // Calculate the timestamp
            reminders.set(message.author.id, { reminderTime, reminderText });
            const formattedDuration = formatDuration(duration);
            message.channel.send(`I will remind you to ${reminderText}, in ${formattedDuration}.`);
        } else {
            message.channel.send('Invalid reminder. Please specify a valid duration and message, e.g. "/remind 2h walk the dogs" or "/remind 30s drink water".');
        }      
    }
});


const checkRemindersInterval = 1000; // Check reminders every second

setInterval(() => {
    const currentTime = Date.now();
    // Iterate over the stored reminders
    for (const [userId, reminder] of reminders.entries()) {
        if (currentTime >= reminder.reminderTime) {
            const user = client.users.cache.get(userId); // Get the Discord user object using user ID
            if (user) {
                user.send(`Don't forget to ${reminder.reminderText}!`); // Send a direct message to the user
                reminders.delete(userId);
            }
        }
    }
}, checkRemindersInterval);

function parseReminderDuration(command) {
    const args = command.split(' ');
    if (args.length < 2) return null;

    const durationValue = parseInt(args[1]);
    if (isNaN(durationValue)) return null;

    const durationUnit = args[1].substring(durationValue.toString().length);
    if (durationUnit === 's') {
        return durationValue * 1000; // Convert seconds to milliseconds
    } else if (durationUnit === 'h') {
        return durationValue * 60 * 60 * 1000; // Convert hours to milliseconds
    }

    return null;
}

function parseReminder(command) {
    const args = command.split(' ');
    if (args.length < 3) return [null, null];

    const durationValue = parseInt(args[1]);
    if (isNaN(durationValue)) return [null, null];

    const durationUnit = args[1].substring(durationValue.toString().length);
    let duration;
    if (durationUnit === 's') {
        duration = durationValue * 1000; // Convert seconds to milliseconds
    } else if (durationUnit === 'h') {
        duration = durationValue * 60 * 60 * 1000; // Convert hours to milliseconds
    } else {
        return [null, null];
    }

    const reminderText = args.slice(2).join(' '); // Join all the remaining arguments as the reminder message
    return [duration, reminderText];
}

function formatDuration(duration) {
    const seconds = Math.floor(duration / 1000) % 60;
    const minutes = Math.floor(duration / 1000 / 60) % 60;
    const hours = Math.floor(duration / 1000 / 60 / 60);

    const formattedTime = [];
    if (hours > 0) {
        formattedTime.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        formattedTime.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }
    if (seconds > 0) {
        formattedTime.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
    }

    return formattedTime.join(', ');
}
