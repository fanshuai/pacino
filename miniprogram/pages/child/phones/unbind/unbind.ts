// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Toast from '@vant/weapp/toast/toast';
import { timerStore } from '../../../../store/timer';
import { phoneStore } from '../../../../store/phone';

Page({
    data: {
        key: '',
        code: '',
        phone: '',
        counter: 0,
    },
    onLoad: function (options: any) {
        this.setData({key: options.key, phone: options.fmt});
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                counter: () => timerStore.count,
            },
            actions: [],
        });
    },
    onUnload: function() {
        timerStore.clear();
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    changeCode(e: any): void {
        this.setData({code: e.detail});
    },
    apiSendCode(): void {
        if (this.data.counter > 0) return;
        phoneStore.apiPhoneLeave(this.data.key);
    },
    apiUnbind() {
        const code = this.data.code || '';
        if (!code.match(/^\d{6}$/g)) {
            Toast('请确认验证码输入');
        } else {
            phoneStore.apiPhoneUnbind(this.data.key, code);
        }
    },
});
