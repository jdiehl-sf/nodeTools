# nodeTools

## Starting the app

* npm i
* npm run start-dev

Go to http://localhost:3000

### Playwright tool

* Example page to test: https://pub.s8.sfmctest.com/registration
* Example filter: /tx-user

### Create Landing Page

* Create a Server to Server App with client id/secrets in *Setup | Installed Packages*
* Create a Config in Test Manager with fields:
	* ClientID
	* ClientSecret
	* tseId
	* collectionId (optional)

### Delete Landing Page

* Log in as the user or impersonate
* Grab the authorization bearer code
	* Aggregator is a good route to find this.
* Use the landingPageId
	* `v2/cloudpages/landing-pages/{landingPageId}`
	* channelItemId from the `v2/cloudpages/collections/{landingPageId}/items` route
