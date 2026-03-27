// games/flags.js — Flag Guessing Game (لعبة الأعلام)
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ─── Flag Bank ────────────────────────────────────────────────────────────────
const FLAGS = [
  { flag: '🇪🇬', country: 'مصر',               answers: ['مصر', 'egypt'] },
  { flag: '🇸🇦', country: 'السعودية',           answers: ['السعودية', 'saudi', 'saudi arabia', 'المملكة العربية السعودية'] },
  { flag: '🇦🇪', country: 'الإمارات',           answers: ['الإمارات', 'الامارات', 'uae', 'emirates'] },
  { flag: '🇺🇸', country: 'أمريكا',             answers: ['أمريكا', 'امريكا', 'usa', 'america', 'united states'] },
  { flag: '🇬🇧', country: 'بريطانيا',           answers: ['بريطانيا', 'uk', 'britain', 'england', 'united kingdom'] },
  { flag: '🇫🇷', country: 'فرنسا',              answers: ['فرنسا', 'france'] },
  { flag: '🇩🇪', country: 'ألمانيا',            answers: ['ألمانيا', 'المانيا', 'germany'] },
  { flag: '🇯🇵', country: 'اليابان',            answers: ['اليابان', 'japan'] },
  { flag: '🇧🇷', country: 'البرازيل',           answers: ['البرازيل', 'brazil'] },
  { flag: '🇷🇺', country: 'روسيا',              answers: ['روسيا', 'russia'] },
  { flag: '🇨🇳', country: 'الصين',              answers: ['الصين', 'china'] },
  { flag: '🇮🇳', country: 'الهند',              answers: ['الهند', 'india'] },
  { flag: '🇮🇹', country: 'إيطاليا',            answers: ['إيطاليا', 'ايطاليا', 'italy'] },
  { flag: '🇪🇸', country: 'إسبانيا',            answers: ['إسبانيا', 'اسبانيا', 'spain'] },
  { flag: '🇹🇷', country: 'تركيا',              answers: ['تركيا', 'turkey'] },
  { flag: '🇰🇷', country: 'كوريا الجنوبية',     answers: ['كوريا', 'كوريا الجنوبية', 'south korea', 'korea'] },
  { flag: '🇲🇦', country: 'المغرب',             answers: ['المغرب', 'morocco'] },
  { flag: '🇩🇿', country: 'الجزائر',            answers: ['الجزائر', 'algeria'] },
  { flag: '🇹🇳', country: 'تونس',               answers: ['تونس', 'tunisia'] },
  { flag: '🇮🇶', country: 'العراق',             answers: ['العراق', 'iraq'] },
  { flag: '🇸🇾', country: 'سوريا',              answers: ['سوريا', 'syria'] },
  { flag: '🇯🇴', country: 'الأردن',             answers: ['الأردن', 'الاردن', 'jordan'] },
  { flag: '🇱🇧', country: 'لبنان',              answers: ['لبنان', 'lebanon'] },
  { flag: '🇰🇼', country: 'الكويت',             answers: ['الكويت', 'kuwait'] },
  { flag: '🇶🇦', country: 'قطر',                answers: ['قطر', 'qatar'] },
  { flag: '🇧🇭', country: 'البحرين',            answers: ['البحرين', 'bahrain'] },
  { flag: '🇴🇲', country: 'عُمان',              answers: ['عمان', 'عُمان', 'oman'] },
  { flag: '🇾🇪', country: 'اليمن',              answers: ['اليمن', 'yemen'] },
  { flag: '🇱🇾', country: 'ليبيا',              answers: ['ليبيا', 'libya'] },
  { flag: '🇸🇩', country: 'السودان',            answers: ['السودان', 'sudan'] },
  { flag: '🇵🇸', country: 'فلسطين',             answers: ['فلسطين', 'palestine'] },
  { flag: '🇵🇰', country: 'باكستان',            answers: ['باكستان', 'pakistan'] },
  { flag: '🇲🇾', country: 'ماليزيا',            answers: ['ماليزيا', 'malaysia'] },
  { flag: '🇮🇩', country: 'إندونيسيا',          answers: ['إندونيسيا', 'اندونيسيا', 'indonesia'] },
  { flag: '🇳🇬', country: 'نيجيريا',            answers: ['نيجيريا', 'nigeria'] },
  { flag: '🇮🇷', country: 'إيران',              answers: ['إيران', 'ايران', 'iran'] },
  { flag: '🇦🇷', country: 'الأرجنتين',          answers: ['الأرجنتين', 'argentina'] },
  { flag: '🇵🇹', country: 'البرتغال',           answers: ['البرتغال', 'portugal'] },
  { flag: '🇳🇱', country: 'هولندا',             answers: ['هولندا', 'netherlands', 'holland'] },
  { flag: '🇧🇪', country: 'بلجيكا',             answers: ['بلجيكا', 'belgium'] },
  { flag: '🇨🇦', country: 'كندا',               answers: ['كندا', 'canada'] },
  { flag: '🇦🇺', country: 'أستراليا',           answers: ['أستراليا', 'استراليا', 'australia'] },
  { flag: '🇳🇴', country: 'النرويج',             answers: ['النرويج', 'norway'] },
  { flag: '🇸🇪', country: 'السويد',             answers: ['السويد', 'sweden'] },
  { flag: '🇨🇭', country: 'سويسرا',             answers: ['سويسرا', 'switzerland'] },
  { flag: '🇬🇷', country: 'اليونان',            answers: ['اليونان', 'greece'] },
  { flag: '🇵🇱', country: 'بولندا',             answers: ['بولندا', 'poland'] },
  { flag: '🇲🇽', country: 'المكسيك',            answers: ['المكسيك', 'mexico'] },
  { flag: '🇿🇦', country: 'جنوب أفريقيا',       answers: ['جنوب افريقيا', 'جنوب أفريقيا', 'south africa'] },
  { flag: '🇹🇭', country: 'تايلاند',            answers: ['تايلاند', 'thailand'] },
];

