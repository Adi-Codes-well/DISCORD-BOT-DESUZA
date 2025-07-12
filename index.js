require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  if (!content.startsWith("desuza")) return;

  const userPrompt = message.content.replace(/desuza/i, "").trim();
  if (!userPrompt) {
    return message.reply("Please provide a prompt after `desuza`.");
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemma-3n-e2b-it:free",
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.9,
        top_p: 0.95,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = response.data.choices[0].message.content;

    // Split long replies into chunks of 2000 characters
    const chunks = botReply.match(/[\s\S]{1,1999}(?=\n|$)/g);

    for (const chunk of chunks) {
      await message.channel.send(chunk);
    }
  } catch (error) {
    console.error(
      "❌ Error fetching LLaMA response:",
      error.response?.data || error.message
    );
    message.reply("Sorry, something went wrong while talking to LLaMA.");
  }
});

console.log(
  "🔑 Loaded Discord Token:",
  process.env.DIS_TOKEN?.slice(0, 10),
  "Length:",
  process.env.DIS_TOKEN?.length
);
client.login(process.env.DIS_TOKEN);
