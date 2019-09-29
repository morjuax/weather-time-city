import React, {Component} from 'react';
import './App.css';
import io from 'socket.io-client';
import axios from 'axios';

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
        data_socket: []
    };

    // citys = ['cl', 'ch', 'nz', 'au', 'uk', 'usa'];

    async componentDidMount() {

        await this.saveCities();
        // cl
        await this.getRenderCities();
        this.getSocket();
    };

    getRenderCities = async () => {
        let response = await this.getInfoCityAll();
        response = await response.json();
        while (response.state === 2) { //emulate error
            response = await this.getInfoCityAll();
            response = await response.json();
        }
        if (response.data) {
            response.data.forEach((item) => {
                    this.setState({
                        [`city_${item.name}`]: {
                            time: item.time_format,
                            temperature: item.temperature
                        }
                    });
                }
            );
        }
    };

    getInfoCity = (city) => {
        return fetch(`/api/info/city/${city}`);
    };
    getInfoCityAll = async () => {
        return fetch(`/api/info/cities/`);
    };

    saveCities = () => {
        let data = {};
        if (!sessionStorage.isNotFirstVisit) {
            sessionStorage.isNotFirstVisit = 1;
            data = {isNotFirstVisit: 1};
        } else {
            sessionStorage.isNotFirstVisit = 0;
            data = {isNotFirstVisit: 0};
        }

        return axios.post(`/save/cities`, data)
            .then((res) => {
                //console.log(res)
            }).catch(err => console.log(err));

    };

    getSocket = () => {
        this.socket = io('/');
        this.socket.on('request_city', data => {
            console.log("response socket success");
            if (data) {
                data.forEach((item) => {
                    this.setState({
                        [`city_${item.name}`]: {
                            time: item.time_format,
                            temperature: item.temperature
                        }
                    });
                });
            }


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
