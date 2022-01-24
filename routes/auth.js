const axios = require('axios').default;
const chalk = require('chalk');
const log = console.log;
let authUrl;
let authPath = '/v2/token';
let response;

function getAuthData (req, res) {
	response = res;
	configContext = req.body.configContext || process.env.CONTEXT_ID;
	configName = req.body.configName || process.env.CONFIG_NAME;

	log(chalk.blue('config: ', configName, configContext));

	axios({
		method: 'get',
		url: `https://testmanager.test-exacttarget.com/api/v1/configContexts/${configContext}/configs`
	}).then((res) => {
		const testManagerData = res.data.items;
		const testManagerConfig = getConfigValues(testManagerData);
		log(chalk.green('(NODE) Config contexts found.'));

		getBearerToken(testManagerConfig);
	}).catch(err => {
		response.status(err).json({error: `${err}: ${err}`})
		response.end();
	});
}

function getBearerToken (testManagerConfig) {
	testManagerConfig.grant_type = 'client_credentials';
	const data = JSON.stringify(testManagerConfig);

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
		bearerToken = res.data.access_token;
		hostname = res.data.rest_instance_url;
		chalk.green(`(NODE) Bearer token recieved.`);
		
		setAuthData = {
			hostname,
			bearerToken,
			collectionId: testManagerConfig.collectionId,
			stackKey: testManagerConfig.stackKey
		}

		response.status(200).send(setAuthData);
		response.end();

		this.authData = setAuthData;
	}).catch(err => {
		response.status(err).json({error: `${err}: ${err}`})
		response.end();
	});
}

const getConfigValues = (testManagerData) => {
	const accountValues = {};
	const config = testManagerData.filter((item) => item.name === configName);

	if (config.length) {
		stackKey = config[0].environmentName;
		const { configAttributes } = config[0];
		const clientID = configAttributes.filter((item) => item.name === 'ClientID');
		const clientSecret = configAttributes.filter((item) => item.name === 'ClientSecret');
		const configCollectionId = configAttributes.filter((item) => item.name === 'collectionId');
		const configTSE = configAttributes.filter((item) => item.name === 'tseId');

		accountValues.client_id = clientID[0].value;
		accountValues.client_secret = clientSecret[0].value;
		accountValues.stackKey = stackKey;

		// If you don't choose to create a new collection, we read from the 'collectionid' in Config Manager
		if (configCollectionId.length) {
			chalk.blue(`Collection Id: ${configCollectionId[0].value}`);
			accountValues.collectionId = configCollectionId[0].value;
		}

		// Use TSE urls if they have them
		if (configTSE.length) {
			const tseId = configTSE[0].value;

			if(stackKey.includes('QA1')) {
				authUrl = `https://${tseId}.auth-qa1.marketingcloudqaapis.com/`;
			} else if(stackKey.includes('QA3')) {
				authUrl = `https://${tseId}.auth-qa3.marketingcloudqaapis.com/`;
			} else {
				authUrl = `https://${tseId}.auth.marketingcloudapis.com`;
			}
		} else {
			authUrl = `auth-${stackKey}.exacttargetapis.com`;
			hostname = 'www.exacttargetapis.com';
		}
	} else {
		chalk.red(`No Config found by the name of ${configName}`);
		response.status(400).json({error: `No Config found by the name of ${configName}`})
		response.end();
	}

	return accountValues;
}

module.exports = { getAuthData, getBearerToken };