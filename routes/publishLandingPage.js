require('dotenv').config();
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');
const pageStyle = require('./templates/pageContents');
const landingPagePayload = require('./templates/landingPagePayload');
const log = console.log;

// Get options passed in
let configContext;
let configName;
let pageContent;
let landingPageName;
let collectionName;

let bearerToken;
let hostname;
let authUrl;
let authPath = '/v2/token';
let collectionId;

let stackKey;
const urlObject = [];

module.exports = {
	getConfigContexts(options, res) {
		appres = res;
		configContext = options.configContext || process.env.CONTEXT_ID;
		configName = options.configName || process.env.CONFIG_NAME;
		pageContent = options.pageContent;
		landingPageName = options.landingPageName || uuidv4();
		collectionName = options.collectionName;

		log(chalk.redBright('config: ', configName, configContext));

		axios({
			method: 'get',
			url: `https://testmanager.test-exacttarget.com/api/v1/configContexts/${configContext}/configs`
		}).then((res) => {
			if (res.status === 200) {
				const data = res.data.items;
				log(chalk.green('(NODE) Config contexts found.'));

				const accountSecrets = getConfigValues(data);
				getBearerToken(accountSecrets);
			} else {
				log(chalk.red(`(NODE) Failed to get config contexts ${res.status} - ${res.statusText}`));
			}
		}).catch(err => catchError(err));
	}
}

function createCollection() {
	const collectionPostOptions = {
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
	
	axios(collectionPostOptions).then((res) => {
		if (res.status === 201) {
			({ collectionId } = res.data);

			log(chalk.green(`(NODE) Collection created: ID: ${collectionId}, Name: ${collectionName}`));

			createLandingPage();
		}
	}).catch(err => catchError(err));
}

function createLandingPage () {
	const landingPagePostOptions = {
		url: 'internal/v2/CloudPages/landing-pages',
		baseURL: hostname,
		method: 'post',
		data: landingPagePayload({
			name: landingPageName,
			collectionId,
			content: pageContent.replace('[stackKey]', stackKey),
			style: pageStyle.pageStyle1()
		}),
		headers: {
			authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		}
	};
	
	axios(landingPagePostOptions).then((res) => {
		if (res.status === 201) {
			this.landingPageId = res.data.landingPageId;
			log(chalk.green(`(NODE) Landing page "${landingPageName}" created.`));

			getStateId();
		}
	}).catch(err => catchError(err));
}

function getStateId () {
	const statesOptions = {
		url: `internal/v2/CloudPages/landing-pages/${this.landingPageId}/states/`,
		baseURL: hostname,
		method: 'get',
		headers: {
			authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		}
	};

	axios(statesOptions).then((res) => {
		if (res.status === 200) {
			this.stateId = res.data.entities[0].stateId;
			log(chalk.green(`(NODE) StateId required to publish found: ${res.data.entities[0].stateId}`));

			publishLandingPage();
		}
	}).catch(err => catchError(err));
}

function publishLandingPage() {
	const publishOptions = {
		url: `internal/v2/CloudPages/landing-pages/${this.landingPageId}/publish`,
		baseURL: hostname,
		method: 'post',
		data: {
			stateId: this.stateId
		},
		headers: {
			authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		}
	};

	axios(publishOptions).then((res) => {
		if (res.status === 200) {
			urlObject.unshift({
				name: landingPageName,
				stack: stackKey,
				publishedUrl: res.data.url
			});
			log(chalk.green(`(NODE) ${res.data.url} ${res.data.status}!!!`));
			finish();
		}
	}).catch(err => catchError(err));
}

function finish() {
	log(chalk.blue('/routes/publish-landing-page finished.'));
	log(chalk.blue('-------------------------------------------------------\n\r'));

	appres.status(200).send(urlObject);
	appres.end();
}

function catchError(err) {
	log(chalk.red(`${err.response.config.url}`));
	log(chalk.red(`(${err.response.status}): ${err.response.statusText}: ${err.response.data.message}`));
	appres.status(err.response.status).json({error: `${err.response.statusText}: ${err.response.data.message}`})
	appres.end();
}

async function main() {
	collectionName !== '' ? await createCollection() : await createLandingPage();
}

const getConfigValues = (data) => {
	const accountValues = {};
	const config = data.filter((item) => item.name === configName);

	if (config.length) {
		stackKey = config[0].environmentName;
		const { configAttributes } = config[0];
		const clientID = configAttributes.filter((item) => item.name === 'ClientID');
		const clientSecret = configAttributes.filter((item) => item.name === 'ClientSecret');
		const configCollectionId = configAttributes.filter((item) => item.name === 'collectionId');
		const configTSE = configAttributes.filter((item) => item.name === 'tseId');

		accountValues.client_id = clientID[0].value;
		accountValues.client_secret = clientSecret[0].value;

		// If you don't choose to create a new collection, we read from the 'collectionid' in Config Manager
		if (configCollectionId.length && !collectionName) {
			chalk.blue(`Collection Id: ${configCollectionId[0].value}`);
			collectionId = configCollectionId[0].value;
		}

		// Use TSE urls if they have them
		if (configTSE.length) {
			const tseId = configTSE[0].value;

			if(stackKey.includes('QA1')) {
				authUrl = `https://${tseId}.auth-qa1.marketingcloudqaapis.com/`;
			} else {
				authUrl = `https://${tseId}.auth.marketingcloudapis.com`;
			}
		} else {
			authUrl = `auth-${stackKey}.exacttargetapis.com`;
			hostname = 'www.exacttargetapis.com';
		}
	} else {
		chalk.red(`No Config found by the name of ${configName}`);
		appres.status(400).json({error: `No Config found by the name of ${configName}`})
		appres.end();
	}

	return accountValues;
};

const getBearerToken = (accountSecrets) => {
	accountSecrets.grant_type = 'client_credentials';
	const data = JSON.stringify(accountSecrets);

	// Create the AJAX POST
	const bearerTokenOptions = {
		baseURL: authUrl,
		url: authPath,
		method: 'post',
		data,
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	};

	axios(bearerTokenOptions).then((res) => {
		if (res.status === 200) {			
			bearerToken = res.data.access_token;
			hostname = res.data.rest_instance_url;

			chalk.green(`(NODE) Bearer token recieved.`);

			main();
		} else {
			chalk.red(`(NODE) Failed to get bearer token: ${res.status} - ${res.statusText}`);
		}
	}).catch(err => catchError(err));
};
