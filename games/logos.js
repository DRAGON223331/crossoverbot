// games/logos.js — Logos Word Game (لعبة خمّن الكلمة)
// Flow: Player 1 starts → join button → Player 2 joins → competitive guessing
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ─── Word Bank ────────────────────────────────────────────────────────────────
const WORDS = [
  { word: 'كمبيوتر',  hint: '💻 جهاز إلكتروني للمعالجة' },
  { word: 'سيارة',    hint: '🚗 وسيلة مواصلات على 4 عجلات' },
  { word: 'شمس',      hint: '☀️ نجم في مركز مجموعتنا الشمسية' },
  { word: 'كتاب',     hint: '📚 مصدر معرفة وثقافة' },
  { word: 'موبايل',   hint: '📱 تليفون محمول ذكي' },
  { word: 'طيارة',    hint: '✈️ وسيلة سفر جوية' },
  { word: 'رياضة',    hint: '⚽ نشاط بدني' },
  { word: 'مدرسة',    hint: '🏫 مكان التعليم' },
  { word: 'ديسكورد',  hint: '💬 تطبيق تواصل للجيمرز' },
  { word: 'قمر',      hint: '🌙 يدور حول الأرض' },
  { word: 'ثلاجة',    hint: '🧊 تحفظ الطعام باردًا' },
  { word: 'مطبخ',     hint: '👨‍🍳 مكان الطبخ في البيت' },
  { word: 'بيتزا',    hint: '🍕 أكلة إيطالية مشهورة' },
  { word: 'تلفزيون',  hint: '📺 جهاز عرض في البيت' },
  { word: 'موسيقى',   hint: '🎵 فن الأصوات والألحان' },
  { word: 'ساعة',     hint: '⌚ تقيس الوقت' },
  { word: 'مستشفى',   hint: '🏥 مكان علاج المرضى' },
  { word: 'جواز',     hint: '🛂 وثيقة للسفر الدولي' },
  { word: 'كاميرا',   hint: '📷 تلتقط الصور' },
  { word: 'بركان',    hint: '🌋 جبل يثور حممًا' },
  { word: 'فراشة',    hint: '🦋 حشرة ذات أجنحة ملونة' },
  { word: 'خريطة',    hint: '🗺️ تُظهر المناطق الجغرافية' },
  { word: 'غيتار',    hint: '🎸 آلة موسيقية وترية' },
  { word: 'مكتبة',    hint: '📖 مكان يحوي الكتب' },
  { word: 'بطيخ',     hint: '🍉 فاكهة صيفية حمراء من الداخل' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function maskWord(word, guessed) {
  return word
    .split('')
    .map(ch => (guessed.includes(ch) ? ch : '_'))
    .join('  ');
}

function buildGameEmbed(game) {
  const { word, guessed, wrong, maxWrong, hint, players } = game;
  const masked       = maskWord(word, guessed);
  const wrongLetters = guessed.filter(ch => !word.includes(ch));
  const hearts       = '❤️'.repeat(maxWrong - wrong) + '🖤'.repeat(wrong);
  const scores       = `<@${players[0]}> **${game.scores[0]}** pts  •  <@${players[1]}> **${game.scores[1]}** pts`;

  return new EmbedBuilder()
    .setTitle('🔤  Logos — خمّن الكلمة!')
    .setColor(0xa29bfe)
    .setDescription(`\`${masked}\``)
    .addFields(
      { name: '💡 تلميح',       value: hint,                                           inline: true  },
      { name: '❤️ حياة',        value: hearts,                                         inline: true  },
      { name: '✉️ حروف خاطئة', value: wrongLetters.length ? wrongLetters.join(' ') : '—', inline: false },
      { name: '🏅 النقاط',      value: scores,                                         inline: false },
    )
    .setFooter({ text: 'اكتب حرفًا أو الكلمة كاملة في الروم! • CrossOver • Logos' });
}

// ─── Start (Invitation Phase) ─────────────────────────────────────────────────
async function start(message, args, client) {
  const gameKey = `logos_${message.guild.id}_${message.channel.id}`;

  if (client.games.has(gameKey))
    return message.reply('⏳ في لعبة Logos شغالة في الروم دي! انتظر لحد ما تخلص.');

  const game = {
    type:       'logos',
    gameKey,
    phase:      'waiting',      // 'waiting' | 'playing'
    player1:    message.author.id,
    player2:    null,
    players:    null,           // set when game starts [p1id, p2id]
    scores:     [0, 0],
    round:      0,
    maxRounds:  5,
    word:       null,
    hint:       null,
    guessed:    [],
    wrong:      0,
    maxWrong:   6,
    waitingForAnswer: false,
    channelId:  message.channel.id,
    guildId:    message.guild.id,
    messageId:  null,
  };

  const inviteEmbed = new EmbedBuilder()
    .setTitle('🔤  Logos — جونة جديدة! 🎲')
    .setColor(0xa29bfe)
    .setDescription(
      `**اللاعب الأول:** <@${message.author.id}>\n\n` +
      `أول واحد يضغط **انضم** يصبح اللاعب الثاني.\n` +
      `اللعبة مكونة من **5 جولات** — من يجمع أكتر نقاط يفوز!`
    )
    .setFooter({ text: 'CrossOver • Logos' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`logos_${gameKey}_join`)
      .setLabel('انضم ✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`logos_${gameKey}_cancel`)
      .setLabel('إلغاء ❌')
      .setStyle(ButtonStyle.Danger),
  );

  const msg = await message.channel.send({ embeds: [inviteEmbed], components: [row] });
  game.messageId = msg.id;
  client.games.set(gameKey, game);

  // Auto-cancel invite after 2 minutes
  setTimeout(async () => {
    const g = client.games.get(gameKey);
    if (g && g.phase === 'waiting') {
      client.games.delete(gameKey);
      msg.edit({
        embeds: [new EmbedBuilder().setTitle('⏰ انتهى وقت الانضمام').setColor(0xb2bec3)
          .setFooter({ text: 'CrossOver • Logos' })],
        components: [],
      }).catch(() => {});
    }
  }, 120_000);
}

// ─── Button Handler ───────────────────────────────────────────────────────────
async function handleButton(interaction, client) {
  // customId = logos_logos_guildId_channelId_action
  const parts  = interaction.customId.split('_');
  const action = parts.pop();                      // 'join' | 'cancel'
  const gameKey = parts.slice(1).join('_');        // logos_guildId_channelId
  const game   = client.games.get(gameKey);

  if (!game) return interaction.reply({ content: '❌ اللعبة منتهية!', ephemeral: true });

  // ── Cancel ──────────────────────────────────────────────────────────────────
  if (action === 'cancel') {
    if (interaction.user.id !== game.player1)
      return interaction.reply({ content: '❌ بس اللي بدأ يقدر يلغي!', ephemeral: true });

    client.games.delete(gameKey);
    await interaction.update({
      embeds: [new EmbedBuilder().setTitle('❌ تم إلغاء اللعبة').setColor(0xff7675).setFooter({ text: 'CrossOver • Logos' })],
      components: [],
    });
    return;
  }

  // ── Join ─────────────────────────────────────────────────────────────────────
  if (action === 'join') {
    if (game.phase !== 'waiting')
      return interaction.reply({ content: '⏳ اللعبة بدأت بالفعل!', ephemeral: true });
    if (interaction.user.id === game.player1)
      return interaction.reply({ content: '❌ مش ممكن تلعب ضد نفسك!', ephemeral: true });

    game.player2  = interaction.user.id;
    game.players  = [game.player1, game.player2];
    game.scores   = [0, 0];
    game.phase    = 'playing';
    game.waitingForAnswer = true;

    await interaction.update({ embeds: [
      new EmbedBuilder()
        .setTitle('🔤  Logos — بدأت اللعبة!')
        .setColor(0x00b894)
        .setDescription(`<@${game.player1}> vs <@${game.player2}>\n\nجاري تحميل الجولة الأولى...`)
        .setFooter({ text: 'CrossOver • Logos' })
    ], components: [] });

    await startRound(game, interaction.client, interaction.channel);
    return;
  }
}

// ─── Round Logic ──────────────────────────────────────────────────────────────
async function startRound(game, discordClient, channel) {
  game.round++;
  const picked  = WORDS[Math.floor(Math.random() * WORDS.length)];
  game.word     = picked.word;
  game.hint     = picked.hint;
  game.guessed  = [];
  game.wrong    = 0;

  const embed = buildGameEmbed(game);
  const msg   = await channel.send({ embeds: [embed] });
  game.messageId = msg.id;

  // Auto-timeout per round (90 seconds)
  const roundNum = game.round;
  setTimeout(async () => {
    const g = discordClient.games.get(game.gameKey);
    if (!g || g.round !== roundNum) return;
    const ch = await discordClient.channels.fetch(game.channelId).catch(() => null);
    const m  = await ch?.messages.fetch(game.messageId).catch(() => null);
    if (m) m.edit({ embeds: [
      new EmbedBuilder().setTitle('⏰ انتهى وقت الجولة!').setColor(0xfdcb6e)
        .setDescription(`الكلمة كانت: **${game.word}**`)
        .setFooter({ text: 'CrossOver • Logos' })
    ]}).catch(() => {});

    // Move to next round or end
    if (game.round >= game.maxRounds) {
      endGame(game, discordClient, ch);
    } else {
      setTimeout(() => startRound(game, discordClient, ch), 2000);
    }
  }, 90_000);
}

// ─── Answer Handler ───────────────────────────────────────────────────────────
async function handleAnswer(message, game, client) {
  if (game.phase !== 'playing') return;
  if (!game.players.includes(message.author.id)) return;

  const input = message.content.trim();
  const ch    = await client.channels.fetch(game.channelId).catch(() => null);
  const msg   = await ch?.messages.fetch(game.messageId).catch(() => null);

  // ── Full word guess ─────────────────────────────────────────────────────────
  if (input.length > 1) {
    if (input === game.word) {
      const winnerIdx = game.players.indexOf(message.author.id);
      game.scores[winnerIdx] += 3; // 3 points for full word
      await message.react('🏆').catch(() => {});
      if (msg) await msg.edit({ embeds: [
        new EmbedBuilder()
          .setTitle('🏆 صح! — الكلمة كاملة!')
          .setColor(0x00b894)
          .setDescription(`<@${message.author.id}> عرف الكلمة: **${game.word}** (+3 نقاط)\n\n` +
            `🏅 النقاط: <@${game.players[0]}> **${game.scores[0]}**  •  <@${game.players[1]}> **${game.scores[1]}**`)
          .setFooter({ text: `CrossOver • Logos • جولة ${game.round}/${game.maxRounds}` })
      ]}).catch(() => {});

      await nextRoundOrEnd(game, client, ch);
    } else {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  // ── Single letter ───────────────────────────────────────────────────────────
  if (!/[\u0600-\u06FFa-zA-Z]/.test(input)) return; // ignore non-letters

  if (game.guessed.includes(input)) {
    return message.react('⚠️').catch(() => {});
  }

  game.guessed.push(input);
  const correct = game.word.includes(input);

  if (correct) {
    const winnerIdx = game.players.indexOf(message.author.id);
    game.scores[winnerIdx] += 1; // 1 point per correct letter
    await message.react('✅').catch(() => {});
  } else {
    game.wrong++;
    await message.react('❌').catch(() => {});
  }

  const allRevealed = game.word.split('').every(ch => game.guessed.includes(ch));
  const outOfLives  = game.wrong >= game.maxWrong;

  if (allRevealed) {
    if (msg) await msg.edit({ embeds: [
      new EmbedBuilder()
        .setTitle('🎉 تم الكشف عن الكلمة!')
        .setColor(0x00b894)
        .setDescription(`الكلمة كانت: **${game.word}**\n\n` +
          `🏅 النقاط: <@${game.players[0]}> **${game.scores[0]}**  •  <@${game.players[1]}> **${game.scores[1]}**`)
        .setFooter({ text: `CrossOver • Logos • جولة ${game.round}/${game.maxRounds}` })
    ]}).catch(() => {});
    await nextRoundOrEnd(game, client, ch);
    return;
  }

  if (outOfLives) {
    if (msg) await msg.edit({ embeds: [
      new EmbedBuilder()
        .setTitle('💀 نفدت الحياة!')
        .setColor(0xff7675)
        .setDescription(`الكلمة كانت: **${game.word}**\n\n` +
          `🏅 النقاط: <@${game.players[0]}> **${game.scores[0]}**  •  <@${game.players[1]}> **${game.scores[1]}**`)
        .setFooter({ text: `CrossOver • Logos • جولة ${game.round}/${game.maxRounds}` })
    ]}).catch(() => {});
    await nextRoundOrEnd(game, client, ch);
    return;
  }

  // Update board
  if (msg) await msg.edit({ embeds: [buildGameEmbed(game)] }).catch(() => {});
}

async function nextRoundOrEnd(game, client, channel) {
  if (game.round >= game.maxRounds) {
    setTimeout(() => endGame(game, client, channel), 2000);
  } else {
    setTimeout(() => startRound(game, client, channel), 2500);
  }
}

function endGame(game, client, channel) {
  client.games.delete(game.gameKey);
  const [s0, s1] = game.scores;
  let result;
  if (s0 > s1)       result = `🏆 <@${game.players[0]}> فاز بـ **${s0}** نقطة مقابل **${s1}**!`;
  else if (s1 > s0)  result = `🏆 <@${game.players[1]}> فاز بـ **${s1}** نقطة مقابل **${s0}**!`;
  else               result = `🤝 تعادل! كلاهما حصل على **${s0}** نقطة.`;

  channel.send({ embeds: [
    new EmbedBuilder()
      .setTitle('🔤  Logos — انتهت اللعبة!')
      .setColor(0x6c5ce7)
      .setDescription(
        `<@${game.players[0]}> **${s0}** نقطة\n<@${game.players[1]}> **${s1}** نقطة\n\n${result}`
      )
      .setFooter({ text: 'CrossOver • Logos' })
  ]}).catch(() => {});
}

module.exports = { start, handleButton, handleAnswer };
