import React from "react";
import DocumentTitle from "react-document-title";
import Spinner from './spinner';
import ClassNames from 'classnames';

class Playwright extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showLoader: false,
			searchUrl: '',
			repeat: 1,
			filter: '',
			items: [],
			errors: []
		};
	}

	componentDidMount() {}

	handleChange = (event) => {
		const { target } = event;
		const { name } = target;
		let { value } = target;

		this.setState({ [name]: value });
	}

	submit = () => {
		this.setState({
			items: [],
			errors: [],
			showLoader: true
		});

		fetch('/routes/playwright', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
					'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				url: this.state.searchUrl,
				repeat: this.state.repeat,
				filter: this.state.filter
			}),
		}).then((res) => res.json())
			.then(
			(result) => {
			this.setState({
				showLoader: false,
				items: result.items,
				errors: result.errors
			});
			},
			(error) => {
				this.setState({
					showLoader: false,
				});
			}
		);
	}

	render = () => {
		const { errors, showLoader, items } = this.state;
		const dataTable = items.length > 0 && (
			<div>
				<table className="table table-striped" aria-label="table">
					<tbody>
						<tr>
							<td className="" colSpan="2" scope="row">Errors</td>
						</tr>
				{errors.map((item) => (
						<tr key={`item_${item.id}`}>
							<td className={ClassNames({ 'bg-danger': item.status !== 200, 'text-white': item.status !== 200})}>{item.status}</td>
							<td data-label="File"><a href={item.route} target="_blank">{item.route}</a></td>
						</tr>
				))}
					</tbody>
				</table>
				<hr />
				<table className="table table-striped" aria-label="table">
					<tbody>
						<tr>
							<td className="" colSpan="2" scope="row">Success</td>
						</tr>
				{items.map((item) => (
						<tr key={`item_${item.id}`}>
							<td className={ClassNames({ 'bg-danger': item.status !== 200, 'text-white': item.status !== 200})}>{item.status}</td>
							<td data-label="File"><a href={item.route} target="_blank">{item.route}</a></td>
						</tr>
				))}
					</tbody>
				</table>
			</div>
		);

		return (
			<DocumentTitle title="Page Response Test">
				<div className="container">
					<div className="row">
						<div className="col">
							<form className="card p-3">
								<input
									onChange={this.handleChange}
									type="text"
									id="searchUrl"
									name="searchUrl"
									className="form-control mb-3"
									placeholder="URL"
									aria-label="URL"
									aria-describedby="URL"
								/>
								<input
									onChange={this.handleChange}
									type="text"
									id="repeat"
									name="repeat"
									className="form-control mb-3"
									placeholder="Repeat"
									aria-label="Repeat"
									aria-describedby="Repeat"
								/>
								<input
									onChange={this.handleChange}
									type="text"
									id="filter"
									name="filter"
									className="form-control mb-3"
									placeholder="Filter By"
									aria-label="Filter By"
									aria-describedby="Filter By"
								/>
								<button
									onClick={this.submit}
									className="btn btn-primary"
									type="button"
									id="submit"
								>Submit</button>
							</form>
						</div>
						<div className="col">
							{ showLoader ? (<Spinner />) : dataTable }
						</div>
					</div>
				</div>
			</DocumentTitle>
		);
	}
}

export default Playwright;
