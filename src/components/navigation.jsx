import React from "react";
import { NavLink } from "react-router-dom";

class Navigation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {}

	render = () => {
		return (
			<ul className="navbar-nav me-auto mb-2 mb-lg-0 gx-5">
				<li className="nav-item">
					<NavLink activeclassname="active" to="/" className="nav-link">Page Response Test</NavLink>
				</li>
				<li className="nav-item">
					<NavLink activeclassname="active" to="/publish-landing-page" className="nav-link">Publish Landing Page</NavLink>
				</li>
				<li className="nav-item">
					<NavLink activeclassname="active" to="/delete-landing-page" className="nav-link">Delete Landing Page</NavLink>
				</li>
			</ul>
		);
	}
}

export default Navigation;