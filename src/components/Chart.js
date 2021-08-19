import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import flow from 'lodash/flow';
import Dimensions from 'react-dimensions';
import { Intent, NonIdealState } from '@blueprintjs/core';
import { AnchorButton } from '@blueprintjs/core';
import moment from 'moment';
import Todoist from '../todoist-client/Todoist';
import Raven from 'raven-js';
import SprintDayPicker from './SprintDayPicker';
import Swal from 'sweetalert2';
import ChartJS from 'chart.js';
import Footer from '../containers/Footer';

const ESTIMATE_PREFERENCE_NAME = 0;
const ESTIMATE_PREFERENCE_LABEL = 1;

var taskProccessing = function(){

    var filteredFetchedTasks = [];
    var fetchedTasks = [];
    var fetchedChildrenProjectsIDs = [];
    var fetchedLabels = [];
    var remainingTime = [];
    var realRemainingTime = [];
    var workedTime = [];
    var sprintDays = [];
    var selectedProject;
    var sprintBegin;
    var sprintEnd;
    var estimatePreference;
    var token;
    var premium;

    function exportCanvasAsPNG(id, fileName) {

        var canvasElement = document.getElementById(id);

        var MIME_TYPE = "image/png";

        var imgURL = canvasElement.toDataURL(MIME_TYPE);

        var dlLink = document.createElement('a');
        dlLink.download = fileName;
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    }

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function isValidDate(d) {
      d = new Date(d);
      return d instanceof Date && !isNaN(d);
    }

    function fetchTasks(project, sprintBegin, sprintEnd, token, premium, estimatePreference, combineSubprojectsTasks) {
        if (estimatePreference == ESTIMATE_PREFERENCE_LABEL && premium == true){
            Todoist.fetchLabels(token)
                .then(response => {
                    fetchedLabels = [];
                    fetchedLabels = response['labels'];
                })
                .catch(err => {
                    Raven.captureException(err);
                    Swal.fire('This is embarrasing...', 'A wild problem happened trying to fetch your Todoist labels searching the estimate durations, please try again later or contact me at m.varona@bmsalamanca.com if the error persists. Error message:' + err, 'error');
                });
        }

        if (combineSubprojectsTasks == true){
            Todoist.fetchProjects(token)
                .then(response => {
                    fetchedChildrenProjectsIDs = [];
                    fetchedChildrenProjectsIDs = response['projects'].filter(function (fetchedProject) {
                        return fetchedProject.parent_id == project;
                    }).map(childProject => childProject.id);
                })
                .catch(err => {
                    Raven.captureException(err);
                    Swal.fire('This is embarrasing...', 'A wild problem happened trying to fetch your Todoist projects searching the subprojects for the one you specified, please try again later or contact me at m.varona@bmsalamanca.com if the error persists. Error message:' + err, 'error');
                });
        }

        
        Todoist.fetchTasks(token)
            .then(response => {

                filteredFetchedTasks = [];
                fetchedTasks = [];
                remainingTime = [];
                realRemainingTime = [];
                workedTime = [];
                sprintDays = [];

                fetchedTasks = response['tasks'];

                // Create sprintDays, an array compound of every day on the sprint, and workedTime, an array compound of the amount of time worked for each day:

                var dateToAdd = sprintBegin;
                while (dateToAdd.format('YYYY-MM-DD') !== sprintEnd.format('YYYY-MM-DD')){
                    dateToAdd = moment(dateToAdd, 'YYYY-MM-DD');
                    sprintDays.push(dateToAdd.format('YYYY-MM-DD'));
                    workedTime.push(0);
                    realRemainingTime.push(0);
                    dateToAdd = moment(dateToAdd).add(1, 'days');
                }

                // Create filteredFetchedTasks, an array compound of every task which belongs to selected project and which due date is within the sprint:

                for (var i = 0; i < fetchedTasks.length; i++) {
                    if (fetchedTasks[i].project_id == project || fetchedChildrenProjectsIDs.includes(fetchedTasks[i].project_id)){

                        var dueDate = fetchedTasks[i].due;

                        if (dueDate != null){
                            dueDate = dueDate.date;
                            dueDate = moment(dueDate, 'YYYY-MM-DD');
                            dueDate = new Date(dueDate.toString());
                            
                            if (dueDate >= new Date(sprintBegin) && dueDate <= new Date(sprintEnd)){
                                // Estimate syntax ($number):
                                var estimateRegex = /\$[0-9]+/g;
                                // Completion syntax (^number):
                                var completionRegex = /\^[0-9]+/g;
                                // Completion date syntax (%%yyyy-mm-dd%%):
                                var completionDateRegex = /%%[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]%%/g;
                                // Progress syntax (^[yyyy-mm-dd: number]), with or without space before number and with one or more element inside the square brackets:
                                var progressRegex = /(([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]:[0-9])|([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]: [0-9]))|(([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]:[0-9],)|([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]: [0-9],))*(([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]:[0-9])|([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]: [0-9]))/g;
                                // Easy fix to progresRegex so that it doesn't accept square brackets which do not begin with '^':
                                var fixProgressRegex = /\^\[/g;

                                // Create new fields so they are not null whether they applied or not:
                                fetchedTasks[i].progressTimeMade = 0;

                                // Different behaviour whether the user is premium or not:

                                if (premium == false){

                                    // No-premium user: Search for estimate, completion and progress syntax on the task name, and store this data on new fields for each task:

                                    if (estimateRegex.test(fetchedTasks[i].content) == true){
                                        fetchedTasks[i].estimate = parseInt((fetchedTasks[i].content.match(estimateRegex)[0]).substr(1));
                                    }

                                } else {

                                    // Premium user: Search for estimate, completion and progress syntax on the task name or task label, according to user preference, and store this data on new fields for each task:

                                    if (estimatePreference == ESTIMATE_PREFERENCE_LABEL){
                                        if (fetchedTasks[i].labels.length !== 0){
                                            for (var j = 0; j < fetchedTasks[i].labels.length; j++){
                                                for (var k = 0; k < fetchedLabels.length; k++) {
                                                    if (fetchedLabels[k].id == fetchedTasks[i].labels[j]){
                                                        if (isNumber(parseInt(fetchedLabels[k].name))){
                                                            if (fetchedTasks[i].estimate == null){
                                                                fetchedTasks[i].estimate = parseInt(fetchedLabels[k].name);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            Swal.fire('Mmmm...', 'We could not find labels for the tasks specified... Please make sure that each task has a estimate duration with a numeric label specified, try again later or contact me at m.varona@bmsalamanca.com if the error persists.', 'error');
                                        }

                                    } else if (estimatePreference == ESTIMATE_PREFERENCE_NAME){
                                        if (estimateRegex.test(fetchedTasks[i].content) == true){
                                            fetchedTasks[i].estimate = parseInt((fetchedTasks[i].content.match(estimateRegex)[0]).substr(1));
                                        }
                                    }

                                }

                                if (fetchedTasks[i].checked == 1){

                                    var completionDate = fetchedTasks[i].date_completed;

                                    completionDate = moment(completionDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
                                    
                                    fetchedTasks[i].completionDate = completionDate;

                                    if (completionRegex.test(fetchedTasks[i].content) == true){
                                       fetchedTasks[i].completion = parseInt((fetchedTasks[i].content.match(completionRegex)[0]).substr(1));
                                    } else {
                                        fetchedTasks[i].completion = parseInt(fetchedTasks[i].estimate);
                                    }
                                }

                                if (completionDateRegex.test(fetchedTasks[i].content) == true){
                                    var completionDate = (fetchedTasks[i].content.match(completionDateRegex)[0]).substr(2);
                                    completionDate = completionDate.substr(0, completionDate.length - 2);

                                    if (isValidDate(completionDate)){
                                        fetchedTasks[i].completionDate = completionDate;

                                        if (completionRegex.test(fetchedTasks[i].content) == true){
                                           fetchedTasks[i].completion = parseInt((fetchedTasks[i].content.match(completionRegex)[0]).substr(1));
                                        } else {
                                            fetchedTasks[i].completion = parseInt(fetchedTasks[i].estimate);
                                        }
                                        
                                    } else {
                                        Swal.fire('Incorrect completion date', 'Please make sure that all completed tasks have a completion date on its name that follows the %%yyyy-mm-dd%% pattern (taskName ^number %%yyyy-mm-dd%%), and try again later or contact me at m.varona@bmsalamanca.com if the error persists.', 'error');
                                    }

                                } else {
                                    if (completionRegex.test(fetchedTasks[i].content) == true){
                                        Swal.fire('No completion date found', 'Please make sure that all completed tasks have a completion date on its name (taskName ^number %%yyyy-mm-dd%%) and try again later or contact me at m.varona@bmsalamanca.com if the error persists.', 'error');
                                    }
                                }

                                if (progressRegex.test(fetchedTasks[i].content) == true && fixProgressRegex.test(fetchedTasks[i].content) == true){

                                    if (completionDateRegex.test(fetchedTasks[i].content) == true){
                                        fetchedTasks[i].completion = 0;
                                    } else {
                                        var progressArray = fetchedTasks[i].content.match(progressRegex);
                                        fetchedTasks[i].progressMade = [];
                                        fetchedTasks[i].progressTimeMade = 0;

                                        for (var j = 0; j < progressArray.length; j++){
                                            var progressOcurrency = progressArray[j].replace("^[", "");
                                            progressOcurrency = progressOcurrency.replace(" ", "");
                                            progressOcurrency = progressOcurrency.replace("]", "");

                                            var dayOcurrency = progressOcurrency.split(":")[0];
                                            var timeOcurrency = progressOcurrency.split(":")[1];
                                            var progressInstance = [];
                                            progressInstance.push(dayOcurrency);
                                            progressInstance.push(timeOcurrency);

                                            fetchedTasks[i].progressMade.push(progressInstance);
                                            fetchedTasks[i].progressTimeMade += parseInt(timeOcurrency);

                                            // Sum progress to the worked time for that day:

                                            for (var k = 0; k < sprintDays.length; k++){
                                                if (sprintDays[k] == dayOcurrency){
                                                    workedTime[k] += parseInt(timeOcurrency);
                                                }
                                            }

                                        }
                                    }

                                }

                                if (fetchedTasks[i].estimate == null && estimatePreference == ESTIMATE_PREFERENCE_NAME){
                                    Swal.fire('Task without estimate found', 'The task ' + fetchedTasks[i].content + ' has not estimate duration according to the selected syntax. Please make sure all tasks within the sprint have a time estimate on its name (taskName $number) and try again later or contact me at m.varona@bmsalamanca.com if the error persists.', 'error');
                                }

                                if (fetchedTasks[i].estimate == null && estimatePreference == ESTIMATE_PREFERENCE_LABEL){
                                    Swal.fire('Task without estimate found', 'The task ' + fetchedTasks[i].content + ' has not estimate duration according to the selected syntax. Please make sure all tasks within the sprint have a time estimate on one of its labels (taskName @number, with @number as an existing label) and try again later or contact me at m.varona@bmsalamanca.com if the error persists.', 'error');
                                }
                            
                                filteredFetchedTasks.push(fetchedTasks[i]); 

                            }
                        }
                    }
                }                    

                // Create remainingTime, an array compound of all task duration estimates for each sprint day:

                for (var i = 0; i < sprintDays.length; i++){
                    remainingTime[i] = 0;
                    for (var j = 0; j < filteredFetchedTasks.length; j++){
                        var dueDate = filteredFetchedTasks[j].due.date;
                        dueDate = moment(dueDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
                        if (dueDate == sprintDays[i]){
                            remainingTime[i] += filteredFetchedTasks[j].estimate;
                        }
                    }
                }

                for (var i = 0; i < remainingTime.length; i++){
                    for (var j = remainingTime.length - 1; j > i; j--){
                        remainingTime[i] += remainingTime[j];
                    }   
                }

                // Sum completion time to the worked time for that day:

                for (var i = 0; i < sprintDays.length; i++){
                    for (var j = 0; j < filteredFetchedTasks.length; j++){
                        var completionDate = filteredFetchedTasks[j].completionDate;
                        completionDate = moment(completionDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
                        if (completionDate == sprintDays[i]){
                            workedTime[i] += filteredFetchedTasks[j].completion;
                        }
                    }
                }

                // Real remaining time calc:

                for (var i = 0; i < sprintDays.length; i++){
                    for (var j = 0; j < filteredFetchedTasks.length; j++){
                        if (filteredFetchedTasks[j].completionDate == null || moment(filteredFetchedTasks[j].completionDate, 'YYYY-MM-DD').format('YYYY-MM-DD') > sprintDays[i]){
                            realRemainingTime[i] += filteredFetchedTasks[j].estimate;

                            if (filteredFetchedTasks[j].progressMade != null){
                                for (var k = 0; k < filteredFetchedTasks[j].progressMade.length; k++) {
                                    var index = sprintDays.indexOf(moment(filteredFetchedTasks[j].progressMade[k][0], 'YYYY-MM-DD').format('YYYY-MM-DD'));

                                    for (var l = index; l < sprintDays.length; l++){
                                        realRemainingTime[l] -= parseInt(filteredFetchedTasks[j].progressMade[k][1]);
                                    }
                                }
                            }
                                    
                        }
                    }
                }

                for (var i = 0; i < sprintDays.length; i++){
                    for (var j = 0; j < filteredFetchedTasks.length; j++){
                        if (moment(filteredFetchedTasks[j].completionDate, 'YYYY-MM-DD').format('YYYY-MM-DD') == sprintDays[i]){
                            realRemainingTime[i] += - filteredFetchedTasks[j].completion + filteredFetchedTasks[j].estimate;
                        }
                        if (realRemainingTime[i] == 0){
                            for (var k = i; k < sprintDays.length; k++){
                                realRemainingTime[k] = 0;
                            }
                        } else if (realRemainingTime[i] < 0){
                            Swal.fire('Mmmm...', 'The results seem incorrect, please check that all the tasks with progress are marked and try again later, the completion date will be not taken into account.', 'error');
                        }
                    }
                }


                if (filteredFetchedTasks.length == 0 && estimatePreference == ESTIMATE_PREFERENCE_NAME){
                    Swal.fire('No tasks found', 'Please make sure all tasks within the sprint have a time estimate on its name (taskName $number) and try again later or contact me at m.varona@bmsalamanca.com if the error persists.', 'error');
                } else if (filteredFetchedTasks.length == 0 && estimatePreference == ESTIMATE_PREFERENCE_LABEL){
                    Swal.fire('No tasks found', 'Please make sure all tasks within the sprint have a time estimate on one of its labels (taskName @number, with @number as an existing label) and try again later or contact me at m.varona@bmsalamanca.com if the error persists.', 'error');
                } else {
                    document.getElementById('exportChartButton').removeAttribute("disabled");
                    document.getElementById('exportChartButton').removeAttribute("aria-disabled");
                    document.getElementById('exportChartButton').setAttribute("class", "pt-button pt-intent-primary light-text");
                    generateTable1();
                    generateGraph();
                    generateTable2();
                }

                document.getElementById("chartLoading").style.display = "none";

                return response;
            })
            .catch(err => {
                Raven.captureException(err);
                Swal.fire('This is embarrasing...', 'A wild problem happened trying to fetch your Todoist tasks, please try again later or contact me at m.varona@bmsalamanca.com if the error persists. Error message:' + err, 'error');
                return err;
            });
    }

    function generateTable1(){
     
        var table = "<span>Table 1: Work done and remaining for each sprint day</span><table rol='grid'><tbody><tr><th rol='columnheader'>Day</th><th rol='columnheader'>Work done</th><th rol='columnheader'>Work remaining</th></tr>";

        for (var i = 0; i < sprintDays.length; i++){
            table += "<tr><td>" + sprintDays[i] + "</td><td>" + workedTime[i] + "</td><td>" + realRemainingTime[i] + "</td></tr>";
        }

        table += "</tbody></table>";

        document.getElementById("resultsTable1").innerHTML = table;
    }

    function generateGraph(){

        var ctx = document.getElementById('graph');
        var workDoneLabel;
        var remainingWorkLabel;
        
        if (document.getElementById('timeUnitSyntax1').checked){
            workDoneLabel = "Real remaining work (hours)";
            remainingWorkLabel = "Ideal remaining work (hours)";
        } else {
            workDoneLabel = "Real remaining work (minutes)";
            remainingWorkLabel = "Ideal remaining work (minutes)";
        }

        document.getElementById("graphLoading").innerHTML = "Burndown Chart:";
        document.getElementById("graphLoading").style.opacity = 0.5;
        document.getElementById("resultsGraph").style.backgroundImage = "none";
        document.getElementById("resultsGraph").style.opacity = 1;
        document.getElementById("resultsGraph").style.cursor = "auto";

        var linearRemainingWork = [];
        var dailyRemainingWork = remainingTime[0] / sprintDays.length;
        for (var i = 0; i < remainingTime.length; i++){
            linearRemainingWork.push(remainingTime[0] - (i+1) * dailyRemainingWork);
        }

        if (window.burndown !== undefined){
            window.burndown.destroy();
        }

        window.burndown = new ChartJS(ctx, {
            type: 'bar',
            responsive:true,
            maintainAspectRatio: false,
            data: {
                labels: sprintDays,
                datasets: [
                {
                    label: remainingWorkLabel,
                    data: linearRemainingWork,
                    type: 'line',
                    backgroundColor: '#ffffff00',
                    borderColor: '#e44332',
                    borderWidth: 2
                },
                {
                    label: workDoneLabel,
                    data: realRemainingTime,
                    type: 'bar',
                    backgroundColor: '#61AAB7',
                    borderColor: '#61AAB7',
                    borderWidth: 1
                }
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                animation: {
                    animation: true,
                    duration: 800
                }
            }
        });

    }

    function generateTable2(){
     
        var table = "<span>Table 2: Task time estimate, completion and progress for each task</span><table rol='grid'><tbody><tr><th rol='columnheader'>Task</th><th rol='columnheader'>Task time estimate</th><th rol='columnheader'>Task time completion</th><th rol='columnheader'>Task completion date</th><th rol='columnheader'>Task progress made</th><th rol='columnheader'>Task time progress made</th></tr>";

        for (var i = 0; i < filteredFetchedTasks.length; i++){
            table += "<tr><td>" + filteredFetchedTasks[i].content + "</td><td>";
            table += ((filteredFetchedTasks[i].estimate) ? filteredFetchedTasks[i].estimate : "Error: No estimate. Check them.") + "</td><td>";
            table += ((filteredFetchedTasks[i].completion) ? filteredFetchedTasks[i].completion : "-") + "</td><td>";
            table += ((filteredFetchedTasks[i].completionDate) ? filteredFetchedTasks[i].completionDate : "-") + "</td><td>";

            if (filteredFetchedTasks[i].progressMade != null){
                for (var j = 0; j < filteredFetchedTasks[i].progressMade.length; j++){
                    table += ((filteredFetchedTasks[i].progressMade[j][0]) ? filteredFetchedTasks[i].progressMade[j][0] + ": " : "-");
                    table += ((filteredFetchedTasks[i].progressMade[j][1]) ? filteredFetchedTasks[i].progressMade[j][1] + ". " : "-");
                }
                table += "</td><td>";
            } else {
                table += "-" + "</td><td>";
            }

            table += ((filteredFetchedTasks[i].progressTimeMade) ? filteredFetchedTasks[i].progressTimeMade : "-") + "</td></tr>";
        }

        table += "</tbody></table>";

        document.getElementById("resultsTable2").innerHTML = table;

    }

    return{
        filteredFetchedTasks:filteredFetchedTasks,
        fetchedTasks:fetchedTasks,
        remainingTime:remainingTime,
        realRemainingTime:realRemainingTime,
        workedTime:workedTime,
        sprintDays:sprintDays,
        selectedProject:selectedProject,
        sprintBegin:sprintBegin,
        sprintEnd:sprintEnd,
        estimatePreference:estimatePreference,
        token:token,
        premium:premium,
        exportCanvasAsPNG:exportCanvasAsPNG,
        isNumber:isNumber,
        isValidDate:isValidDate,
        fetchTasks:fetchTasks,
        generateTable1:generateTable1,
        generateGraph:generateGraph,
        generateTable2:generateTable2
    }
}();

// Function declared in global scope to avoid Cross-Origin Resource Sharing Policy problems:

function getFilteredTasks(){
  return Promise.all([taskProccessing.fetchTasks(taskProccessing.selectedProject, taskProccessing.sprintBegin, taskProccessing.sprintEnd, taskProccessing.token, taskProccessing.premium, taskProccessing.estimatePreference, taskProccessing.combineSubprojectsTasks)]);
}


class Chart extends Component {
    componentWillMount() {
        this.setState({ loading: true });
        if (!this.props.user.token){
            window.location.href = "https://burndownchartist.appspot.com/#login";
        }
        Todoist.getUser(this.props.user.token)
        .then(response => {
            // TODO: Uncomment to test premium feature:
            this.setState({ loading: false, fetchFail: false, premium: response['user']['is_premium'] });
            //this.setState({ loading: false, fetchFail: false, premium: false });
      
            Todoist.fetchProjects(this.props.user.token)
                .then(response => {
                    this.setState({ loading: false, fetchFail: false, result: response['projects'] });
                })
                .catch(err => {
                    Raven.captureException(err);
                    console.error('Could not fetch Todoist tasks #1: ', err);
                    this.setState({ loading: false, fetchFail: true, result: "null" });
                });
        })
        .catch(err => {
            Raven.captureException(err);
            console.error('Could not fetch Todoist tasks #2: ', err);
            this.setState({ loading: false, fetchFail: true, result: "null" });
        });
    }

    render() {
        const {
            filterDueDate,
            user,
            fetchFail,
            fetching,
            result
        } = this.props;

        document.documentElement.lang = "en";
        // if fetch failed
        if (this.state.fetchFail) {
            return (
                <div className="Chart">
                    <div className="Chart-inner">
                        <NonIdealState
                            visual={fetching ? 'refresh' : 'error'}
                            title="Unable to fetch Todoist tasks"
                            description={
                                <div>
                                    <p>BurndownChartist was unable to fetch your Todoist tasks. Please try the following:</p>
                                    <ul style={{ width: '100%', textAlign: 'left' }}>
                                        <li>Ensure you have internet connectivity.</li><br/>
                                        <li>Try again in a few moments, servers may be a bit lazy</li>
                                        <li>Disable any ad-blockers for this site.</li><br/>
                                        <li>
                                            Check your{' '}
                                            <a
                                                href="https://todoist.com/Users/viewPrefs?page=integrations"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link">
                                                API token
                                            </a>{' '}
                                            by logging out and back in.
                                        </li><br/>
                                        <li>
                                            If BurndownChartist still cannot fetch your tasks, {' '}
                                            <a
                                                href="https://todoist.com/Users/viewPrefs?page=integrations"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link">
                                                generate a new Todoist API Token
                                            </a>{' '} and try again.
                                        </li><br/>
                                        <li>
                                            Still not working? <a href="mailto:m.varona@bmsalamanca.com?subject=Problem%20fetching%20data%20on%20BurndownChartist">Let me help you!</a>
                                        </li>
                                    </ul>
                                    <p />
                                </div>
                            }
                        />
                    </div>
                </div>
            );
        }

        // Filtering Lists & Items
        const payloadLoaded = this.state.result != null ? 1 : 0;
        
        const loadProjectButton = (
            <AnchorButton
                className="light-text"
                text="Load Project"
                onClick={() => {
                    taskProccessing.selectedProject = document.getElementsByName("projectSelector")[0].value;
                    taskProccessing.sprintBegin = document.getElementsByName("sprintBeginPicker")[0].value;
                    taskProccessing.sprintEnd = document.getElementsByName("sprintEndPicker")[0].value;

                    taskProccessing.sprintBegin = moment(taskProccessing.sprintBegin, "YYYY-MM-DD");
                    taskProccessing.sprintEnd = moment(taskProccessing.sprintEnd, "YYYY-MM-DD");

                    if (taskProccessing.selectedProject == "" || taskProccessing.sprintBegin == "" || taskProccessing.sprintEnd == "" || document.querySelectorAll('input[type="radio"]:checked').length < 3){
                        Swal.fire('There are empty fields', 'Please fill all of them to load your tasks.', 'error');
                    } else if (taskProccessing.sprintEnd <= taskProccessing.sprintBegin) {
                        Swal.fire('Incorrect dates', 'The sprint end cannot be before or equal than the sprint begin.', 'error');
                    } else if (!taskProccessing.isValidDate(taskProccessing.sprintBegin.format('YYYY-MM-DD')) || !taskProccessing.isValidDate(taskProccessing.sprintEnd.format('YYYY-MM-DD'))) {
                        Swal.fire('Incorrect dates', 'The date formats are not correct, please make sure they follow yyyy-mm-dd pattern.', 'error');
                    } else {
                        taskProccessing.token = this.props.user.token;
                        taskProccessing.premium = this.state.premium;
                        taskProccessing.estimatePreference = document.getElementById('estimateTimeSyntaxLabel').checked ? ESTIMATE_PREFERENCE_LABEL : ESTIMATE_PREFERENCE_NAME;
                        taskProccessing.combineSubprojectsTasks = document.getElementById('combineSubprojectsTasks1').checked ? true : false;
                       
                       document.getElementById("chartLoading").style.display = "inline";
                    
                        getFilteredTasks()
                            .catch(err => {
                                Swal.fire('Something went wrong', 'Please try again later or contact me at m.varona@bmsalamanca.com if the error persists. Error: ' + err, 'error');
                            });
                        
                        
                    }
                    
                }}
                intent={Intent.PRIMARY}
            />

        );

        if (payloadLoaded == 1){
                
                var selectProjects = [];
                for (let i = 0; i < Object.keys(this.state.result).length; i++){
                    selectProjects.push(
                        <option key={this.state.result[i].id} value={this.state.result[i].id}>{this.state.result[i].name}</option>
                    )
                }

                var disabled = false;
                var estimateTimeSyntaxNameHTML = <input required type='radio' value='name' name='estimateTimeSyntax' id='estimateTimeSyntaxName' />;;
                if (this.state.premium == false){
                    disabled = true;
                    estimateTimeSyntaxNameHTML = <input required aria-checked defaultChecked type='radio' value='name' name='estimateTimeSyntax' id='estimateTimeSyntaxName' aria-label="Select a syntax for estimate time: In task name" />;
                }

                const exportChartButton = (
                    <a role="button" id="exportChartButton" className="pt-button pt-intent-primary pt-disabled light-text" disabled="true" aria-disabled="true" onClick={() => {
                                if (!document.getElementById('exportChartButton').hasAttribute("disabled")){

                                const projectSelector = document.getElementsByName("projectSelector")[0];
                                const projectName = projectSelector.options[projectSelector.selectedIndex].text;
                                const dateFrom = document.getElementsByName("sprintBeginPicker")[0].value;
                                const dateTo = document.getElementsByName("sprintEndPicker")[0].value;

                                taskProccessing.exportCanvasAsPNG("graph", "Burndown chart " + projectName + " - Sprint from " + dateFrom + " to " + dateTo + ".png");

                                Swal.fire('Chart correctly exported', 'The file has been download to your downloads folder', 'success');
                                }                    
                            }
                        }
                        ><span>Export to PNG</span></a>

                );

                return (
                    <div className="Chart">
                        <section className='firstSection'>
                            <form>
                                <fieldset>
                                    <legend>&nbsp;&nbsp;Fill data to load chart:&nbsp;&nbsp;</legend>
                                    <span>Premium user: {this.state.premium == false ? "No" : "Yes" }</span>
                                    <br/><br/>
                                    <span>Select a project:</span>
                                    <select required aria-required='true' aria-label="Select a project" name='projectSelector'>
                                        {selectProjects}
                                    </select>
                                    <br/><br/>
                                    <span>Combine subprojects&apos; tasks with the parent project&apos;s tasks?:</span>&nbsp;&nbsp;
                                    <input required type='radio' value='h' name='combineSubprojectsTasks' id='combineSubprojectsTasks1' aria-label="Combine subprojects tasks: Yes" /><label htmlFor='combineSubprojectsTasks1'> Yes</label>&nbsp;&nbsp;&nbsp;
                                    <input required type='radio' value='s' name='combineSubprojectsTasks' id='combineSubprojectsTasks2' aria-label="Combine subprojects tasks: No" /><label htmlFor='combineSubprojectsTasks2'> No</label>&nbsp;&nbsp;&nbsp;
                                    <br/><br/>
                                    <span>Sprint begin: </span>
                                    <SprintDayPicker name='sprintBeginPicker' role='textbox' aria-label="Select a sprint begin date" />&nbsp;&nbsp;
                                    <span>Sprint end: </span>
                                    <SprintDayPicker name='sprintEndPicker' role='textbox' aria-label="Select a sprint end date" />
                                    <br/><br/>
                                    <span>Syntax for estimate time: </span>&nbsp;&nbsp;
                                    <input required disabled={disabled} aria-disabled={disabled} type='radio' value='label' name='estimateTimeSyntax' id='estimateTimeSyntaxLabel' aria-label="Select a syntax for estimate time: In task label, only for Premium users" />
                                    <label htmlFor='estimateTimeSyntaxLabel'> @120 (in task label, only for Premium users)</label>&nbsp;&nbsp;&nbsp;
                                    {estimateTimeSyntaxNameHTML}
                                    <label htmlFor='estimateTimeSyntaxName'> $120 (in task name)</label>
                                    <br/><br/>
                                    <span>Time unit:</span>&nbsp;&nbsp;
                                    <input required type='radio' value='h' name='timeUnitSyntax' id='timeUnitSyntax1' aria-label="Select a time unit: hours" /><label htmlFor='timeUnitSyntax1'> hours</label>&nbsp;&nbsp;&nbsp;
                                    <input required type='radio' value='s' name='timeUnitSyntax' id='timeUnitSyntax2' aria-label="Select a time unit: minutes" /><label htmlFor='timeUnitSyntax2'> minutes</label>&nbsp;&nbsp;&nbsp;
                                    <br/><br/>
                                    {loadProjectButton}
                                    <span id="chartLoading" role="img" aria-label="Loading chart">&nbsp;&nbsp;🔄</span>
                                    {exportChartButton}
                                    <hr/>
                                    <ul>
                                        <span>Remember that...</span>
                                        <li>Completed tasks must be visible on the project, for example, by grouping them into a <a href='https://get.todoist.help/hc/en-us/articles/115001709669' target='_blank' rel="noopener noreferrer">section.</a></li>                                        
                                        <li>All tasks within the sprint must have a estimate duration.</li>
                                        <li>All dates must be in yyyy-mm-dd format.</li>
                                        <li><em>%%date%%</em> have preference over the date when a task has been marked it.</li>
                                        <li>If a task with progress is marked as completed, the progress is the only counted metric and the completion date is ignored, that's why they have to be marked as completed.</li>
                                        <li>The following tables represent the extracted information and the data used to depict the chart. Please look at it carefully to ensure all the information have been correctly introduced and processed.</li>
                                        <li>If some data is incorrect, it may be due to a syntax error.</li>
                                    </ul>
                                    <hr/>
                                    <div className='donate'>
                                        <div>
                                            <span>Are we being useful? Please consider to donate to support this project</span>
                                            <a role="button" href="https://burndownchartist.appspot.com/donate" className="light-text pt-button pt-intent-primary">Donate</a>
                                        </div>
                                    </div>
                                    </fieldset>
                            </form>
                            <div id='resultsGraph'>
                                <span aria-placeholder="Chart will appear when project is loaded" className='loading' id='graphLoading'>Chart will appear when project is loaded</span>
                                <div id='chartContainer'>
                                    <canvas id='graph' aria-label="Burndown chart" role="img">
                                    </canvas>
                                </div>
                            </div>
                        </section>
                        <hr className='sectionSeparator'/>
                        <section className='secondSection'>
                            <div id='resultsTable1'>
                                <span>Table 1: Work done and remaining for each sprint day</span>
                                <table role="grid">
                                    <tbody>
                                        <tr>
                                            <th role="columnheader">
                                                Day
                                            </th>
                                            <th role="columnheader">
                                                Work done
                                            </th>
                                            <th role="columnheader">
                                                Work remaining
                                            </th>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" aria-placeholder="Data will appear when project is loaded">
                                                Data will appear when project is loaded
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div id='resultsTable2'>
                                <span>Table 2: Task time estimate, completion and progress for each task</span>
                                <table role="grid">
                                    <tbody>
                                        <tr>
                                            <th role="columnheader">
                                                Task
                                            </th>
                                            <th role="columnheader">
                                                Task time estimate
                                            </th>
                                            <th role="columnheader">
                                                Task time completion
                                            </th>
                                            <th rol='columnheader'>
                                                Task completion date
                                            </th>
                                            <th role="columnheader">
                                                Task progress made
                                            </th>
                                            <th role="columnheader">
                                                Task time progress made
                                            </th>
                                        </tr>
                                        <tr>
                                            <td colSpan="6" aria-placeholder="Data will appear when project is loaded">
                                                Data will appear when project is loaded
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                        <div className='footerContainer'>
                            <Footer />
                        </div>
                    </div>
                );
        } else {
            return (
                <div className="Chart">
                    <NonIdealState
                            visual={'refresh'}
                            title="Loading Todoist tasks..."
                            description={
                                <div>
                                    <p>If you are reading this, it may mean that you don't have any project on Todoist, or that their server is taking a coffee. Create one project and try again later.</p>
                                </div>
                            }
                    />
                </div>
            );
        }

    }
}

const mapStateToProps = state => {
    return {
        showBacklog: state.ui.showBacklog,
        backlogList: state.lists.backlog,
        lists: state.lists.lists,
        filteredLists: state.lists.filteredLists,
        projects: state.lists.projects,
        defaultProjectId: state.lists.defaultProjectId,
        filteredProjects: state.lists.filteredProjects,
        filteredPriorities: state.lists.filteredPriorities,
        filterDueDate: state.lists.filterDueDate,
        namedFilter: state.lists.namedFilter,
        showIfResponsible: state.lists.showIfResponsible,
        user: state.user.user,
        fetchFail: state.lists.fetchFail,
        fetching: state.lists.fetching,
    };
};

export default flow(
    Dimensions({ className: 'Chart-Wrapper' }),
    connect(mapStateToProps)
)(Chart);
