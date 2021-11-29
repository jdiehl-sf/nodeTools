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
			items: [],
			hasError: '',
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

	submit = () => {
		this.setState({
			items: [],
			showLoader: true,
			hasError: '',
			contextId_error: false,
			configName_error: false
		});

		axios.post('/routes/landing-page/publish', {
			configContext: this.state.contextId,
			configName: this.state.configName,
			pageContent: this.state.pageContent,
			landingPageName: this.state.landingPageName,
			collectionName: this.state.collectionName
		}).then(res => {
			this.setState({
				showLoader: false,
				items: res.data,
			});
		}).catch(err => {
			this.setState({
				showLoader: false,
				hasError: `${err.response.status}: ${err.response.data.error}`
			});
		});
	}

	render() {
		const { showLoader, hasError, items } = this.state;
		const success = items.length > 0 && (
			items.map((item, index) => (
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
							{ showLoader && <Spinner /> }
							{ error }
							{ success }
						</div>
					</div>
				</div>
			</DocumentTitle>
		);
	}
}

export default PublishLandingPage;