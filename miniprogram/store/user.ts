import UserInfo = WechatMiniprogram.UserInfo;
import Toast from '@vant/weapp/toast/toast';
import { configure, observable, action, computed } from 'mobx-miniprogram';
import { AppInfo, PageURL, ShareTimelineMsg } from '../cores/const';
import { fly, fly_catch } from '../cores/http';
import { logger } from '../cores/log';
import { agrtmStore } from './agrtm';

// 不允许在动作外部修改状态
configure({enforceActions: true});

interface Encrypted {
    data: string,
    iv: string,
}

interface AppUser {
    tid: string,  // 加密ID
    name: string,  // 名字
    code: string,  // 用户码
    codef: string,  // 用户码 格式化
    bio: string, // 个性签名
    gender: number,  // 性别编码
    genderd: string,  // 性别
    avatar: string,  // 头像地址
    joinedAt: string,  // 注册时间
    diffJoined: string,  // 注册时长
    devices: number,  // 登录设备量
    symbols: number, // 场景码数量
    rtoken: string,  // RTM Token
}

interface UQRInfo {
    img: string,
    url: string,
    vs: number,
}


class UserStore {

    token: string = '';
    wxatid: string = '';
    encrypted: Encrypted | null = null;
    userInfo: UserInfo | null = null;  // 微信用户信息
    @observable appUser: AppUser | null = null;  // App用户信息
    @observable uqrInfo: UQRInfo | null = null;  // 用户码信息
    @observable initialized: boolean = false;
    @observable loading: boolean = false;
    nextUrl: string = '';

    constructor () {

    }

    setToken(val: string) {
        this.token = val;
    }

    @action.bound wxCheckSession(from: string = '') {
        wx.checkSession({fail: () => {
            logger.warn('checkSession:fail', from);
            this.wxCodeLogin();
        }});
    }

    @action.bound wxCodeLogin() {
        wx.login({
            success: this.apiWXCodeLogin,
            fail: this.wxCodeLoginFail,
        });
    }
    @action.bound apiWXCodeLogin(res: any): void {
        fly.post('/account/oauth/wx-code', {
            code: res.code,
        }).then(this.apiWXCodeLoginSuccess).catch(this.apiWXCodeLoginFail);
    }
    @action.bound wxCodeLoginFail(res: any): void {
        setTimeout(() => this.wxCodeLogin(), 5000);
        logger.warn('wxCodeLoginFail', res);
        this.initialized = true;
    }

    @action.bound apiWXCodeLoginSuccess(res: any): void {
        console.log(`apiWXCodeLoginSuccess: ${AppInfo.Version} ${res.version}`);
        this.wxatid = res.wxatid;
        if (Boolean(res.user)) {
            this.login(res.user);
        } else {
            this.logout();
        }
        this.initialized = true;
    }
    @action.bound apiWXCodeLoginFail(e: any): void {
        setTimeout(() => this.wxCodeLogin(), 5000);
        console.info('apiWXCodeLoginFail', e);
        this.initialized = true;
        this.apiError(e);
    }

    @action.bound userInfoScopeAllow(e: any) {
        if (e.detail.errMsg !== 'getUserInfo:ok') {
            Toast.fail('未授权');
            return;
        }
        this.showLoading('登录中...');
        this.userInfo = e.detail.userInfo;
        this.nextUrl = e.currentTarget.dataset.url || '';
        fly.post('/account/oauth/wx-bind', {
            code: this.wxatid, iv: e.detail.iv,
            encrypted: e.detail.encryptedData,
        }).then(this.apiOAuthCallSuccess).catch(this.apiOAuthCallFail);
    }
    @action.bound apiOAuthCallSuccess(res: any): void {
        if (Boolean(res.user)) {
            this.login(res.user);
        } else {
            Toast(res._msg || '请稍后重试');
        }
        this.hideLoading();
    }
    @action.bound apiOAuthCallFail(e: any): void {
        setTimeout(() => this.wxCodeLogin(), 5000);
        this.apiError(e);
    }

    @action.bound upAppUser(user: AppUser) {
        this.appUser = user;
        this.apiUQRImageInfo();
    }
    @action.bound login(user: AppUser) {
        agrtmStore.login(user.rtoken, user.tid);
        this.upAppUser(user);
        if (!this.nextUrl) return;
        wx.navigateTo({
            url: this.nextUrl,
            success: () => {
                this.nextUrl = '';
            },
        });
    }
    @action logout() {
        this.token = '';
        this.appUser = null;
        this.uqrInfo = null;
        this.userInfo = null;
        this.encrypted = null;
        wx.clearStorageSync();
        agrtmStore.logout();
        this.hideLoading();
    }
    @computed get logged(): boolean {
        return Boolean(this.appUser);
    }
    @computed get hasUserInfo(): boolean {
        return Boolean(this.userInfo);
    }
    @action apiGetProfile(): void {
        if (!this.logged) return;
        fly.get('/account/profile').then(this.apiGetProfileSuccess).catch(this.apiGetProfileFail);
    }
    @action.bound apiGetProfileSuccess(res: any): void {
        this.upAppUser(res.user);
    }
    @action.bound apiGetProfileFail(e: any): void {
        setTimeout(() => this.wxCodeLogin(), 5000);
        this.apiError(e);
    }

    @action.bound apiUQRImageInfo(): void {
        fly.get(`/account/qrcode`).then(this.apiUQRImageInfoSuccess).catch(this.apiError);
    }
    @action.bound apiUQRImageInfoSuccess(res: any): void {
        this.uqrInfo = {img: res.qrimg, url: res.qrurl, vs: res.version};
    }
    @action.bound apiUQRReset(): void {
        this.showLoading('正在重置...');
        fly.post(`/account/qrcode`).then(this.apiUQRResetSuccess).catch(this.apiError);
    }
    @action.bound apiUQRResetSuccess(res: any): void {
        this.hideLoading();
        if (res._cd === 0) {
            Toast.success('已重置');
            this.apiUQRImageInfoSuccess(res);
        } else {
            Toast.fail(res._msg);
        }
    }
    @action.bound apiError(e: any): void {
        this.hideLoading();
        fly_catch(e);
    }
    getShareAppMessage(res: any): any {
        let data;
        if (this.logged && this.uqrInfo) {
            const q = encodeURIComponent(this.uqrInfo.url);
            const name = this.appUser?.name || '';
            const title = `打开链接、即可与我通话联系 ~`;
            data = {
                title: `${name}: ${title}`,
                path: `${PageURL.PReview}?q=${q}`,
                imageUrl: this.uqrInfo.img,
            }
        } else {
            data = {
                path: '', imageUrl: '',
                title: ShareTimelineMsg,
            }
        }
        const ustid = userStore.appUser?.tid || '';
        const toPage = (this.logged && this.uqrInfo) ? PageURL.PReview : '';
        logger.info(`getShareAppMessage from ${res.from}`, {to: toPage, ustid: ustid});
        return data;
    }
    showLoading(title: string): void {
        this.loading = true;
        Toast.loading({
            duration: 0,
            message: title,
            forbidClick: true,
            loadingType: 'spinner',
        });
    }
    hideLoading(): void {
        this.loading = false;
        wx.nextTick(() => Toast.clear());
    }
}

export const userStore = new UserStore();
