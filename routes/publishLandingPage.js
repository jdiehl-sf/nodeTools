/* eslint-disable node/no-unsupported-features/node-builtins */
require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const scribe = require('@salesforce-mc/devscripts/dist/utils/scribe');
const pageStyle = require('./templates/pageContents');
const landingPagePayload = require('./templates/landingPagePayload');
const { response } = require('express');

const { error, success, info } = scribe;
const fsPromises = fs.promises;
// eslint-disable-next-line new-cap
const buffer = new Buffer.alloc(1024);

// Get command line arguments.
let pageContent;
let createNewCollection;
let landingPageName;
let collectionName;

let getConfigContexts;
let bearerToken;
let hostname;
let authUrl;
let authPath = '/v2/requestToken';
let collectionId;
let configContext;
let configName;
let stackKey;
const urlObject = {};
const collectionIdArray = [];

module.exports = {
	getConfigContexts(options, res) {
		appres = res;
		configContext = options.configContext;
		configName = options.configName;
		stackKey = options.stackKey;
		pageContent = path.join(__dirname, '/templates/pgs-tests/throttling_noop.html');
		createNewCollection = Number(options.createNewCollection || 1);
		landingPageName = options.landingPageName || uuidv4();
		collectionName = options.collectionName || uuidv4();
		// collectionId = options.collectionid;
	
		info(`${stackKey} Starting...`);
		info(`Config Context: ${configContext}`);
	
		const url = `https://testmanager.test-exacttarget.com/api/v1/configContexts/${configContext}/configs`;
	
		axios({
			method: 'get',
			url
		}).then((res) => {
			if (res.status === 200) {
				const data = res.data.items;
				success('(NODE) Config contexts found.');

				const accountSecrets = getConfigValues(data);
				getBearerToken(accountSecrets);
			} else {
				error(`(NODE) Failed to get config contexts ${res.status} - ${res.statusText}`);
			}
		}).catch((err) => {
			console.log('(NODE) ERROR: ', err);
		});
	}
}

async function readFile () {
	// pageContent = myArgs.pageContent.toLowerCase();
	
	let filehandle = null;

	try {
		filehandle = await fsPromises.open(path.join(__dirname, pageContent), 'r+');
		await filehandle.read(buffer, 0, buffer.length, 0);
	} catch (err) {
		error(err);
		this.abort = true;
	} finally {
		if (filehandle) {
			// Close the file if it is opened.
			await filehandle.close();
			getConfigContexts();
		}
	}
}

function createLandingPage (options) {
	return new Promise((resolve, reject) => {
		const payloadJSON = landingPagePayload({
			name: landingPageName,
			collectionId,
			content: fs.readFileSync(pageContent, 'utf8').replace('[stackKey]', stackKey),
			style: pageStyle.pageStyle1()
		});
		const payload = JSON.stringify(payloadJSON);

		const landingPagePostOptions = {
			hostname,
			path: '/internal/v2/CloudPages/landing-pages',
			method: 'POST',
			headers: {
				Authorization: `Bearer ${bearerToken}`,
				'Content-Type': 'application/json'
			}
		};

		// Send the POST request
		const req = https.request(landingPagePostOptions, (res) => {
			if (res.statusCode === 201) {
				let body = '';
				res.on('data', (chunk) => {
					this.landingPageId = JSON.parse(chunk).landingPageId;
					body += chunk;
				});
				success(`Landing page ${landingPageName} created.`);
				res.on('end', () => resolve(JSON.parse(body)));
			} else {
				// Error POSTing the Landing Page
				error(`Create landing page failed: ${res.statusCode} - ${res.statusMessage}`);
			}
		});

		req.on('error', () => reject(new Error(`Failed ${error}`)));
		req.write(payload);
		req.end();
	});
}

