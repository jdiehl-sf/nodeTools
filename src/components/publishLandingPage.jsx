import React from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import DocumentTitle from 'react-document-title';
import Spinner from './spinner';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class PublishLandingPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showLoader: false,
			hasError: '',
			successAuth: false,
			successCollection: false,
			successCreate: false,
			successState: false,
			successPublish: false,
			landingPageId: '',
			urlObject: [],
			stackKey: '',
			//Payload
			contextId: '',
			configName: '',
			landingPageName: '',
			pageContent: '',
			collectionName: ''
		};
	}

	componentDidMount() {}

	handleChange = (event) => {
		const { target } = event;
		const { name } = target;
		let { value } = target;

		if (target.type === 'checkbox') {
			value = target.checked;
		}

		this.setState({ [name]: value });
	}

	getAuth = async () => {
		// GET AUTH DATA
		await axios.get('/routes/auth', {
			configContext: this.state.contextId,
			configName: this.state.configName,
		}).then(res => {
			this.setState({
				successAuth: true,
				stackKey: res.data.stackKey
			});
			document.cookie = `bearerToken=${res.data.bearerToken}; SameSite=None; Secure`;
			document.cookie = `hostname=${res.data.hostname}; SameSite=None; Secure`;
			document.cookie = `collectionId=${res.data.collectionId}; SameSite=None; Secure`;
		}).catch(err => {
			this.setState({
				showLoader: false,
				hasError: `${err.response.status}: ${err.response.data.error}`
			});
		});
	}

	createCollection = async () => {
		const options = {
			collectionName: this.state.collectionName,
		}
		await axios({
			url: 'routes/collection/',
			method: 'post',
			data: options
		}).then(res => {
			this.setState({
				collectionId: res.data.collectionId,
				successCollection: true
			});
		}).catch(err => {
			this.setState({
				showLoader: false,
				hasError: `${err.response.status}: ${err.response.data.error}`
			});
		});
	}

	createLandingPage = async () => {
		const data = {
			pageContent: this.state.pageContent,
			landingPageName: this.state.landingPageName,
			collectionId: this.state.collectionId,
			stackKey: this.state.stackKey
		}
		await axios({
			url: 'routes/landing-page/',
			method: 'post',
			data
		}).then(res => {
			this.setState({
				landingPageId: res.data.landingPageId,
				landingPageName: res.data.name,
				successCreate: true
			});
		}).catch(err => {
			this.setState({
				showLoader: false,
				hasError: `${err.response.status}: ${err.response.data.error}`
			});
		});
	}

	getStateId = async () => {
		await axios({
			url: `/routes/state/${this.state.landingPageId}`,
			method: 'get'
		}).then(res => {
			this.setState({
				stateId: res.data.stateId,
				successState: true
			});
		}).catch(err => {
			this.setState({
				showLoader: false,
				hasError: `${err.response.status}: ${err.response.data.error}`
			});
		});
	}

	publishPage = async () => {
		await axios({
			url: `/routes/landing-page/${this.state.landingPageId}/publish`,
			method: 'post',
			data: {
				stateId: this.state.stateId
			},
		}).then(res => {
			this.state.urlObject.unshift({
				name: this.state.landingPageName,
				stack: this.state.stackKey,
				publishedUrl: res.data.url
			})

			this.setState({
				url: res.data.url,
				urlObject: this.state.urlObject,
				successState: false,
				successCreate: false,
				successCollection: false,
				collectionName: '',
				landingPageName: '',
				showLoader: false
			});
		}).catch(err => {
			this.setState({
				showLoader: false,
				hasError: `${err.response.status}: ${err.response.data.error}`
			});
		});
	}

	submit = async () => {
		this.setState({
			showLoader: true,
			hasError: '',
			contextId_error: false,
			configName_error: false
		});

		if (!this.getCookie('bearerToken')) {
			await this.getAuth();
		}

		if (this.state.collectionName) {
			await this.createCollection();
		}

		if (!this.state.hasError) {
			// CREATE LANDING PAGE
			await this.createLandingPage();
		}

		if (!this.state.hasError) {
			// GET STATE ID
			await this.getStateId();
		}

		if (!this.state.hasError) {
			// PUBLISH PAGE
			await this.publishPage();
		}
	}

	getCookie = (cname) => {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}

		return '';
	}

	render() {
		const { showLoader, hasError, successAuth, successCollection, successCreate, successState } = this.state;

		const auth = successAuth && (
			<div className="alert alert-success" role="alert">
				<div className="">Authorized</div>
			</div>
		);
		
		const collection = successCollection && (
			<div className="alert alert-success" role="alert">
				<div className="">Collection created</div>
			</div>
		);

		const create = successCreate && (
			<div className="alert alert-success" role="alert">
				<div className="">Landing page created</div>
			</div>
		);

		const state = successState && (
			<div className="alert alert-success" role="alert">
				<div className="">Page State recieved</div>
			</div>
		);
		
		const urlObject = this.state.urlObject.length > 0 && (
			this.state.urlObject.map((item, index) => (
				<div key={uuidv4()} className="alert alert-success" role="alert">
					<div className="">{item.stack}</div>
					<div>{(index === 0) && <span className="badge bg-secondary">New</span>} <b>{item.name}</b> published successfully.</div>
					<div data-label="File"><a href={item.publishedUrl} target="_blank">{item.publishedUrl}</a></div>
				</div>
			))
		);

		const error = hasError && (
			<div className="alert alert-danger" role="alert">
				<div className="">{hasError}</div>
			</div>
		);

		return (
			<DocumentTitle title="Page Response Test">
				<div className="container">
					<div className="row">
						<div className="col">
							<div className="card p-3">
								<Form.Group className="mb-3" controlId="contextId">
									<Form.Label>Test Manager Context Id</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="contextId"
										required
									/>
									<Form.Text className="text-muted">
										If blank, you must have .env file (CONTEXT_ID)
									</Form.Text>
								</Form.Group>
								<Form.Group className="mb-3" controlId="configName">
									<Form.Label>Test Manager Config Name</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="configName"
										required
									/>
									<Form.Text className="text-muted">
										If blank, you must have .env file (CONFIG_NAME)
									</Form.Text>
								</Form.Group>
								<Form.Group className="mb-3" controlId="landingPageName">
									<Form.Label>Landing Page Name</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="landingPageName"
									/>
									<Form.Text className="text-muted">
										If blank, a random name will be generated
									</Form.Text>
								</Form.Group>
								<Form.Group className="mb-3" controlId="pageContent">
									<Form.Label>Page content</Form.Label>
									<Form.Control
										as="textarea"
										rows={10}
										onChange={this.handleChange}
										name="pageContent"
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="collectionName">
									<Form.Label>Collection Name</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="collectionName"
									/>
									<Form.Text className="text-muted">
										If blank, you must have "collectionId" defined in Test Manager config
									</Form.Text>
								</Form.Group>
								<Button variant="primary" type="submit" onClick={this.submit}>Submit</Button>
							</div>
						</div>
						<div className="col">
							{ auth }
							{ urlObject }
							{ collection }
							{ create }
							{ state }
							{ showLoader && <Spinner /> }
							{ error }
						</div>
					</div>
				</div>
			</DocumentTitle>
		);
	}
}

export default PublishLandingPage;