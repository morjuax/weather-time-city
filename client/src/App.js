import React, {Component} from 'react';
// import logo from './logo.svg';
import './App.css';

// const momentTz = require('moment-timezone/builds/moment-timezone-with-data.min');

class App extends Component {
    state = {
        response: '',
        post: '',
        responseToPost: '',
        city_cl: {time: null, temperature: null},
        city_ch: {time: null, temperature: null},
        city_nz: {time: null, temperature: null},
        city_au: {time: null, temperature: null},
        city_uk: {time: null, temperature: null},
        city_usa: {time: null, temperature: null},
    };
    citys = ['cl', 'ch', 'nz', 'au', 'uk', 'usa'];

    componentDidMount() {

        this.saveCitys().then(res => console.log(res))
            .catch(err => console.log(err));
        // cl
        this.citys.forEach((item) => {
            this.callApi(item)
                .then((res) => {
                    //this.setState({response: JSON.stringify(res.currently)})
                })
                .catch(err => console.log(err));
        });

    };

    callApi = async (city) => {
        // const response = await fetch('/api/hello');
        const response = await fetch(`/api/info/city/${city}`);
        // console.log(this.citys.cl);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);

        let city_name = `city_${city}`;
        this.setState({
            [city_name]: {
                time: body.time_format,
                temperature: body.temperature
            }
        });
        return body;
    };

    saveCitys = async () => {
        await fetch(`/save/citys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    render() {
        return (
            <div className="App">
                <h1>Temperatura - Hora</h1>
                <div className="container">
                    <div className="row">
                        <div className="col-md-2">
                            <h4>Santiago (CL),</h4>
                            <p><b>Temperatura: </b>{this.state.city_cl.temperature}</p>
                            <p><b>Hora: </b>{this.state.city_cl.time}</p>
                        </div>
                        <div className="col-md-2">
                            <h4>Zurich (CH)</h4>
                            <p><b>Temperatura: </b>{this.state.city_ch.temperature}</p>
                            <p><b>Hora: </b>{this.state.city_ch.time}</p>
                        </div>
                        <div className="col-md-2">
                            <h4>Auckland (NZ)</h4>
                            <p><b>Temperatura: </b>{this.state.city_nz.temperature}</p>
                            <p><b>Hora: </b>{this.state.city_nz.time}</p>
                        </div>
                        <div className="col-md-2">
                            <h4>Sydney (AU)</h4>
                            <p><b>Temperatura: </b>{this.state.city_au.temperature}</p>
                            <p><b>Hora: </b>{this.state.city_au.time}</p>
                        </div>
                        <div className="col-md-2">
                            <h4>Londres (UK)</h4>
                            <p><b>Temperatura: </b>{this.state.city_uk.temperature}</p>
                            <p><b>Hora: </b>{this.state.city_uk.time}</p>
                        </div>
                        <div className="col-md-2">
                            <h4>Georgia (USA)</h4>
                            <p><b>Temperatura: </b>{this.state.city_usa.temperature}</p>
                            <p><b>Hora: </b>{this.state.city_usa.time}</p>
                        </div>
                    </div>
                    <hr/>
                    {/*<p>{this.state.response}</p>*/}
                    {/*<form onSubmit={this.handleSubmit}>*/}
                    {/*<p>*/}
                    {/*<strong>Post to Server:</strong>*/}
                    {/*</p>*/}
                    {/*<input*/}
                    {/*type="text"*/}
                    {/*value={this.state.post}*/}
                    {/*onChange={e => this.setState({post: e.target.value})}*/}
                    {/*/>*/}
                    {/*<button type="submit">Submit</button>*/}
                    {/*</form>*/}
                    {/*<p>{this.state.responseToPost}</p>*/}
                </div>
            </div>
        );
    }
}


export default App;
