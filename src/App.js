import React from 'react';
import { ConnectedRouter as Router } from 'react-router-redux';
import { Route, Switch, Link } from 'react-router-dom';
import { FocusStyleManager } from '@blueprintjs/core';

import Chart from './components/Chart';
import Header from './containers/Header';

import './App.css';
import '../node_modules/@blueprintjs/core/dist/blueprint.css';

// Pages
import Issues from './pages/Issues';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Donate from './pages/Donate';

// Control focus outline visibility.
FocusStyleManager.onlyShowFocusOnTabs();

class App extends React.Component {
    componentWillMount() {
        const { history } = this.props;
        this.unsubscribeFromHistory = history.listen(this.handleLocationChange);
    }

    componentWillUnmount() {
        if (this.unsubscribeFromHistory) this.unsubscribeFromHistory();
    }

    render() {
        const { actions, history } = this.props;
        return (
            <Router history={history}>
                <div className="App">
                    <Header history={history} />
                    <div className="main-content">
                        <Switch>
                            {/* note: add new paths to netlify/_redirects */}
                            <Route exact={true} path="/" component={Home} />
                            <Route path="/chart" component={props => <Chart actions={actions} {...props} />} />
                            <Route path="/issues" component={Issues} />
                            <Route path="/demo" component={Demo} />
                            <Route path="/donate" component={Donate} />

                            {/* Catch-all => 404 */}
                            <Route
                                component={() => (
                                    <div>
                                        <h1>404 Not Found</h1>
                                        <Link to="/">Home</Link>
                                    </div>
                                )}
                            />
                        </Switch>
                    </div>
                </div>
            </Router>
        );
    }
}

export default App;
