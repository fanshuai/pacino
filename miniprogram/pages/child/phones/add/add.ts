// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Toast from '@vant/weapp/toast/toast';
import { timerStore } from '../../../../store/timer';
import { phoneStore } from '../../../../store/phone';
import { userStore } from "../../../../store/user";

Page({
    data: {
        code: '',
        phone: '',
        _phone: '',
        counter: 0,
    },
    onLoad: function() {
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
    onShow: function() {
        userStore.wxCheckSession('phoneAdd');
    },
    phoneInfo(): void {
        Toast('仅支持中国大陆手机号');
    },
    changeCode(e: any): void {
        this.setData({code: e.detail});
    },
    changePhone(e: any): void {
        this.setData({phone: e.detail});
        if (this.data._phone) {
            timerStore.clear();
        }
    },
    sendCode(): void {
        if (this.data.counter > 0) return;
        const phone = this.data.phone || '';
        if (phone.match(/^1\d{10}$/g)) {
            this.setData({_phone: phone});
            phoneStore.apiPhoneAdd(phone);
            this.setData({code: ''});
        } else {
            Toast('请确认手机号输入');
        }
    },
    submit() {
        const code = this.data.code || '';
        const phone = this.data.phone || '';
        const _phone = this.data._phone || '';
        if (!(phone && _phone)) {
            Toast('请获取验证码');
        } else if (phone !== _phone) {
            Toast('修改手机号需重新获取验证码');
        } else if (!code.match(/^\d{6}$/g)) {
            Toast('请确认验证码输入');
        } else {
            phoneStore.apiPhoneBind(phone, code);
        }
    },
    getPhoneNumber: phoneStore.getWXPhoneNumber,
});
