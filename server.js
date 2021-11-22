const express = require('express');
const axios = require('axios');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const { webkit } = require('playwright');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/public/')));

app.listen(PORT, () => {
  debug(`listening on port ${chalk.green(PORT)}`);
});

publishLandingPage = require('./routes/publishLandingPage.js');
app.post('/routes/publish-landing-page', (req, res) => {
	publishLandingPage.getConfigContexts(req.body, res);
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
					
					// res.send({rep});
					console.log(`${value._initializer.status} - ${route.request().url()}`);
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