import { configure, observable, action, computed } from 'mobx-miniprogram';
import { fly } from '../cores/http';

// 不允许在动作外部修改状态
configure({enforceActions: true});

interface Const {
    genders: any,  // 性别枚举
    reports: any,  // 举报枚举
}

class ConstStore {


    // 服务端初始化常量
    @observable data: Const = {
        genders: [],
        reports: [],
    };
    againCount: number = 0;

    constructor() {
        this.apiFetch();
    }

    @computed get genders() {
        return this.data.genders;
    }

    @computed get reports() {
        return this.data.reports;
    }

    @action.bound apiFetch() {
        console.info('ConstStore.apiFetch.start');
        fly.get('/wpa-const').then(this.apiFetchSuccess).catch(this.apiFetchError);
    }
    @action.bound apiFetchSuccess(res: any): void {
        this.data = res.constant;
    }
    @action.bound apiFetchError(e: any): void {
        console.warn('apiFetchError', e);
        const timeout = 5000 * this.againCount;
        setTimeout(this.apiFetchAgain, timeout);
        console.log(`ConstStore.apiFetchAgain after ${timeout / 1000}S`);
    }
    @action.bound apiFetchAgain(): void {
        this.againCount += 1;
        if (this.againCount < 9) {
            this.apiFetch();
        } else {
            console.warn(`ConstStore.apiFetchAgain stop: ${this.againCount}`);
        }
    }
}

export const constStore = new ConstStore();
