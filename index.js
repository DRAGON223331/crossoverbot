require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require('discord.js');
const fs = require('fs');

// ─── Client Setup ────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel],
});

const PREFIX = '!';
const CONFIG_PATH = './config.json';

// ─── Config (channel settings per guild) ─────────────────────────────────────
let config = fs.existsSync(CONFIG_PATH)
  ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
  : {};

const saveConfig = () =>
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

// ─── Shared State ─────────────────────────────────────────────────────────────
client.games = new Map(); // All active games stored here
client.config = config;
client.saveConfig = saveConfig;

// ─── Load Games ───────────────────────────────────────────────────────────────
const xo    = require('./games/xo');
const rps   = require('./games/rps');
const logos = require('./games/logos');
const flags = require('./games/flags');

// ─── Ready ────────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅  CrossOver v1.0 جاهز — ${client.user.tag}`);
  client.user.setActivity('!help | CrossOver 🎮', { type: 3 });
});

// ─── Message Handler ──────────────────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const guildId   = message.guild.id;
  const channelId = message.channel.id;

  // ── Text-answer games (Logos & Flags) ──────────────────────────────────────
  if (!message.content.startsWith(PREFIX)) {
    const logosGame = client.games.get(`logos_${guildId}_${channelId}`);
    const flagsGame = client.games.get(`flags_${guildId}_${channelId}`);

    if (logosGame?.waitingForAnswer) logos.handleAnswer(message, logosGame, client);
    if (flagsGame?.waitingForAnswer) flags.handleAnswer(message, flagsGame, client);
    return;
  }

  // ── Prefix commands ────────────────────────────────────────────────────────
  const args    = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  // Channel restriction (skip for setchannel / help)
  const guildConfig = config[guildId] || {};
  if (!['setchannel', 'help'].includes(command) && guildConfig.gameChannel && channelId !== guildConfig.gameChannel) {
    const reply = await message.reply(`🎮 العب في <#${guildConfig.gameChannel}> !`);
    setTimeout(() => reply.delete().catch(() => {}), 5000);
    return;
  }

  switch (command) {

    // ── Admin: set game channel ──────────────────────────────────────────────
    case 'setchannel':
      if (!message.member.permissions.has('ManageGuild'))
        return message.reply('❌ محتاج صلاحية **Manage Server**.');
      config[guildId] = { ...(config[guildId] || {}), gameChannel: channelId };
      saveConfig();
      return message.reply(`✅ تم تحديد <#${channelId}> كروم الألعاب!`);

    // ── Help ────────────────────────────────────────────────────────────────
    case 'help':
      return message.channel.send({ embeds: [helpEmbed()] });

    // ── Games ───────────────────────────────────────────────────────────────
    case 'xo':
      return xo.start(message, args, client);

    case 'rps':
      return rps.start(message, args, client);

    case 'logos':
      return logos.start(message, args, client);

    case 'flags':
    case 'أعلام':
      return flags.start(message, args, client);

    default:
      break;
  }
});

// ─── Button Interactions ──────────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const [type] = interaction.customId.split('_');

  try {
    if      (type === 'xo')    await xo.handleButton(interaction, client);
    else if (type === 'rps')   await rps.handleButton(interaction, client);
    else if (type === 'logos') await logos.handleButton(interaction, client);
    else if (type === 'flags') await flags.handleButton(interaction, client);
  } catch (err) {
    console.error('[Button Error]', err);
    if (!interaction.replied && !interaction.deferred)
      await interaction.reply({ content: '❌ حصل خطأ! حاول تاني.', ephemeral: true }).catch(() => {});
  }
});

// ─── Help Embed ───────────────────────────────────────────────────────────────
function helpEmbed() {
  return new EmbedBuilder()
    .setTitle('🎮 CrossOver — قائمة الألعاب')
    .setColor(0x6c5ce7)
    .setDescription('البرفكس: **`!`**')
    .addFields(
      { name: '❌⭕  XO',              value: '`!xo @mention` — تيك تاك تو',          inline: true  },
      { name: '✊✋✌️  حجر ورقة مقص', value: '`!rps @mention` — Rock Paper Scissors', inline: true  },
      { name: '🔤  Logos',             value: '`!logos` — خمّن الكلمة (2 لاعبين)',    inline: false },
      { name: '🏳️  أعلام',            value: '`!flags` — خمّن العلم',                inline: true  },
      { name: '⚙️  إعداد الروم',       value: '`!setchannel` — حدد روم الألعاب (أدمن فقط)', inline: false },
    )
    .setFooter({ text: 'CrossOver v1.0 • Made with ❤️' });
}

// ─── Login ────────────────────────────────────────────────────────────────────
client.login(process.env.TOKEN);
