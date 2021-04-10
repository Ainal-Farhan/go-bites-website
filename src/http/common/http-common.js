import axios from 'axios';

export default axios.create({
    baseURL: "http://pharveish.ml/api",
    // baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json"
    }
});
