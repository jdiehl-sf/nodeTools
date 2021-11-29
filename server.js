const express = require('express');
const axios = require('axios');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const { webkit } = require('playwright');
publishLandingPage = require('./routes/publishLandingPage.js');

const log = console.log;
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/public/')));

app.listen(PORT, () => {
	debug(`listening on port ${chalk.green(PORT)}`);
});

app.post('/routes/landing-page/publish', (req, res) => {
	log(chalk.blue('/routes/publish-landing-page starting...'));
	publishLandingPage.getConfigContexts(req.body, res);
});

app.post('/routes/landing-page/delete', (req, res) => {
	appres = res;
	const bearerToken = req.body.bearerToken
	const stackKey = req.body.stackKey;
	const landingPageId = req.body.landingPageId
	const deleteOptions = {
		// url: `internal/v1/CloudPages/ProjectItem/${landingPageId}`,
		url: `internal/v2/CloudPages/landing-pages/${landingPageId}`,
		baseURL: `https://www-mc-${stackKey}.exacttargetapis.com/`,
		method: 'delete',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json'
		},
		data: {}
	};

	axios(deleteOptions).then((res) => {
		console.log(res)
		if (res.data <= 0) {
			chalk.green(`(NODE) Successfully deleted landing page}`);
			appres.status(200).send([{ items: {landingPageId}}]);
			appres.end();
		}
	}).catch(err => catchError(err));

	function catchError(err) {
		chalk.red(`${err.response.config.url}`)
		chalk.red(`(${err.response.status}): ${err.response.statusText}: ${err.response.data.message}`);
		appres.status(err.response.status).json({error: `${err.response.statusText}: ${err.response.data.message}`})
		appres.end();
	}
});

app.post('/routes/playwright', async(req, res) => {
	res.setHeader('Content-Type', 'application/json');
	const result = { errors: [], items: []};
	const repeatTimes = req.body.repeat || 1;
	const filter = req.body.filter;
	let i = 0;
	let rep = 1;

	do {
		const browser = await webkit.launch();
		const context = await browser.newContext();
		const page = await context.newPage();
		rep++;
		page.route('**', (route) => {
			route.request().response((resolve) => {
				resolve();
			}).then((value) => {
				if (route.request().url().search(filter) >= 0) {
					i++;
					if (value._initializer.status !== 200) {
						result.errors.push({ 
							id: i,
							status: value._initializer.status,
							route: route.request().url()
						});
					} else {
						// eslint-disable-next-line no-underscore-dangle
						result.items.push({ 
							id: i,
							status: value._initializer.status,
							route: route.request().url()
						});
					}
					
					chalk.blue(`${value._initializer.status} - ${route.request().url()}`);
				}
			});

			route.continue();
		});

		await page.goto(req.body.url);
		await browser.close();
	} while (rep <= repeatTimes)

	res.json(result);
	res.end();
});

// function catchError(err) {
// 	error(`${err.response.config.url}`)
// 	error(`(${err.response.status}): ${err.response.statusText}: ${err.response.data.message}`);
// 	appres.status(err.response.status).json({error: `${err.response.statusText}: ${err.response.data.message}`})
// 	appres.end();
// }