import React from 'react';
import Dialog from './Dialog.jsx';
import UserPlanEditor from './UserPlanEditor.jsx';

export default class UserPlanEditorController extends React.Component {
    constructor(props) {
        super();
        let settings = {
                note: '',
            };

        this.state = {
            settings: settings,
            dialogOptions: {
                showDialog: false,
                hideClose: true,
                text: 'Senden...',
                content: null,
                title: 'Daten übertragen',
                buttons: []
            },
            plan: props.plan,
            initialized: false
        };
    }

    componentDidMount() {
        fetch(`/api/plan/${this.props.plan.planId}/full`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            method: "GET"
        })
        .then(res => res.json())
        .then((template) => {
            let userPlanObject = Object.assign({}, template, {id: undefined}, this.props.plan);

            userPlanObject.exercises = userPlanObject.exercises.map(exercise => {return {id: exercise.id, setup: {}};});

            this.setState({
                initialized: true,
                template: template,
                userPlanObject
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }


    handleSubmit() {
        fetch(`/api/userplans/`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            method: "POST",
            body: JSON.stringify({
                machine: this.state.settings.machine,
                name: this.state.settings.name,
                note: this.state.settings.note,
                imageUrl: this.state.settings.imageUrl,
                setup: this.state.settings.setup,
                id: (this.state.settings.id ? this.state.settings.id : undefined)
            })
        })
        .then(() => {
            this.setState({ dialogOptions: Object.assign({}, this.state.dialogOptions, {showDialog: false})});
            if (this.props.submitCallback) {
                this.props.submitCallback(this.state.settings);
            }
        })
        .catch((err) => {
            console.log(err);
            this.setState({dialogOptions: Object.assign({}, this.state.dialogOptions, {showDialog: false})});
        });
    }

    setProperty(key, value) {
        let newObj = Object.assign({}, this.state.userPlanObject);

        newObj[key] = value;

        this.setState({userPlanObject: newObj});
    }

    setSetupKey(exIndex, key, value) {
        let newObj = Object.assign({}, this.state.userPlanObject.exercises[exIndex].setup),
            newArr = this.state.userPlanObject.exercises.slice();

        newObj[key] = value;
        newArr[exIndex] = newObj;

        this.setState({userPlanObject: Object.assign({}, this.state.userPlanObject, {exercises: newArr})});
    }

    render() {
        if (this.state.initialized) {
            return (<div className="padding">
                <Dialog opts={this.state.dialogOptions}>
                    <div className="row margin-top">
                        <span className="fa fa-fw fa-cog slow-spin fa-3x" />
                    </div>
                </Dialog>
                <UserPlanEditor template={this.state.template}
                    plan={this.state.plan}
                    setSetupKey={(exIndex, key, value) => this.setSetupKey(exIndex, key, value)}
                    setProperty={(key, value) => this.setProperty(key, value)}></UserPlanEditor>
                <button className="fullWidthButton margin-top">Speichern</button>
            </div>);
        }
        return (<div className="row margin-top">
                <span className="fa fa-fw fa-cog slow-spin fa-3x" />
            </div>);

    }
}