function createCollection () {
	const CollectionPostOptions = {
		// url: 'internal/v2/CloudPages/collections',
		// baseUrl: hostname,
		method: 'post',
		data: JSON.stringify({ name: collectionName, description: null }),
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		}
	};
	
	axios('https://mcf47z5trv3bd3h-xg7gt4-jlwmy.rest.marketingcloudapis.com/internal/v2/CloudPages/collections', CollectionPostOptions).then((res) => {
		if (res.status === 200) {
			const stackField = 'stack';
			const collectionIdField = 'collectionId';
			({ collectionId } = res.data);
			const collectionObject = {};
			collectionObject[stackField] = stackKey;
			collectionObject[collectionIdField] = res.data.collectionId;
			collectionIdArray.push(collectionObject);
			success(`(NODE) Collection created: ID: ${collectionId}, Name: ${collectionName}`);
		} else {
			error(`(NODE) Failed to create collection: ${res.status} - ${res.statusText}`);
		}
	}).catch((err) => {
		console.log('(NODE) ERROR: ', err);
		// appres.status(err.status).send(`Failed to create collection: ${err}`);
		// appres.end();
	});


	// const payload = JSON.stringify({ name: collectionName, description: null });

	// const CollectionPostOptions = {
	// 	hostname,
	// 	path: '/internal/v2/CloudPages/collections',
	// 	method: 'POST',
	// 	headers: {
	// 		Authorization: `Bearer ${bearerToken}`,
	// 		'Content-Type': 'application/json'
	// 	}
	// };
	// 	// Send the POST request
	// 	const req = https.request(CollectionPostOptions, (res) => {
	// 		if (res.statusCode === 201) {
	// 			let body = '';
	// 			res.on('data', (chunk) => {
	// 				this.landingPageId = JSON.parse(chunk).landingPageId;
	// 				body += chunk;
	// 			});
	// 			res.on('end', () => {
	// 				const stackField = 'stack';
	// 				const collectionIdField = 'collectionId';
	// 				const data = JSON.parse(body);
	// 				({ collectionId } = data);
	// 				const collectionObject = {};
	// 				collectionObject[stackField] = stackKey;
	// 				collectionObject[collectionIdField] = data.collectionId;
	// 				collectionIdArray.push(collectionObject);
	// 				info(`Collection created: ID: ${collectionId}, Name: ${collectionName}`);
	// 			});
	// 		} else {
	// 			// Error POSTing the Collection
	// 			error(`Create landing page failed: ${res.statusCode} - ${res.statusMessage}`);
	// 		}
	// 	});

	// 	// req.on('error', () => reject(new Error(`Failed ${error}`)));
	// 	req.write(payload);
	// 	req.end();
}

function getStateId () {
	return new Promise((resolve, reject) => {
		const statesOptions = {
			headers: {
				Authorization: `Bearer ${bearerToken}`,
				'Content-Type': 'application/json'
			}
		};

		const url = `https://${hostname}/internal/v2/CloudPages/landing-pages/${this.landingPageId}/states/`;
		
		https.get(url, statesOptions, (res) => {
			if (res.statusCode === 200) {
				let body = '';
				res.on('data', (chunk) => {
					body += chunk;
				}).on('end', () => {
					const data = JSON.parse(body);
					resolve(success(`StateId required to publish found: ${data.entities[0].stateId}`));
				});
			} else {
				error(`Failed to GET the new Landing Page States with code ${res.statusCode} - ${res.statusMessage}`);
			}
		}).on('error', () => reject(new Error(error)));
	});
}

function publishLandingPage () {
	return new Promise((resolve, reject) => {
		const payload = JSON.stringify({ stateId: this.stateId });

		const landingPagePublishOptions = {
			hostname,
			path: `/internal/v2/CloudPages/landing-pages/${this.landingPageId}/publish`,
			method: 'POST',
			headers: {
				Authorization: `Bearer ${bearerToken}`,
				'Content-Type': 'application/json'
			}
		};

		// Send the POST request
		const req = https.request(landingPagePublishOptions, (res) => {
			console.log(res.statusCode);
			if (res.statusCode === 200) {
				let body = '';
				res.on('data', (chunk) => {
					body += chunk;
				});
				res.on('end', () => {
					const data = JSON.parse(body);
					urlObject[stackKey] = data.url;
					resolve(success(`${data.url} ${data.status}!!!`));
				});
			} else {
				// Error POSTing the Landing Page
				error(`Failed to publish the new landing page with code ${res.statusCode} - ${res.statusMessage}`);
			}
		});

		req.on('error', () => reject(new Error(error)));
		req.write(payload);
		req.end();
	});
}

