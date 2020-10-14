import React from 'react';
import { Link } from 'react-router-dom';

export default class Footer extends React.Component {
    render() {
        document.documentElement.lang = "en";
        return (
            <div>
                <nav className="Footer pt-navbar pt-dark">
                    <div className="pt-navbar-group pt-align-left">
                        <a href="https://github.com/mvarona/BurndownChartist" target="_blank" rel="noopener noreferrer">
                            <button className="pt-button pt-minimal pt-icon-code" />
                        </a>
                    </div>
                    <div className="pt-navbar-group pt-align-right">
                        <a role="button" href="https://burndownchartist.appspot.com/issues" className="hide-if-small-750">
                            <button className="pt-button pt-minimal pt-icon-application">Known Issues</button>
                        </a>

                        <a href="https://github.com/mvarona/BurndownChartist/issues" target="_blank" rel="noopener noreferrer">
                            <button className="pt-button pt-minimal pt-icon-error hide-if-small-750">
                                Bugs & Feature Requests
                            </button>
                        </a>

                        <span className="pt-navbar-divider hide-if-small-750" />
                        v. 1.0               
                    </div>
                </nav>
            </div>
        );
    }
}
