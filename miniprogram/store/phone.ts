import { configure, observable, action, computed, autorun } from 'mobx-miniprogram';
import Toast from '@vant/weapp/toast/toast';
import { fly, fly_catch } from '../cores/http';
import { timerStore } from './timer';
import { userStore } from './user';

// 不允许在动作外部修改状态
configure({enforceActions: true});

// 手机号信息
interface Phone {
    tid: string,  // 手机号ID
    order: number,  // 排序
    show: string,  // 脱敏显示
    key: string,  // 摘要
    main: boolean,  // 主手机号
    fmt: string,  // 格式化
    tail: string, // 尾号
}


class PhoneStore {

    @observable limit: number = 1;  // 可绑定数量
    @observable phones: Array<Phone> = []; // 手机号列表
    @observable main: Phone | null = null;  // 主手机号

    constructor() {
        autorun(() => {
            if (userStore.logged) this.apiGetPhones();
        }, { delay: 100 });
    }

    @computed get mainShow(): string {
        return this.main?.show || '';
    }

    @computed get mainFmt(): string {
        return this.main?.fmt || '';
    }

    @action.bound upPhones(data: any) {
        this.phones = data.phones;
        this.limit = data.limit;
        this.main = data.main;
    }

    @action.bound apiCodeSuccess() {
        timerStore.reset(60);
    }

    @action.bound apiGetPhones(): void {
        if (!userStore.logged) return;
        fly.get('/account/phones').then(this.apiGetPhonesSuccess).catch(this.apiError);
    }
    @action.bound apiGetPhonesSuccess(res: any) {
        this.upPhones(res);
    }

    @action.bound apiPhoneAdd(phone: string): void {
        fly.post('/account/phone/add', {
            number: phone, demand: true
        }).then(this.apiCodeSuccess).catch(this.apiError)
    }

    @action.bound apiPhoneBind(phone: string, code: string): void {
        fly.post('/account/phone/bind', {
            number: phone, captcha: code
        }).then(this.apiPhoneBindSuccess).catch(this.apiError)
    }
    @action.bound apiPhoneBindSuccess(res: any) {
        this.upPhones(res);
        wx.navigateBack({delta: 1, success: () => {
            Toast.success('已绑定');
        }});
    }
    @action.bound apiPhoneBindSuccessNoBack(res: any) {
        Toast.success('已绑定');
        this.upPhones(res);
    }


    @action.bound apiPhoneLeave(key: string): void {
        fly.post('/account/phone/leave', {
            key: key,
        }).then(this.apiCodeSuccess).catch(this.apiError);
    }
    @action.bound apiPhoneUnbind(key: string, code: string) {
        fly.post('/account/phone/unbind', {
            key: key, captcha: code,
        }).then(this.apiPhoneUnbindSuccess).catch(this.apiError);
    }
    @action.bound apiPhoneUnbindSuccess(res: any) {
        this.upPhones(res);
        wx.navigateBack({delta: 1, success: () => {
            Toast.success('已解除绑定');
        }});
    }

    @action.bound apiSetMain(key: string): void {
        fly.post('/account/phone/main', {
            key: key
        }).then(this.apiSetMainSuccess).catch(this.apiError);
    }
    @action.bound apiSetMainSuccess(res: any) {
        userStore.upAppUser(res.user);
        Toast.success('已设置');
        this.upPhones(res);
    }

    @action.bound getWXPhoneNumber (data: any, back: boolean = true) {
        if (data.detail.errMsg !== 'getPhoneNumber:ok') return;
        Toast.loading({
            duration: 0,
            forbidClick: true,
            message: '加载中...',
            loadingType: 'spinner',
        });
        fly.post('/account/phone/bind-wx', {
            encrypted: data.detail.encryptedData,
            iv: data.detail.iv,
        }).then(
            back ? this.apiPhoneBindSuccess : this.apiPhoneBindSuccessNoBack
        ).catch(this.apiError);
    }
    @action.bound apiError(e: any): void {
        wx.nextTick(() => Toast.clear());
        fly_catch(e);
    }
}

export const phoneStore = new PhoneStore();
