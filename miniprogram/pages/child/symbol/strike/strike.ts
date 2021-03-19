// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Toast from '@vant/weapp/toast/toast';
import { fly, fly_catch } from '../../../../cores/http';
import { timerStore } from '../../../../store/timer';
import { phoneStore } from '../../../../store/phone';


Page({
    data: {
        fmt: '',
        phone: '',
        symbol: '',
        scened: '',
        counter: 0,
        code: '',
    },
    onLoad: function (options: any) {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                counter: () => timerStore.count,
                phone: () => phoneStore.mainFmt,
            },
            actions: [],
        });
        this.setData({symbol: options.symbol}, () => this.apiGetSymbol());
    },
    onUnload: function() {
        timerStore.clear();
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    changeCode(e: any): void {
        this.setData({code: e.detail});
    },
    apiGetSymbol(): void {
        fly.get(`/release/symbol/${this.data.symbol}`).then((res: any) => {
            wx.setNavigationBarTitle({title: `${res.scened}删除`, success: () => {}});
            this.setData({fmt: res.fmt, scened: res.scened});
        }).catch(this.apiError);
    },
    apiSendCode(): void {
        if (this.data.counter > 0) return;
        fly.post(`/release/symbol/${this.data.symbol}/leave`).then((res: any) => {
            timerStore.reset(60);
            if (res._cd === 0) {
                Toast.success('已发送');
            } else {
                Toast.fail(res._msg);
            }
        }).catch(this.apiError);
    },
    submit() {
        const code = this.data.code || '';
        if (!code.match(/^\d{6}$/g)) {
            Toast('请确认验证码输入');
        } else {
            fly.post(`/release/symbol/${this.data.symbol}/unbind`, {
                captcha: code,
            }).then(() => {
                wx.navigateBack({delta: 2, success: () => Toast.success('已删除') });
            }).catch(this.apiError);
        }
    },
    apiError(e: any): void {
        fly_catch(e);
    },
});