// ─── Start ────────────────────────────────────────────────────────────────────
async function start(message, args, client) {
  const gameKey = `flags_${message.guild.id}_${message.channel.id}`;

  if (client.games.has(gameKey))
    return message.reply('⏳ في لعبة أعلام شغالة في الروم دي!');

  const picked = FLAGS[Math.floor(Math.random() * FLAGS.length)];

  const game = {
    type:       'flags',
    gameKey,
    flag:       picked.flag,
    country:    picked.country,
    answers:    picked.answers,
    starter:    message.author.id,
    channelId:  message.channel.id,
    guildId:    message.guild.id,
    waitingForAnswer: true,
    messageId:  null,
    startTime:  Date.now(),
    hints:      0,
  };

  const embed = new EmbedBuilder()
    .setTitle('🏳️  خمّن العلم!')
    .setColor(0xfd79a8)
    .setDescription(`\n# ${picked.flag}\n\nما هي الدولة صاحبة العلم ده؟\nاكتب في الروم! ⬇️`)
    .setFooter({ text: 'CrossOver • أعلام • 60 ثانية' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`flags_${gameKey}_hint`)
      .setLabel('💡 تلميح')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`flags_${gameKey}_skip`)
      .setLabel('⏭️ تخطى')
      .setStyle(ButtonStyle.Danger),
  );

  const msg = await message.channel.send({ embeds: [embed], components: [row] });
  game.messageId = msg.id;
  client.games.set(gameKey, game);

  // Auto-expire after 60 seconds
  setTimeout(async () => {
    const g = client.games.get(gameKey);
    if (!g) return;
    client.games.delete(gameKey);

    const ch = await client.channels.fetch(game.channelId).catch(() => null);
    const m  = await ch?.messages.fetch(game.messageId).catch(() => null);
    if (m) m.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle('⏰ انتهى الوقت!')
          .setColor(0xff7675)
          .setDescription(`${picked.flag}\nالإجابة كانت: **${picked.country}**`)
          .setFooter({ text: 'CrossOver • أعلام' }),
      ],
      components: [],
    }).catch(() => {});
  }, 60_000);
}

// ─── Answer Handler ───────────────────────────────────────────────────────────
async function handleAnswer(message, game, client) {
  const input = message.content.trim().toLowerCase();

  if (!game.answers.includes(input)) return; // wrong answer, ignore silently

  // ── Correct! ────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - game.startTime) / 1000).toFixed(1);
  client.games.delete(game.gameKey);

  const embed = new EmbedBuilder()
    .setTitle('🏆 صح!')
    .setColor(0x00b894)
    .setDescription(
      `${game.flag}\n<@${message.author.id}> عرف العلم في **${elapsed}** ثانية! 🎉\n\nالإجابة: **${game.country}**`
    )
    .setFooter({ text: 'CrossOver • أعلام' });

  const ch  = await message.client.channels.fetch(game.channelId).catch(() => null);
  const msg = await ch?.messages.fetch(game.messageId).catch(() => null);
  if (msg) await msg.edit({ embeds: [embed], components: [] }).catch(() => {});
}

// ─── Button Handler ───────────────────────────────────────────────────────────
async function handleButton(interaction, client) {
  // customId = flags_flags_guildId_channelId_action
  const parts   = interaction.customId.split('_');
  const action  = parts.pop();                    // 'hint' | 'skip'
  const gameKey = parts.slice(1).join('_');       // flags_guildId_channelId
  const game    = client.games.get(gameKey);

  if (!game) return interaction.reply({ content: '❌ اللعبة منتهية!', ephemeral: true });

  // ── Hint ────────────────────────────────────────────────────────────────────
  if (action === 'hint') {
    game.hints++;
    const c = game.country;
    let hint;
    if      (game.hints === 1) hint = `الاسم فيه **${c.length}** حرف`;
    else if (game.hints === 2) hint = `بيبدأ بـ "**${c[0]}**"`;
    else if (game.hints === 3) hint = `أول 2 حروف: "**${c.slice(0, 2)}**"`;
    else                       hint = `الكلمة الأولى: "**${c.split(' ')[0]}**"`;

    return interaction.reply({ content: `💡 تلميح ${game.hints}: ${hint}`, ephemeral: false });
  }

  // ── Skip ────────────────────────────────────────────────────────────────────
  if (action === 'skip') {
    if (interaction.user.id !== game.starter)
      return interaction.reply({ content: '❌ بس اللي بدأ اللعبة يقدر يتخطى!', ephemeral: true });

    client.games.delete(gameKey);
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('⏭️ تخطى!')
          .setColor(0xfdcb6e)
          .setDescription(`${game.flag}\nالإجابة كانت: **${game.country}**`)
          .setFooter({ text: 'CrossOver • أعلام' }),
      ],
      components: [],
    });
  }
}

module.exports = { start, handleButton, handleAnswer };
