// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Dialog from '@vant/weapp/dialog/dialog';
import { PageURL } from '../../../cores/const';
import { phoneStore } from '../../../store/phone';

Page({
    data: {
        limit: 1,
        phones: [],
        pages: PageURL,
    },
    onLoad: function() {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                phones: () => phoneStore.phones,
                limit: () => phoneStore.limit,
            },
            actions: [],
        });
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow(): void {
        phoneStore.apiGetPhones();
    },
    onPullDownRefresh: function() {
        phoneStore.apiGetPhones();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
        }, 500);
    },
    setMainPhone(e: any): void {
        const {key, fmt, main} = e.currentTarget.dataset;
        if (main) return;
        Dialog.confirm({
            title: '设置为主手机号？',
            message: `设置后，双呼通话将转接至\n手机号：${fmt}。`,
            confirmButtonText: '确认设置',
        }).then(() => {
            phoneStore.apiSetMain(key);
        }).catch(() => {});
    },
});
