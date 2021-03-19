// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Dialog from '@vant/weapp/dialog/dialog';
import { PageURL, AppInfo } from '../../../../../cores/const';
import { convStore } from '../../../../../store/conv';
import { callStore } from '../../../../../store/call';
import { phoneStore } from '../../../../../store/phone';

Page({
    data: {
        cash: 0,
        cashd: '',
        conv: {},
        name: '',
        phone: '',
        avatar: '',
        pages: PageURL,
        loading: false,
        appName: AppInfo.Name,
    },
    onLoad: function (options: any) {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                phone: () => phoneStore.mainShow,
                name: () => convStore.convTitle,
                avatar: () => convStore.otherAvatar,
                called: () => callStore.called,
                callEnd: () => callStore.callEnd,
                callReach: () => callStore.callReach,
                callStatus: () => callStore.callStatus,
                callSummary: () => callStore.callSummary,
                loading: () => callStore.called && !callStore.callEnd,
                showNum: () => callStore.showNum,
            },
            actions: [],
        });
        if (convStore.convid !== options.convid) {
            wx.navigateBack({delta: 1, success: () => {}});
        }
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow(): void {
        callStore.apiCallReach();
    },
    goDialogPhone() {
        wx.navigateTo({url: PageURL.PPhones, success: () => {}});
    },
    callPhone() {
        callStore.apiCallPhone(convStore.convid);
    },
    submit() {
        if (!callStore.called) {
            this.callPhone();
        } else if (callStore.callEnd) {
            Dialog.confirm({
                message: `确认再次呼叫${this.data.name}？`,
                confirmButtonText: '确认呼叫',
            }).then(() => {
                this.callPhone();
            }).catch(() => {});
        } else if (callStore.callMsgTid) {
            callStore.apiCallReach();
        }
    },
    getPhoneNumber(e: any): void {
        phoneStore.getWXPhoneNumber(e, false);
    },
});
