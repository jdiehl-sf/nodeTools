require('dotenv').config();
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');
const pageStyle = require('./templates/pageContents');
const landingPagePayload = require('./templates/landingPagePayload');
const log = console.log;

let pageContent;
let landingPageName;
let stackKey;
let appres;
let bearerToken;
let hostname;
let collectionId;

module.exports = {
	post(req, res) {
		appres = res;
		bearerToken = req.cookies.bearerToken;
		hostname = req.cookies.hostname;
		collectionId = req.body.collectionId || req.cookies.collectionId;
		pageContent = req.body.pageContent;
		landingPageName = req.body.landingPageName || uuidv4();
		stackKey = req.body.stackKey;

		createLandingPage();
	},

	publish(req, res) {
		appres = res;
		bearerToken = req.cookies.bearerToken;
		hostname = req.cookies.hostname;
		landingPageId = req.params.id;
		
		publishPage();
	}
}

createLandingPage = () => {
	const options = {
		url: 'internal/v2/CloudPages/landing-pages',
		baseURL: hostname,
		method: 'post',
		data: landingPagePayload({
			name: landingPageName,
			collectionId: collectionId,
			content: pageContent.replace('[stackKey]', stackKey),
			style: pageStyle.pageStyle1()
		}),
		headers: {
			authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		}
	};
	
	axios(options).then((res) => {
		if (res.status === 201) {
			log(chalk.green(`(NODE) Landing page "${landingPageName}" created.`));

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

publishPage = () => {
	const options = {
		url: `internal/v2/CloudPages/landing-pages/${landingPageId}/publish/`,
		baseURL: hostname,
		method: 'post',
		headers: {
			authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		}
	};

	axios(options).then((res) => {
		if (res.status === 200) {
			log(chalk.green(`(NODE) ${res.data.url} ${res.data.status}!!!`));

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
