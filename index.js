const { Client, GatewayIntentBits } = require('discord.js');

// 環境変数などの設定 (.env ファイルを使用することも推奨されますが、最小限のため直接記述も可能にしています)
// 実際の利用時は、以下の変数を適切に書き換えてください。
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'MTQ3ODE5Mzk0NDMzNTYxMzk4Mw.GsyB2B.qCOeklqaw8boW_utIbFg3SCtxmLwo8zWCLIhkg';
const GAS_WEB_APP_URL = process.env.GAS_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbyxJjua6JRqQ42LR9KQTceNX_sTmK9jNIFk5_vgR7gvMt31Y2Vq3pmA9G_hiqFmXgzhGg/exec';
// 特定のチャンネルのみ転送する場合はここにチャンネルIDを指定します。空文字の場合はすべてのメッセージを転送します。
const TARGET_CHANNEL_ID = '1478211395840380938';

// クライアントの作成（メッセージ内容を読み取るために MessageContent のインテントが必須です）
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 起動時の確認
client.once('ready', () => {
    console.log(`ボットが起動しました。ログインユーザー: ${client.user.tag}`);
});

// メッセージ作成イベント
client.on('messageCreate', async (message) => {
    console.log('受信したチャンネルID:', message.channel.id, '設定されたID:', TARGET_CHANNEL_ID); if (message.author.bot) return;

    // 特定のチャンネルが指定されている場合、それ以外のチャンネルのメッセージは無視する
    if (TARGET_CHANNEL_ID && message.channel.id !== TARGET_CHANNEL_ID) return;

    try {
        // GASへ送信するデータ（必要に応じて形式を変更してください）
        const payload = {
            username: message.author.username,
            content: message.content,
            channelId: message.channel.id,
            timestamp: new Date().toISOString()
        };

        // GASへPOSTリクエストを送信 (Node.js 18以降に組み込まれている fetch を使用)
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`GASへの転送に成功しました: [${message.author.username}] ${message.content}`);
        } else {
            console.error(`GASへの転送に失敗しました: ステータスコード ${response.status}`);
        }

    } catch (error) {
        console.error('GASへのリクエスト処理中にエラーが発生しました:', error);
    }
});

// ボットをログインさせる
client.login(DISCORD_TOKEN);
