import React from 'react';
import './scss/index.scss';
import {
	HashRouter,
	Routes,
	Route
} from "react-router-dom";

import Navigation from './components/navigation';
import PublishLandingPage from './components/publishLandingPage';
import Playwright from './components/playwright';

function App() {
  return (
	<HashRouter>
		<div className="app">
			<div className="container">
				<div className="row">
					<header className="app-header mb-3">
						<nav className="navbar navbar-expand-lg navbar-light bg-light">
							{ <Navigation />}
						</nav>
					</header>
					<Routes>
					<Route exact path="/" element={<Playwright />} />
					<Route path="publish-landing-page" element={<PublishLandingPage />} />
					</Routes>
					<footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
						<p className="col-md-4 mb-0 text-muted">© 2021 Salesforce</p>
					</footer>
				</div>
			</div>
	  </div>
	</HashRouter>
  );
}

export default App;