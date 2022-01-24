require('dotenv').config();
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');
const log = console.log;

module.exports = {
	post(req, res) {
		appres = res;
		bearerToken = req.cookies.bearerToken;
		hostname = req.cookies.hostname;
		collectionName = req.body.collectionName || uuidv4();

		createCollection();
	}
}

createCollection = () => {
	const options = {
		url: 'internal/v2/CloudPages/collections',
		baseURL: hostname,
		method: 'post',
		data: {
			name: collectionName,
			description: null
		},
		headers: {
			authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		}
	};
	
	axios(options).then((res) => {
		({ collectionId } = res.data);

		log(chalk.green(`(NODE) Collection created: ID: ${collectionId}, Name: ${collectionName}`));

		appres.status(200).json(res.data);
		appres.end();
	}).catch(err => {
		log(chalk.red(`${JSON.stringify(err)}`));
		log(chalk.red(`(${err.response.status}): ${err.response.statusText}: ${err.response.data.message}`));
		appres.status(500).json({error: `${err.response.statusText}: ${err.response.data.message}`});
		appres.end();
	});
}