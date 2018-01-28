const { TOKEN } = process.env;

const WebSocket = require('ws');
const { get } = require('snekfetch');
const { loose } = require('./regex');
const fetch = require('./fetch');
const reset = require('./reset');

const start = () => {
	const ws = new WebSocket('wss://gateway.discord.gg/?v=7&encoding=json');

	ws.once('error', start);
	ws.once('close', start);

	ws.once('open', () => {
		ws.on('message', async data => {
			const { op, d, t } = JSON.parse(data);

			if (op === 10)
				ws.send(JSON.stringify({
					op: 2,
					d: {
						token: TOKEN,
						properties: {
							$os: process.platform,
							$browser: 'NodeJS',
							$device: 'NodeJS',
						},
					},
				}));

			if (op === 0 && ['MESSAGE_CREATE', 'MESSAGE_UPDATE'].includes(t) && d.content) {
				const tokens = (d.content.match(loose) || []);
				for (const token of tokens)
					try {
						const valid = await fetch(token);
						reset(token, valid.body.bot);
					} catch (_) {}

				const links = (d.content.match(/https?:\/\/hastebin\.com\/[a-z/]+/g) || []);
				for (const link of links)
					try {
						const { text } = await get(`https://hastebin.com/raw/${link.split('/').pop()}`);
						const hbTokens = (text.match(loose) || []);
						for (const token of hbTokens)
							try {
								const valid = await fetch(token);
								reset(token, valid.body.bot);
							} catch (_) {}
					} catch (_) {}
			}
		});
	});
};

/**
MESSAGE_CREATE
{ type: 0,
  tts: false,
  timestamp: '2018-01-28T03:28:37.793000+00:00',
  pinned: false,
  nonce: '407014072010145792',
  mentions: [],
  mention_roles: [],
  mention_everyone: false,
  id: '407014076498051092',
  embeds: [],
  edited_timestamp: null,
  content: 'rip',
  channel_id: '222197033908436994',
  author: {
		username: 'Yukine',
		id: '184632227894657025',
		discriminator: '8080',
		avatar: 'a_a5f0eee3921bde4010d8fb968bfa323c'
	},
	attachments: []
}
*/

start();