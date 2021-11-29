import React from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import DocumentTitle from 'react-document-title';
import Spinner from './spinner';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class DeleteLandingPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showLoader: false,
			items: [],
			hasError: '',
			//Payload
			bearerToken: '',
			stackKey: '',
			landingPageId: null
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
		if(!this.state.bearerToken) {
			const bearerToken_error = !Boolean(this.state.bearerToken_error);
			this.setState({
				bearerToken_error,
			});
		} else {
			this.setState({
				items: [],
				showLoader: true,
				hasError: '',
				bearerToken_error: false
			});
	
			axios.post('/routes/landing-page/delete', {
				bearerToken: this.state.bearerToken,
				stackKey: 'qa1s1',
				landingPageId: this.state.landingPageId
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
	}

	render() {
		const { showLoader, hasError, items } = this.state;
		const success = items.length > 0 && (
			items.map((item, index) => (
				<div key={uuidv4()} className="alert alert-success" role="alert">
					<div className="">Success</div>
				</div>
			))
		);

		const error = hasError && (
			<div className="alert alert-danger" role="alert">
				<div className="">{hasError}</div>
			</div>
		);

		return (
			<DocumentTitle title="Delete Landing Page">
				<div className="container">
					<div className="row">
						<div className="col">
							<div className="card p-3">
								<Form.Group className="mb-3" controlId="bearerToken">
									<Form.Label>Bearer Token</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="bearerToken"
										required
										className={this.state.bearerToken_error && 'is-invalid'}
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="landingPageId">
									<Form.Label>Landing Page Id</Form.Label>
									<Form.Control
										type="text"
										onChange={this.handleChange}
										name="landingPageId"
									/>
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

export default DeleteLandingPage;