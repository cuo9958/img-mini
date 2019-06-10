import axios from 'axios';

const service = axios.create({
    baseURL: process.env.BASE_API, // api 的 base_url
    timeout: 8000 // request timeout
})

const urlEncoded = (data) => {
    if (typeof data === 'string') return encodeURIComponent(data);
    const params = [];
    for (const k in data) {
        if (!data.hasOwnProperty(k)) return;
        let v = data[k];
        if (typeof v === 'string') v = encodeURIComponent(v);
        if (v === undefined) v = '';
        params.push(`${encodeURIComponent(k)}=${v}`);
    }
    return params.join('&');
}

// 请求处理
service.interceptors.request.use(
    config => {
        if (config.method === "post") {
            if (config.headers['dataType'] === 'json') {
                config.headers["Content-Type"] = "application/json";
                config.data = JSON.stringify(config.data)
            } else {
                config.headers["Content-Type"] = "application/x-www-form-urlencoded";
                config.data = urlEncoded(config.data);
            }
        }
        return config
    },
    error => {
        console.log(error) // for debug
        Promise.reject(error)
    }
)

// 自定义返回处理
service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            if (response.data.code === 1) {
                return response.data.data;
            } else {
                return Promise.reject(response.data.msg);
            }
        } else {
            return Promise.reject("连接失败");
        }
    },
    error => {
        console.log('err' + error) // for debug
        return Promise.reject(error)
    }
)
export default {
    get(url, params) {
        return service({ url, params, method: 'get' });
    },
    post(url, data) {
        return service({ url, data, method: 'post' });
    },
    del(url, params) {
        return service({ url, params, method: 'delete' });
    },
    put(url, params, data = {}) {
        return service({ url, params, data, method: 'put' });
    }
}