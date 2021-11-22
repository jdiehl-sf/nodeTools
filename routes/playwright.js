// const { webkit } = require('playwright');

// (async (req, res) => {
// 	const browser = await webkit.launch();
// 	const context = await browser.newContext();
// 	const page = await context.newPage();

// 	// Log and continue all network requests
// 	page.route('**', (route) => {
// 		route.request().response((resolve) => {
// 			// setTimeout(() => {
// 			resolve();
// 			// }, 3000);
// 		}).then((value) => {
// 			if (route.request().url().search('https://pub.s1.sfmctest.com/tx-') >= 0) {
// 				// eslint-disable-next-line no-underscore-dangle
// 				res.write(`${value._initializer.status} - ${route.request().url()}`);
// 				console.log(`${value._initializer.status} - ${route.request().url()}`);
// 			}
// 		});

// 		route.continue();
// 	});

// 	// await page.goto('https://pub.s8.sfmctest.com/registration');
// 	await page.goto('https://pub.s1.sfmctest.com/registration');
// 	await browser.close();
// })();

