import React from "react";
import axios from "axios";
import DocumentTitle from "react-document-title";
import Spinner from './spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class PublishLandingPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showLoader: false,
			searchUrl: '',
			items: [],
			hasError: ''
		};
	}

	componentDidMount() {}

	submit = () => {
		this.setState({
			items: [],
			showLoader: true
		});

		axios.post('/routes/publish-landing-page', {
			configContext: 'f17aaef6-8a76-4802-ad9b-38d5d2ea42e2',
			configName: 'JDiehl',
			stackKey: 'S1',
			pageContent: '',
			createNewCollection: 1,
			landingPageName: 'JD _ Context Ent DE',
			collectionName: 'my new folder'
		}).then(res => {
			this.setState({
				showLoader: false,
				items: res.items,
			});
		}).catch(error => {
			this.setState({
				showLoader: false,
				hasError: error
			});
		});

		// ../Templates/throttling_noop.html 1 "Context Ent DE" "My New Folder"
		// fetch('/routes/publish-landing-page', {
		// 	method: 'POST',
		// 	headers: {
		// 		Accept: 'application/json',
		// 			'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify({
		// 		configContext: 'f17aaef6-8a76-4802-ad9b-38d5d2ea42e2',
		// 		configName: 'JDiehl',
		// 		stackKey: 'S1',
		// 		pageContent: '',
		// 		createNewCollection: 1,
		// 		landingPageName: 'JD _ Context Ent DE',
		// 		collectionName: 'my new folder'
		// 	}),
		// }).then(res => {
		// 	this.setState({
		// 		showLoader: false,
		// 		items: res.items,
		// 	});
		// 	// return;
		// 	// res.json()
		// }).catch(error => {
		// 	if(res.status !== 200) {
		// 		this.setState({
		// 			showLoader: false,
		// 			hasError: error
		// 		});
		// 	}
		// });
	}

	render() {
		const { showLoader } = this.state;
		const dataTable = !showLoader && (
			<div>
				<table className="table table-striped" aria-label="table">
					<tbody>
						<tr>
							<td className="" colSpan="2" scope="row">Errors</td>
						</tr>
						<tr key="">
							<td className="">Hello</td>
							<td data-label="File"><a href="" target="_blank">Hello</a></td>
						</tr>
					</tbody>
				</table>
			</div>
		);

		return (
			<DocumentTitle title="Page Response Test">
				<div className="container">
					<div className="row">
						<div className="col">
							<div className="card p-3">
								<Form.Group className="mb-3" controlId="contextId">
									<Form.Label>Context Id</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="contextId"
									/>
								</Form.Group>
								<Dropdown className="dropdown mb-3">
									<Dropdown.Toggle variant="light" id="dropdown-basic">
										Stack
									</Dropdown.Toggle>
									<Dropdown.Menu>
										<Dropdown.Item href="#/action-1">S1</Dropdown.Item>
										<Dropdown.Item href="#/action-2">S4</Dropdown.Item>
										<Dropdown.Item href="#/action-3">S8</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
								<Form.Group className="mb-3" controlId="landingPageName">
									<Form.Label>Landing Page Name</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="landingPageName"
									/>
								</Form.Group>
								<Dropdown className="dropdown mb-3">
									<Dropdown.Toggle variant="light" id="dropdown-basic">
										PGS Content
									</Dropdown.Toggle>
									<Dropdown.Menu>
										<Dropdown.Item href="#/action-1">Throttling NOOP</Dropdown.Item>
										<Dropdown.Item href="#/action-2">SSJS</Dropdown.Item>
										<Dropdown.Item href="#/action-3">AMPScript</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
								<Form.Group className="mb-3" controlId="collectionId">
									<Form.Label>Collection ID</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="collectionId"
									/>
									<Form.Text className="text-muted">
										If "0", will use collection ID from Test Manage
									</Form.Text>
								</Form.Group>
								<Button variant="primary" type="submit" onClick={this.submit}>
									Submit
								</Button>
							</div>
						</div>
						<div className="col">
							{ showLoader ? (<Spinner />) : dataTable }
							{ this.state.hasError }
						</div>
					</div>
				</div>
			</DocumentTitle>
		);
	}
}

export default PublishLandingPage;