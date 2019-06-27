import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { AnchorButton, Intent } from '@blueprintjs/core';

import { actions as userActions } from '../redux/modules/user';
import { actions as listsActions } from '../redux/modules/lists';
import { actions as uiActions } from '../redux/modules/ui';

class Header extends React.Component {
    render() {
        const { user, logout, } = this.props;

        const { loggedIn } = user;

        const logoutButton = (
            <AnchorButton
                className="light-text header-right"
                text="Logout"
                role="button"
                onClick={() => {
                    logout();
                    this.props.history.push('/');
                }}
                intent={Intent.PRIMARY}
            />
        );

        const loginButton = (
            <Link role="button" to="/chart" className="light-text pt-button pt-intent-primary">
                Login
            </Link>
        );

        const atChart = this.props.history.location.pathname === '/chart';
        const chartButton = <button className="pt-button pt-minimal pt-icon-timeline-line-chart">Chart</button>;
        const welcomeSentence = <span role="heading" className='welcome'>Welcome, {this.props.user.user['full_name']}</span>

        document.documentElement.lang = "en";

        return (
            <nav className="Header pt-navbar pt-fixed-top">
                <div className="pt-navbar-group pt-align-left">
                    <div className="pt-navbar-heading font-roboto">
                        <Link role="button" to="/">BurndownChartist</Link>
                    </div>
                    <span className="pt-navbar-divider" />
                    {/* Board button does nothing if at /board (prevents potential query string being cleared) */}
                    {atChart ? chartButton : <Link role="button" to={'/chart'}>{chartButton}</Link>}
                </div>
                <div className="pt-navbar-group pt-align-right hide-if-small-500">
                    {loggedIn ? welcomeSentence : null}
                    {loggedIn ? logoutButton : loginButton}
                </div>
            </nav>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        fetching: state.lists.fetching,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        logout: () => {
            dispatch(listsActions.clearAll());
            dispatch(uiActions.restoreInitialState());
            dispatch(userActions.logout());
        },

        fetchLists: token => {
            dispatch(listsActions.fetchLists(token));
        },

        toggleToolbar: () => {
            dispatch(uiActions.toggleToolbar());
        },
        toggleBacklog: () => {
            dispatch(uiActions.toggleBacklog());
        },
    };
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Header)
);
