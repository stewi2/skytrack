import axios from 'axios';

const instance = axios.create()
//instance.defaults.baseURL = '/api'
//if(process.env.REACT_APP_API_BASE_URL) {
//  instance.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
//}

export default instance;