async function main () {
	// const callPromises = [];

	// if (createNewCollection === 1) {
	// 	callPromises.push(
	// 		return createCollection({ pageName: landingPageName });
	// 	);
	// }

	// function getUserPermissions() {
	// 	return axios.get('/user/12345/permissions');
	// }

	// Promise.all(callPromises)
	// 	.then(function (results) {
	// 	const acct = results[0];
	// 	const perm = results[1];
	// });

		if (createNewCollection === 1) {
			await createCollection({ pageName: landingPageName });
		}
		// await createLandingPage({ pageName: landingPageName });
		// await getStateId();
		// await publishLandingPage();

		// info(`${stackKey} Done.`);
		// info('-------------------------------------------------------\n\r');

		// // Now that we're done, let's go to the next one.
		// ++index;
		// if (index === contexts.length) {
		// 	info('URLs Created:');
		// 	info(JSON.stringify(urlObject));
		// 	info('\n\r');

		// 	if (createNewCollection === 1) {
		// 		info('Collection IDs Created:');
		// 		info(JSON.stringify(collectionIdArray));
		// 		info('\n\r');
		// 		info('In case of error or you want to delete what was just created run:');
		// 		let deleteString = '';
		// 		const collectionNum = collectionIdArray.length;
		// 		collectionIdArray.forEach((item, counter = 0) => {
		// 			let num = counter;
		// 			num++;
		// 			deleteString += `node deleteCollection.js ${item.stack} ${item.collectionId} `;
		// 			if (num < collectionNum) {
		// 				deleteString += '&& ';
		// 			}
		// 		});

		// 		// node deleteCollection.js S1 98619 && node deleteCollection.js S4 9166
		// 		info(deleteString);
		// 		info('\n\r');
		// 	}
		// } else {
		// 	getConfigContexts();
		// }
	// } catch (err) {
	// 	// Watch for unauthorized and just kill all further sites if that's the problem cuz it aint gonna wurk no mo
	// 	if (err.message.match(/401/)) {
	// 		error('\n\r\n\r************************************************************************');
	// 		error('Unauthorized - Bearer token probably expired, go update it and try again');
	// 		error(err);
	// 		error('************************************************************************');
	// 	}
	// }
}

const getConfigValues = (data) => {
	const accountValues = {};

	const config = data.filter((item) => item.name === configName);
	if (config.length) {
		const { configAttributes } = config[0];
		const clientID = configAttributes.filter((item) => item.name === 'ClientID');
		const clientSecret = configAttributes.filter((item) => item.name === 'ClientSecret');
		const configCollectionId = configAttributes.filter((item) => item.name === 'CollectionId');
		const configTSE = configAttributes.filter((item) => item.name === 'tseId');

		accountValues.client_id = clientID[0].value;
		accountValues.client_secret = clientSecret[0].value;

		// If you don't choose to create a new collection, we read from the 'collectionid' in Config Manager
		if (configCollectionId.length) {
			info(`CollectionId: ${configCollectionId[0].value}`);
			collectionId = configCollectionId[0].value;
		}

		// Use TSE urls if they have them
		if (configTSE.length) {
			const tseId = configTSE[0].value;
			
			authPath = '/v2/token';
			authUrl = `https://${tseId}.auth.marketingcloudapis.com`;
			hostname = `${tseId}.rest.marketingcloudapis.com`;
		} else {
			authUrl = `auth-${stackKey}.exacttargetapis.com`;
			hostname = 'www.exacttargetapis.com';
		}
	} else {
		response.write(`No Config found by the name of ${configName}`);
		response.end();
		error(`No Config found by the name of ${configName}`);
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
			success(`(NODE) ${stackKey} Bearer token recieved.`);

			// Now we can start calling routes.
			main();
		} else {
			error(`(NODE) Failed to get bearer token: ${res.status} - ${res.statusText}`);
		}
	}).catch((err) => {
		console.log('(NODE) ERROR: ', err);
		appres.status(err.status).send(`Failed to get bearer token: ${err}`);
		appres.end();
	});
};
