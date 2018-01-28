const url = 'https://discordapp.com/api/users/@me';
const { strict } = require('./regex');
const { get } = require('snekfetch');

module.exports = async token => {
	if (!strict.test(token)) return Promise.reject(new Error('Invalid token format.'));
	try {
		return await get(url).set('Authorization', `Bot ${token}`);
	} catch (_) {
		try {
			return await get(url).set('Authorization', token);
		} catch (__) {}
	}

	return Promise.reject(new Error('Invalid token.'));
};