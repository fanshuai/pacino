import { when } from 'mobx-miniprogram';
// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Toast from '@vant/weapp/toast/toast';
import { LoadingMsg, PageURL } from '../../cores/const';
import { reqSMStore } from '../../store/reqsm';
import { scanQStore } from '../../store/scanq';
import { userStore } from '../../store/user';
import { tools } from '../../cores/tools';

Page({
    data: {
        LoadingMsg: LoadingMsg,
        pages: PageURL,
    },
    onLoad: function (options: any) {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                logged: () => userStore.logged,
                qrQuery: () => scanQStore.qrQuery,
                isDone: () => scanQStore.isDone,
                isFail: () => scanQStore.isFail,
                isPre: () => scanQStore.isPre,
            },
            actions: [],
        });
        if (options.q) scanQStore.setQ(decodeURIComponent(options.q));
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow: function() {
        scanQStore.apiQuery();
    },
    onPullDownRefresh: function() {
        scanQStore.apiQuery();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
        }, 500);
    },
    userInfoScopeAllow(e: any): void {
        when(
            () => userStore.logged,
            () => scanQStore.apiQuery(),
        );
        userStore.userInfoScopeAllow(e);
    },
    userInfoScopeAllowGoMsg(e: any): void {
        when(
            () => userStore.logged,
            () => this.gotoMsg(),
        );
        this.userInfoScopeAllow(e);
    },
    userInfoScopeAllowGoCall(e: any): void {
        when(
            () => userStore.logged,
            () => this.gotoCall(),
        );
        this.userInfoScopeAllow(e);
    },
    userInfoScopeAllowGoQRBind(e: any): void {
        when(
            () => userStore.logged,
            () => this.gotoQRBind(),
        );
        this.userInfoScopeAllow(e);
    },
    toBack() {
        if (scanQStore.isFromBar) {
            scanQStore.routeBack();
        } else {
            wx.navigateBack({delta: 1, success: () => scanQStore.clear() });
        }
    },
    touch(action: '' | 'msg' | 'call' = '') {
        if (!(userStore.logged && scanQStore.isDone)) return;
        if (scanQStore.qrQuery?.self) {
            Toast.fail(`自己的${scanQStore.qrQuery.by}`);
        } else if (scanQStore.qrQuery?.convid) {
            const url = `${PageURL.PDialog}?convid=${scanQStore.qrQuery.convid}&action=${action}`;
            wx.redirectTo({url: url, success: () => scanQStore.clear()});
        } else {
            scanQStore.apiContact(action);
        }
    },
    gotoMsg() {
        this.touch('msg');
    },
    gotoCall() {
        this.touch('call');
    },
    goDialog() {
        if (scanQStore.qrQuery?.convid) {
            reqSMStore.reqSubscribeMsgSilent();
            this.touch();
        }
    },
    gotoQRBind() {
        scanQStore.apiQRCodeBind();
    },
    goStoreMPA(e: any): void {
        const {spuid} = e.currentTarget.dataset;
        tools.goMPAStore(spuid);
    }
});
