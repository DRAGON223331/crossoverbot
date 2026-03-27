// games/rps.js — Rock Paper Scissors (حجر ورقة مقص)
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const LABELS = { rock: '✊ حجر', paper: '✋ ورقة', scissors: '✌️ مقص' };
const BEATS  = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

// ─── Start ────────────────────────────────────────────────────────────────────
async function start(message, args, client) {
  const opponent = message.mentions.members?.first();
  if (!opponent)              return message.reply('❌ ذكر خصمك! مثال: `!rps @player`');
  if (opponent.id === message.author.id) return message.reply('❌ مش ممكن تلعب ضد نفسك!');
  if (opponent.user.bot)      return message.reply('❌ مش ممكن تلعب ضد بوت!');

  // gameId = guildId_timestamp  (no underscores inside guildId/channelId normally)
  const gameId = `${message.guild.id}_${Date.now()}`;

  const game = {
    type:      'rps',
    id:        gameId,
    player1:   message.author.id,
    player2:   opponent.id,
    choices:   {},           // { userId: 'rock' | 'paper' | 'scissors' }
    channelId: message.channel.id,
    guildId:   message.guild.id,
  };

  // Buttons row — choices are revealed via ephemeral so opponent can't see
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`rps_${gameId}_rock`)    .setLabel('✊').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`rps_${gameId}_paper`)   .setLabel('✋').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`rps_${gameId}_scissors`).setLabel('✌️').setStyle(ButtonStyle.Secondary),
  );

  const embed = new EmbedBuilder()
    .setTitle('✊✋✌️  حجر ورقة مقص!')
    .setColor(0x00b894)
    .setDescription(
      `<@${message.author.id}> **vs** <@${opponent.id}>\n\n` +
      `كل واحد يضغط على اختياره 👇\n⏳ في انتظار اللاعبين...`
    )
    .setFooter({ text: 'CrossOver • RPS • اختيارك سري ✅' });

  const msg = await message.channel.send({ embeds: [embed], components: [row] });
  game.messageId = msg.id;
  client.games.set(`rps_${gameId}`, game);

  // Auto-expire after 2 minutes
  setTimeout(() => {
    if (!client.games.has(`rps_${gameId}`)) return;
    client.games.delete(`rps_${gameId}`);
    msg.edit({ embeds: [
      new EmbedBuilder()
        .setTitle('⏰ انتهى الوقت!')
        .setColor(0xb2bec3)
        .setDescription('اللعبة انتهت لعدم الاستجابة.')
        .setFooter({ text: 'CrossOver • RPS' })
    ], components: [] }).catch(() => {});
  }, 120_000);
}

// ─── Button Handler ───────────────────────────────────────────────────────────
async function handleButton(interaction, client) {
  // customId = rps_guildId_timestamp_choice
  const parts  = interaction.customId.split('_');
  const choice = parts.pop();                    // 'rock' | 'paper' | 'scissors'
  const gameId = parts.slice(1).join('_');       // guildId_timestamp
  const key    = `rps_${gameId}`;
  const game   = client.games.get(key);

  if (!game) return interaction.reply({ content: '❌ اللعبة منتهية!', ephemeral: true });

  if (![game.player1, game.player2].includes(interaction.user.id))
    return interaction.reply({ content: '❌ مش من اللاعبين!', ephemeral: true });

  if (game.choices[interaction.user.id])
    return interaction.reply({ content: `✅ اختيارك ${LABELS[game.choices[interaction.user.id]]} اتسجل بالفعل!`, ephemeral: true });

  // Record choice (secretly)
  game.choices[interaction.user.id] = choice;
  await interaction.reply({ content: `✅ اخترت **${LABELS[choice]}**! في انتظار الخصم...`, ephemeral: true });

  // Update embed to show one player chose
  if (Object.keys(game.choices).length === 1) {
    const channel = await interaction.client.channels.fetch(game.channelId).catch(() => null);
    const msg     = await channel?.messages.fetch(game.messageId).catch(() => null);
    if (msg) {
      await msg.edit({ embeds: [
        new EmbedBuilder()
          .setTitle('✊✋✌️  حجر ورقة مقص!')
          .setColor(0x00b894)
          .setDescription(
            `<@${game.player1}> **vs** <@${game.player2}>\n\n` +
            `✅ لاعب اختار، في انتظار الثاني...`
          )
          .setFooter({ text: 'CrossOver • RPS • اختيارك سري ✅' })
      ]}).catch(() => {});
    }
    return;
  }

  // ── Both chose — reveal result ─────────────────────────────────────────────
  if (Object.keys(game.choices).length === 2) {
    const c1 = game.choices[game.player1];
    const c2 = game.choices[game.player2];

    let result, color;
    if (c1 === c2) {
      result = '🤝 تعادل! ما فاز حد.';
      color  = 0xfdcb6e;
    } else if (BEATS[c1] === c2) {
      result = `🏆 <@${game.player1}> فاز!`;
      color  = 0x00b894;
    } else {
      result = `🏆 <@${game.player2}> فاز!`;
      color  = 0x00b894;
    }

    const resultEmbed = new EmbedBuilder()
      .setTitle('✊✋✌️  النتيجة!')
      .setColor(color)
      .addFields(
        { name: `<@${game.player1}>`, value: LABELS[c1], inline: true },
        { name: 'vs',                 value: '⚔️',        inline: true },
        { name: `<@${game.player2}>`, value: LABELS[c2], inline: true },
      )
      .setDescription(result)
      .setFooter({ text: 'CrossOver • RPS' });

    const channel = await interaction.client.channels.fetch(game.channelId).catch(() => null);
    const msg     = await channel?.messages.fetch(game.messageId).catch(() => null);
    if (msg) await msg.edit({ embeds: [resultEmbed], components: [] }).catch(() => {});

    client.games.delete(key);
  }
}

module.exports = { start, handleButton };
