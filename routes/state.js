require('dotenv').config();
const axios = require('axios').default;
const chalk = require('chalk');
const log = console.log;

let landingPageId;
let appres;
let bearerToken;
let hostname;

module.exports = {
	get(req, res) {
		appres = res;
		bearerToken = req.cookies.bearerToken;
		hostname = req.cookies.hostname;
		landingPageId = req.params.id;
		
		getStateId();
	}
}

function getStateId () {
	const statesOptions = {
		url: `internal/v2/CloudPages/landing-pages/${landingPageId}/states/`,
		baseURL: hostname,
		method: 'get',
		headers: {
			authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		}
	};

	axios(statesOptions).then((res) => {
		if (res.status === 200) {
			log(chalk.green(`(NODE) StateId required to publish found: ${res.data.entities[0].stateId}`));

			appres.status(200).json(res.data);
			appres.end();
		}
	}).catch(err => {
		log(chalk.red(`${JSON.stringify(err)}`));
		log(chalk.red(`(${err.response.status}): ${err.response.statusText}: ${err.response.data.message}`));
		appres.status(500).json({error: `${err.response.statusText}: ${err.response.data.message}`});
		appres.end();
	});
}
