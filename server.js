const { PORT = 80 } = process.env;

const express = require('express');
const fetch = require('./fetch');
const reset = require('./reset');

const app = express();

app
	.use(express.urlencoded({ extended: true }), express.json())
	.post('/api/reset', async (req, res) => {
		if (!req.body.token) return res.status(400).send('No <code>token</code> parameter was supplied.');
		try {
			const { body } = await fetch(req.body.token);
			reset(req.body.token);

			return res.json(body);
		} catch (error) {
			return res.status(400).send(error.message);
		}
	})
	.listen(PORT, () => console.log(`Listening on port ${PORT}!`));