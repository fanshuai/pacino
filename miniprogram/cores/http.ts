import { FlyRequestConfig, FlyResponse } from 'flyio';
import Toast from '@vant/weapp/toast/toast';
import { AppCfg, AppInfo } from './const';
import { userStore } from '../store/user';
import { logger } from './log';

const Fly = require('flyio');

export const fly = new Fly;

// Request拦截器
fly.interceptors.request.use((config: FlyRequestConfig) => {
    // 给所有请求添加自定义header
    config.headers['X-Token'] = userStore.token;
    config.headers['X-AppID'] = `${AppInfo.AppID}:${AppInfo.Version}`;
    config.headers['Content-Type'] = 'application/json';
    config.withCredentials = false;
    config.baseURL = AppCfg.ApiHost;
    config.timeout = 5000;
    return config;
});
// Response拦截器
fly.interceptors.response.use((resp: FlyResponse) => {
    let token = (<any>resp.headers)['x-token'];
    if (Array.isArray(token)) {
        token = token.join('');
        if (token) userStore.setToken(token);
    }
    return resp.data;
}, (e: any) => {
    logger.warn('fly-resp-error', e);
});

export const fly_catch = (e: any) => {
    logger.error('fly-catch', e);
    let detail: string;
    try {
        detail = e.response.data.detail;
    } catch (err) {
        logger.warn('fly-resp-parse-error', err);
        detail = '网络异常 :(';
    }
    switch (e.status) {
        case 400:
            const data = e.response.data;
            Object.keys(data).filter(key => {
                if (key.substring(0, 1) !== '_') {
                    const msg = data[key].join('，');
                    Toast(msg.split('。').join(''));
                }
            });
            break;
        case 401:
        case 403:
            Toast.fail('请先登录');
            break;
        case 404:
            Toast(detail);
            break;
        case 429:
            Toast(detail);
            break;
        default:
            // Toast(detail);
            console.error(e);
            break;
    }
};
