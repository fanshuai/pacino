import { action, computed, configure, observable } from 'mobx-miniprogram';
import Toast from '@vant/weapp/toast/toast';
import { fly, fly_catch } from '../cores/http';
import { PageURL } from '../cores/const';

// 不允许在动作外部修改状态
configure({enforceActions: true});

interface QRQuery {
    by: string,
    code: string,
    name: string,
    title: string,
    avatar: string,
    self: boolean,
    isPre: boolean,
    logged: boolean,
    convid: string,
    selfdom: string,
    reason: string,
    spuid: string,
}


class ScanQStore {

    q: string = '';
    fromPage: string = ''
    scanning: boolean = false;
    @observable qrQuery: QRQuery | null = null;  // 二维码查询结果

    constructor () {

    }

    setQ(val: string) {
        this.q = val;
    }

    setFromPage(val: string) {
        this.fromPage = val;
    }

    scanDone() {  // 路由后调用
        this.scanning = false;
    }

    get encodeQ(): string {
        return encodeURIComponent(this.q);
    }

    @computed get isDone(): boolean {
        return Boolean(this.qrQuery);
    }

    @computed get isFail(): boolean {
        return Boolean(this.qrQuery && this.qrQuery.reason);
    }

    @computed get isPre(): boolean {
        return Boolean(this.qrQuery && this.qrQuery.isPre);
    }

    get isFromBar(): boolean {
        const barUrls: string[] = [PageURL.PBarEver, PageURL.PBarMine];
        return barUrls.includes(this.fromPage);
    }

    @action.bound routeBack(errMsg: string = ''): any {
        if (this.isFromBar) {
            wx.switchTab({url: this.fromPage, success: () => {
                if (errMsg) Toast.fail(errMsg);
                this.scanDone();
                this.clear();
            }});
        } else {
            if (errMsg) Toast.fail(errMsg);
            this.scanDone();
            this.clear();
        }
    }

    @action.bound scanCode() {
        console.info('scanCode fromPage', this.fromPage, this.scanning);
        if (this.scanning) return;
        this.scanning = true;
        wx.scanCode({
            scanType: ['qrCode'],
            onlyFromCamera: false,
            success: this.scanCodeSuccess,
            fail: this.scanCodeFail,
        });
    }

    @action.bound scanCodeSuccess(res: any) {
        wx.vibrateShort({success: () => {}});
        Toast.loading({
            message: '处理中...',
            forbidClick: true,
            loadingType: 'spinner',
        });
        if (res.scanType === 'QR_CODE') {
            this.setQ(res.result);
            const from = encodeURIComponent(this.fromPage);
            const url = `${PageURL.PReview}?from=${from}`;
            if (this.isFromBar) {
                wx.redirectTo({url: url, success: () => this.scanDone() });
            } else {
                wx.navigateTo({url: url, success: () => this.scanDone() });
            }
        } else {
            console.warn('scanCodeSuccess.wrong', res);
            this.routeBack('无有效信息');
        }
    }

    @action.bound scanCodeFail(res: any) {
        console.info('scanCodeFail', res);
        this.routeBack();
    }

    @action.bound clear() {
        this.q = '';
        this.qrQuery = null;
        this.scanning = false;
    }

    @action.bound apiQuery() {
        if (!this.q) {
            wx.switchTab({url: PageURL.PBarEver, success: () => {
                Toast.fail('请使用扫一扫');
                this.clear();
            }});
            return;
        }
        fly.post('/outside/qreview', {
            q: this.q,
        }).then(this.apiQuerySuccess).catch(this.apiError);
    }
    @action.bound apiQuerySuccess(res: any): void {
        this.qrQuery = res.result;
    }
    @action.bound apiContact(action: string=''): void {
        if (!this.q) return;
        fly.post('/outside/contact', {
            q: this.encodeQ, action: action,
        }).then(this.apiContactSuccess).catch(this.apiError);
    }
    @action.bound apiContactSuccess(res: any): void {
        if (res._cd === 0) {
            const nextUrl = `${PageURL.PDialog}?convid=${res.convid}&action=${res.action}`;
            wx.redirectTo({url: nextUrl, success: () => this.clear() });
        } else {
            Toast.fail(res._msg);
        }
    }
    @action.bound apiQRCodeBind(): void {
        if (!this.q) return;
        fly.post('/outside/qr-bind', {
            q: this.encodeQ,
        }).then(this.apiQRCodeBindSuccess).catch(this.apiError);
    }
    @action.bound apiQRCodeBindSuccess(res: any): void {
        wx.switchTab({url: PageURL.PBarMine, success: () => {
            this.clear();
            if (res._cd === 0) {
                Toast.success('已绑定');
            } else {
                Toast.fail(res._msg);
            }
        }});

    }
    @action.bound apiError(e: any): void {
        this.clear();
        fly_catch(e);
    }
}

export const scanQStore = new ScanQStore();
