'use strict';

const fs = require('fs');
const path = require('path');
const { cmd } = require('../arslan');

const DATA_DIR = path.join(__dirname, '../data');
const MODE_PATH = path.join(DATA_DIR, 'bot-mode.json');

const DEFAULT_SETTINGS = {
    mode: 'public'
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function loadMode() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        if (!fs.existsSync(MODE_PATH)) {
            fs.writeFileSync(
                MODE_PATH,
                JSON.stringify(DEFAULT_SETTINGS, null, 2)
            );

            return { ...DEFAULT_SETTINGS };
        }

        const data = JSON.parse(
            fs.readFileSync(MODE_PATH, 'utf8')
        );

        return {
            ...DEFAULT_SETTINGS,
            ...data,
            mode: ['public', 'private'].includes(data.mode)
                ? data.mode
                : 'public'
        };

    } catch (error) {
        console.error('[POPKID MODE] Load error:', error);
        return { ...DEFAULT_SETTINGS };
    }
}

function saveMode(settings) {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        fs.writeFileSync(
            MODE_PATH,
            JSON.stringify(settings, null, 2)
        );

        return true;
    } catch (error) {
        console.error('[POPKID MODE] Save error:', error);
        return false;
    }
}

const settings = loadMode();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MODE CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function isOwner(jid) {
    return Array.isArray(global.owners) &&
           global.owners.includes(jid);
}

function canUseBot(jid) {
    if (settings.mode === 'public') {
        return true;
    }

    return isOwner(jid);
}

/* Make mode available globally */
global.botMode = settings.mode;
global.canUseBot = canUseBot;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MODE COMMAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

cmd({
    pattern: "mode",
    name: "mode",
    category: "Admin",
    aliases: ["botmode"],
    description: "Switch bot between public and private mode",
    filename: __filename
}, async (sock, m, args) => {

    /* Only owners can change mode */
    if (!isOwner(m.sender)) {
        return;
    }

    const action = (args[0] || '').toLowerCase();

    /* ━━━━━━━━━━━━━━━━━━━━━━━
       STATUS
    ━━━━━━━━━━━━━━━━━━━━━━━ */

    if (!action || action === 'status') {

        return m.reply(`┏▣ ◈ *𝗣𝗢𝗣𝗞𝗜𝗗 𝗠𝗢𝗗𝗘* ◈
┃
┃⚙️ *𝗖𝗨𝗥𝗥𝗘𝗡𝗧* : ${settings.mode.toUpperCase()}
┃
┃${settings.mode === 'public'
    ? '🌐 *Everyone can use the bot.*'
    : '🔒 *Only owners can use the bot.*'}
┃
┃➽ .mode public
┃➽ .mode private
┃➽ .mode status
┃
┗▣`);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━
       PUBLIC
    ━━━━━━━━━━━━━━━━━━━━━━━ */

    if (action === 'public') {

        settings.mode = 'public';

        saveMode(settings);

        global.botMode = 'public';

        return m.reply(`┏▣ ◈ *𝗣𝗢𝗣𝗞𝗜𝗗 𝗠𝗢𝗗𝗘* ◈
┃
┃🌐 *𝗣𝗨𝗕𝗟𝗜𝗖 𝗠𝗢𝗗𝗘*
┃
┃🟢 *𝗦𝗧𝗔𝗧𝗨𝗦* : 𝗘𝗡𝗔𝗕𝗟𝗘𝗗
┃➽ Everyone can use the bot.
┃
┗▣`);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━
       PRIVATE
    ━━━━━━━━━━━━━━━━━━━━━━━ */

    if (action === 'private') {

        settings.mode = 'private';

        saveMode(settings);

        global.botMode = 'private';

        return m.reply(`┏▣ ◈ *𝗣𝗢𝗣𝗞𝗜𝗗 𝗠𝗢𝗗𝗘* ◈
┃
┃🔒 *𝗣𝗥𝗜𝗩𝗔𝗧𝗘 𝗠𝗢𝗗𝗘*
┃
┃🔴 *𝗦𝗧𝗔𝗧𝗨𝗦* : 𝗘𝗡𝗔𝗕𝗟𝗘𝗗
┃➽ Only owners can use the bot.
┃
┗▣`);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━
       INVALID
    ━━━━━━━━━━━━━━━━━━━━━━━ */

    return m.reply(`┏▣ ◈ *𝗣𝗢𝗣𝗞𝗜𝗗 𝗠𝗢𝗗𝗘* ◈
┃
┃❌ *𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗠𝗢𝗗𝗘*
┃
┃➽ .mode public
┃➽ .mode private
┃➽ .mode status
┃
┗▣`);
});


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EXPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

module.exports = {
    getMode: () => settings.mode,

    setMode: (mode) => {
        if (!['public', 'private'].includes(mode)) {
            return false;
        }

        settings.mode = mode;
        global.botMode = mode;

        return saveMode(settings);
    },

    canUseBot
};
