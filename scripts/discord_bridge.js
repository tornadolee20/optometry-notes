require('dotenv').config();
const { Client, GatewayIntentBits, Partials, WebhookClient } = require('discord.js');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 建立 Webhook 客戶端 (加入強效 trim 避免空白問題)
const webhookUrl = (process.env.DISCORD_WEBHOOK_URL || '').trim();
if (!webhookUrl) {
    console.error("❌ 找不到 DISCORD_WEBHOOK_URL，戰略會議室功能將無法運作。");
}

let webhookClient;
try {
    webhookClient = new WebhookClient({ url: webhookUrl });
} catch (err) {
    console.error("❌ Webhook URL 格式錯誤，嘗試解析 ID/Token...");
    const matches = webhookUrl.match(/webhooks\/(\d+)\/(.+)/);
    if (matches) {
        webhookClient = new WebhookClient({ id: matches[1], token: matches[2] });
        console.log("✅ 成功透過 ID/Token 喚醒 Webhook。");
    } else {
        console.error("❌ 無法解析 Webhook，會議室將進入罷工狀態。");
    }
}

// 專家身份定義清單連同頭像連結 (大叔以後可以換成喜歡的圖片)
const PERSONAS = [
    { 
        name: 'ATLAS 賽局戰略長', 
        file: 'atlas.md', 
        avatar: 'https://cdn-icons-png.flaticon.com/512/3665/3665922.png' // 戰略圖示
    },
    { 
        name: 'APOLLO 行銷主理人', 
        file: 'apollo.md', 
        avatar: 'https://cdn-icons-png.flaticon.com/512/1998/1998087.png' // 行銷圖示
    },
    { 
        name: 'HERMES 視覺敘事專家', 
        file: 'hermes.md', 
        avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' // 視覺圖示
    }
];

// 獨立頻道映射
const CHANNEL_MAP = {
    [process.env.CHANNEL_ID_ATLAS]: 'atlas.md',
    [process.env.CHANNEL_ID_APOLLO]: 'apollo.md',
    [process.env.CHANNEL_ID_HERMES]: 'hermes.md',
};

const WAR_ROOM_ID = process.env.CHANNEL_ID_WAR_ROOM;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

client.once('ready', () => {
    console.log(`🚀 視光總部「Webhook 視覺版」啟動！討論功能就緒。`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.webhookId) return;

    // 模式 A：獨立辦公室
    const personaFile = CHANNEL_MAP[message.channel.id];
    if (personaFile) {
        await handleSinglePersona(message, personaFile);
        return;
    }

    // 模式 B：戰略會議室 (多機客討論)
    if (message.channel.id === WAR_ROOM_ID) {
        await handleWarRoom(message);
    }
});

async function handleSinglePersona(message, personaFile) {
    try {
        await message.channel.sendTyping();
        const personaPath = path.join(__dirname, '..', 'avatars', personaFile);
        const personaContent = fs.readFileSync(personaPath, 'utf-8');
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: `你現在是目鏡大叔集團的專家成員 (${personaFile})。請根據此設定回覆。請使用台灣繁體中文。` },
                { role: "user", content: message.content }
            ],
        });
        await message.reply(completion.choices[0].message.content);
    } catch (err) {
        console.error(err);
    }
}

async function handleWarRoom(message) {
    let discussionHistory = [{ role: "user", content: `大叔提問：${message.content}` }];
    
    // 依序傳喚專家開會
    for (const persona of PERSONAS) {
        try {
            // 在頻道顯示「正在輸入中...」
            await message.channel.sendTyping();
            
            const personaPath = path.join(__dirname, '..', 'avatars', persona.file);
            const personaContent = fs.readFileSync(personaPath, 'utf-8');
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: `你是「目鏡大叔集團」的 ${persona.name}。
                    這是你的靈魂設定：\n${personaContent}\n
                    現在正在【戰略會議室】開會。請針對大叔的問題，以及前面專家的意見（如果有），提出你的專業觀點。
                    
                    ⚠️ 關鍵要求：
                    1. 展現你的專業風格，不要重複前面人說過的話。
                    2. 若前面人的意見有瑕疵，請客氣但專業地指出。
                    3. 保持對話感，要像是真的在開會討論。
                    4. 使用台灣繁體中文。回覆字數控制在 300 字內。` },
                    ...discussionHistory
                ],
            });

            const replyText = completion.choices[0].message.content;

            // 使用 Webhook 模擬不同分身發言
            await webhookClient.send({
                content: replyText,
                username: persona.name,
                avatarURL: persona.avatar,
            });
            
            // 將此專家的發言加入討論歷史，讓下一位能參考
            discussionHistory.push({ role: "assistant", content: `[${persona.name}]: ${replyText}` });
            
            // 稍作停頓，讓畫面更有節奏感
            await new Promise(resolve => setTimeout(resolve, 1500));
            
        } catch (err) {
            console.error(`專家 ${persona.name} 討論出錯:`, err);
        }
    }
}

client.login(process.env.DISCORD_TOKEN);
