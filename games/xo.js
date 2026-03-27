// games/xo.js — Tic Tac Toe (تيك تاك تو)
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],   // rows
  [0,3,6],[1,4,7],[2,5,8],   // cols
  [0,4,8],[2,4,6],            // diagonals
];

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function buildComponents(board, gameId, disabled = false) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const cell = board[idx]; // null | 'X' | 'O'
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`xo_${gameId}_${idx}`)
          .setLabel(cell === 'X' ? '❌' : cell === 'O' ? '⭕' : '​') // zero-width space for empty
          .setStyle(
            cell === 'X' ? ButtonStyle.Danger :
            cell === 'O' ? ButtonStyle.Primary :
            ButtonStyle.Secondary
          )
          .setDisabled(disabled || cell !== null)
      );
    }
    rows.push(row);
  }
  return rows;
}

function buildEmbed(game, status = null) {
  const { players, currentTurn } = game;
  const nextId = players[currentTurn];
  const symbol = currentTurn === 'X' ? '❌' : '⭕';

  return new EmbedBuilder()
    .setTitle('❌⭕  XO — جونة جديدة!')
    .setColor(0x6c5ce7)
    .setDescription(
      status ??
      `**❌** <@${players.X}>  vs  **⭕** <@${players.O}>\n\nدور: <@${nextId}> ${symbol}`
    )
    .setFooter({ text: 'CrossOver • XO' });
}

// ─── Start ────────────────────────────────────────────────────────────────────
async function start(message, args, client) {
  const opponent = message.mentions.members?.first();
  if (!opponent)              return message.reply('❌ ذكر خصمك! مثال: `!xo @player`');
  if (opponent.id === message.author.id) return message.reply('❌ مش ممكن تلعب ضد نفسك!');
  if (opponent.user.bot)      return message.reply('❌ مش ممكن تلعب ضد بوت!');

  const gameId = `${message.guild.id}_${Date.now()}`;
  const board  = Array(9).fill(null);

  const game = {
    type: 'xo',
    id: gameId,
    players: { X: message.author.id, O: opponent.id },
    board,
    currentTurn: 'X',
    channelId: message.channel.id,
    guildId: message.guild.id,
  };

  const msg = await message.channel.send({
    embeds:     [buildEmbed(game)],
    components: buildComponents(board, gameId),
  });

  game.messageId = msg.id;
  client.games.set(`xo_${gameId}`, game);
}

// ─── Button Handler ───────────────────────────────────────────────────────────
async function handleButton(interaction, client) {
  // customId = xo_guildId_timestamp_cellIndex
  const parts  = interaction.customId.split('_');
  const idx    = parseInt(parts.pop());
  const gameId = parts.slice(1).join('_');
  const key    = `xo_${gameId}`;
  const game   = client.games.get(key);

  if (!game) return interaction.reply({ content: '❌ اللعبة منتهية!', ephemeral: true });

  const currentPlayerId = game.players[game.currentTurn];
  if (interaction.user.id !== currentPlayerId)
    return interaction.reply({ content: `⛔ مش دورك! دور <@${currentPlayerId}>`, ephemeral: true });

  if (game.board[idx])
    return interaction.reply({ content: '❌ الخانة دي ممسوكة!', ephemeral: true });

  // Make move
  game.board[idx] = game.currentTurn;

  const winner = checkWinner(game.board);
  const isDraw = !winner && game.board.every(Boolean);

  if (winner || isDraw) {
    // ── Game over ──────────────────────────────────────────────────────────
    let desc, color;
    if (winner) {
      const winnerId = game.players[winner];
      const symbol   = winner === 'X' ? '❌' : '⭕';
      desc  = `🏆 <@${winnerId}> فاز بالـ XO! ${symbol}`;
      color = winner === 'X' ? 0xff7675 : 0x74b9ff;
    } else {
      desc  = '🤝 تعادل! ما فاز حد.';
      color = 0xfdcb6e;
    }

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('❌⭕  XO — انتهت!')
          .setColor(color)
          .setDescription(desc)
          .setFooter({ text: 'CrossOver • XO' }),
      ],
      components: buildComponents(game.board, gameId, true),
    });

    client.games.delete(key);
  } else {
    // ── Next turn ──────────────────────────────────────────────────────────
    game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
    await interaction.update({
      embeds:     [buildEmbed(game)],
      components: buildComponents(game.board, gameId),
    });
  }
}

module.exports = { start, handleButton };
