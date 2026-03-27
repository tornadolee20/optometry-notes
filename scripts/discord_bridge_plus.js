require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 使用 chatgpt 庫的 Unofficially maintained proxy API
// 這是「大叔價值模式」的核心
let ChatGPTUnofficialProxyAPI;
try {
    const chatgpt = require('chatgpt');
    ChatGPTUnofficialProxyAPI = chatgpt.ChatGPTUnofficialProxyAPI;
} catch (e) {
    console.error("❌ 找不到 chatgpt 套件，請確保已執行 npm install chatgpt");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

// 頻道與專家身份的映射表
const CHANNEL_MAP = {
    [process.env.CHANNEL_ID_ATLAS]: 'atlas.md',
    [process.env.CHANNEL_ID_APOLLO]: 'apollo.md',
    [process.env.CHANNEL_ID_HERMES]: 'hermes.md',
};

// 儲存對話上下文 (Thread)
const conversationCache = new Map();

let api;

async function initAI() {
    console.log("🛠️  正在啟動「Plus 價值模式」大腦...");
    
    // 注意：Session Token 用法通常需要搭配反向代理 (Reverse Proxy)
    // 這裡我們暫用一個常見的開源反向代理，或是請大叔確認龍蝦使用的 Proxy
    api = new ChatGPTUnofficialProxyAPI({
        accessToken: process.env.CHATGPT_SESSION_TOKEN, // 這裡暫時用 Session Token 當 Access Token，部分代理支援
        apiReverseProxyUrl: 'https://ai.fakeopen.com/api/conversation', // 這是一個常見的代理
        model: 'gpt-4'
    });
}

client.once('ready', async () => {
    await initAI();
    console.log(`✅ 賈維斯「價值模式」已完全覺醒！端點：賈維斯#9644`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const personaFile = CHANNEL_MAP[message.channel.id];

    if (personaFile) {
        console.log(`💬 收到大叔指令於頻道: ${message.channel.name}`);
        
        const personaPath = path.join(__dirname, '..', 'avatars', personaFile);
        
        try {
            await message.channel.sendTyping();
            
            const personaContent = fs.readFileSync(personaPath, 'utf-8');
            const systemPrompt = `你現在是目鏡大叔集團的專家成員。以下是你的身份設定：\n\n${personaContent}\n\n請根據此設定回覆大叔的指令。請使用台灣繁體中文。`;

            // 取得先前的對話 ID 實現連貫聊天
            const prevContext = conversationCache.get(message.channel.id) || {};

            const res = await api.sendMessage(message.content, {
                ...prevContext,
                // 注意：Unofficial 模式下 system message 處理各異
                // 這裡嘗試在每則訊息前注入人格
                promptPrefix: systemPrompt + "\n\n現在大叔說：",
            });

            // 儲存此次對話狀態
            conversationCache.set(message.channel.id, {
                conversationId: res.conversationId,
                parentMessageId: res.id
            });

            // 回傳結果
            if (res.text.length > 1900) {
                const parts = res.text.match(/[\s\S]{1,1900}/g) || [];
                for (const part of parts) {
                    await message.reply(part);
                }
            } else {
                await message.reply(res.text);
            }
            
        } catch (err) {
            console.error(`AI 罷工了: ${err.message}`);
            message.reply(`❌ 抱歉大叔，價值模式連線故障：${err.message}\n(可能是 Session Token 過期或 Proxy 壅塞，請對我回報「鬼打牆」)`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
