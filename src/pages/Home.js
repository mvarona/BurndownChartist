import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import LoginDialog from '../components/LoginDialog';
import logo from './img/logo.png';
import img1 from './img/infinite/img1.gif';
import img3 from './img/infinite/img3.gif';
import img4 from './img/infinite/img4.gif';
import img5 from './img/infinite/img5.gif';
import img6 from './img/infinite/img6.gif';
import img7 from './img/infinite/img7.gif';
import Footer from '../containers/Footer';
import ReactGA from 'react-ga';

export default class Home extends Component {
    constructor(props){
        super(props);
        this.state = {
            isLoginDialogVisible: false
        }
    }

    componentWillMount(){
        if (window.location.href.indexOf("#login") !== -1){
            this.setState({ isLoginDialogVisible:true });
        } 
    }

    render() {
        
        document.documentElement.lang = "en";
        
        return (
            <div className="page">
            <div className="page-content Home">
                    <img className='logo main' alt='BurndownChartist logo' src={logo}/>
                    <h1 className='main'>BurndownChartist</h1>
                    <br/>
                    <h3 className='main'>
                        <em>Professional personal productivity</em>
                    </h3>
                    <div className='loginContainer main'>
                        <a role="button" href="https://burndownchart.ist/chart" className="light-text pt-button pt-intent-primary">Login</a>
                        <br/>
                        <span role="button" onClick={() => this.setState({isLoginDialogVisible: true })}>Problem logging or different user?</span>
                    </div>
                    <hr />
                    <div className="hero parallax">
                    </div>
                    <hr/>
                    <br/>
                    <h2><span role="img" aria-label="graph">📉</span> The only burndown chart for Todoist</h2>
                    <br/>
                    <h3>100% compatible whether you are a Premium user or not</h3>
                    <table role="grid" className="main home tTwoColumns">
                        <thead>
                            <tr>
                                <th>
                                    <span role="columnheader"><span role="img" aria-label="user">👤</span> Todoist Premium</span>
                                    <br/>
                                    <span className='clarify'>(You can choose between no premium syntax or this one)</span>
                                </th>
                                <th>
                                    <span role="columnheader"><span role="img" aria-label="user">👤</span> Todoist not premium</span>
                                    <br/>
                                    <br/>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td role="gridcell">
                                    <span className='story'>Estimate the duration for each task using a label</span>
                                    <div className='imgContainer'>
                                        <img id="premiumScreenshot1" className="todoist screenshot" src={img7} alt="Todoist task name: Refactor component. Todoist task label: @3" />
                                    </div>
                                </td>
                                <td role="gridcell">
                                    <span className='story'>Estimate the duration for each task with <em>$time</em> on its name</span>
                                    <div className='imgContainer'>
                                        <img id="imgScreenshot1" className="todoist screenshot" src={img1} alt="Todoist task name: Refactor component. Todoist task label: $3" />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2">
                                    <h5 className='big'>The task was estimate to be 3 hours long...</h5>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="main home tOneColumn">
                        <tbody>
                            <tr>
                                <td role="gridcell">
                                    <span role="columnheader"><span role="img" aria-label="user">👤</span> Todoist Premium:</span>
                                    <br/>
                                    <span className='clarify'>(You can choose between no premium syntax or this one)</span>
                                </td>
                            </tr>
                            <tr>
                                <td role="gridcell">
                                    <span className='story'>Estimate the duration for each task using a label</span>
                                    <div className='imgContainer'>
                                        <img id="premiumScreenshot1" className="todoist screenshot" src={img7} alt="Todoist task name: Refactor component. Todoist task label: @3" />
                                    </div>
                                    <h5 className='left'>The task was estimate to be 3 hours long...</h5>
                                </td>
                            </tr>
                            <tr>
                                <td className='tHeaderColumnCollapsed'>
                                    <span role="columnheader"><span role="img" aria-label="user">👤</span> Todoist not premium:</span>
                                </td>
                            </tr>
                            <tr>
                                <td role="gridcell">
                                    <span className='story'>Estimate the duration for each task with <em>$time</em> on its name</span>
                                    <div className='imgContainer'>
                                        <img id="imgScreenshot1" className="todoist screenshot" src={img1} alt="Todoist task name: Refactor component. Todoist task label: $3" />
                                    </div>
                                    <hr/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="main big">
                        <tbody>
                            <tr>
                                <td role="gridcell">
                                    <span className='story'>Complete a task as usual, and if its duration has differed from estimate, add <em>^realTime</em> on its name</span>
                                    <div className='imgContainer big'>
                                        <img id="imgScreenshot2" className="todoist screenshot moveLeft" src={img4} alt="Complete a task as usual on Todoist, and its completion date will be right on the chart" />
                                    </div>
                                    <h5 className='big moveLeft'>Love when everything turns out as planned...</h5>
                                    <br/>
                                    <div className='imgContainer big'>
                                        <img id="imgScreenshot2" className="todoist screenshot moveRight" src={img5} alt="Todoist task name: Refactor component ^5. Task completed but after 5 hours instead" />
                                    </div>
                                    <h5 className='big moveRight'>But life is hard, so this task was completed after 5 hours...</h5>
                                </td>
                            </tr>
                            <tr>
                                <td role="gridcell">
                                    <span className='story'>Did you complete a task other day and forgot to mark it? Just add <em>%%completionDate%%</em> to its name and mark it whenever you want</span>
                                    <div className='imgContainer big'>
                                        <img id="imgScreenshot2" className="todoist screenshot" src={img6} alt="Todoist task name: Refactor component %%2019-06-12%% ^5" />
                                    </div>
                                    <h5 className='big'>Almost forgot what Tim did yesterday!</h5>
                                </td>
                            </tr>
                            <tr>
                                <td role="gridcell">
                                    <span className='story'>Track progress for not completed tasks by adding to its name <em>^[date: number, ...]</em></span>
                                    <div className='imgContainer'>
                                        <img id="imgScreenshot3" className="todoist screenshot" src={img3} alt="Todoist task name: Refactor component ^[2019-06-20: 1, 2019-06-21: 1]" />
                                    </div>
                                    <h5 className='big'>Hopefully, we started three days ago and now it's done!</h5>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <hr/>
                    <section className='reasons'>
                        <h2><span role="img" aria-label="graph">📊</span> Burndown chart, on Todoist</h2>
                        <p>
                            Work with all your Todoist apps as always, but be more productivity than never before.<br/>
                            Know how far you are from yor expectative and plan your personal life much better. Work seamlessly at the office, with the same tool you do on your home. Boost your personal productivity like a Pro, and manage your work with the calm of a Tibetan monk.
                        </p>
                        <h2><span role="img" aria-label="padlock">🔐</span> Nobody will know that you are procrastinating</h2>
                        <p>BurndownChartist is as secure as it should be. We do not send your data through Internet, so nobody (not even us) will read your Todoist data. Everything is stored and processed on your browser and is not shared with nobody else than you. We don't work with accounts and passwords, but with your Todoist token, so it's really secure.</p>
                        <h2><span role="img" aria-label="gear">⚙️</span> Even more useful than hard to spell</h2>
                        <p>
                            With BurndownChartist, you can check how many hours or minutes you worked each day, export the burndown chart to a file and show off with your friends about who is the most productivity creature alive. It's weird but we know you do it.
                        </p>
                        <h2><span role="img" aria-label="hands">👐</span> <em>Open</em> stands for <em>Oooh :3</em></h2>
                        <p>
                            This is an open source project by <a target="_blank" rel="noopener noreferrer" href="https://www.github.com/mvarona">Mario Varona</a> with <a target="_blank" rel="noopener noreferrer" href="https://github.com/mvarona/BurndownChartist/blob/master/LICENSE">MIT license</a>, that means that anyone can improve it so that we all live in a more productive world. And by the way, it's completely free.
                        </p>
                    </section>
                    <hr/>
                    <section className='notes'>
                        <p>
                            Inspired and based on the amazing <a target="_blank" rel="noopener noreferrer" href="https://kanban.ist">kanban.ist</a> by <a target="_blank" rel="noopener noreferrer" href="https://github.com/mwakerman/">Misha Wakerman.</a>
                        </p>
                        <br/>
                        <p>
                            BurndownChartist is not created by, affiliated with, or supported by <a target="_blank" rel="noopener noreferrer" href="https://www.doist.com">Doist</a>, the team behind the best productivity app, <a target="_blank" rel="noopener noreferrer" href="https://www.todoist.com">Todoist</a>.
                        </p>
                        <br/>
                        <a rel="noopener noreferrer" target="_blank" href="https://www.privacypolicygenerator.info/live.php?token=DfHmUK8kYrte03OiYHZSKLjAF7MnbDIY">Privacy Policy</a>
                    </section>
                    { this.state.isLoginDialogVisible ? <LoginDialog /> : null }
                </div>
            <Footer />
            </div>
        )
    }
}
