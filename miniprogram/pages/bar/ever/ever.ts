import { when } from 'mobx-miniprogram';
// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { AppInfo, PageURL, LoadingMsg, ShareTimelineMsg } from '../../../cores/const';
import { reqSMStore } from '../../../store/reqsm';
import { scanQStore } from '../../../store/scanq';
import { convStore } from '../../../store/conv';
import { userStore } from '../../../store/user';
import { tools } from '../../../cores/tools';

Page({
    data: {
        query: '',
        height: 0,
        pages: PageURL,
        AppName: AppInfo.Name,
        LoadingMsg: LoadingMsg,
        refreshing: false,
        loading: false,
        logged: false,
        convs: [],
    },
    onLoad: function() {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                initialized: () => userStore.initialized,
                loading: () => userStore.loading,
                appUser: () => userStore.appUser,
                logged: () => userStore.logged,
                convs: () => convStore.convs,
                query: () => convStore.convQs,
                convAmt: () => convStore.convAmt,
                noCReason: () => convStore.noCReason,
                rsmAllowed: () => reqSMStore.allowed,
            },
            actions: [],
        });
        when(() => userStore.logged, () => this.getConvs(convStore.convQs));
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow: function() {
        this.getConvs(convStore.convQs);
        convStore.selectConv('');
        scanQStore.setFromPage(PageURL.PBarEver);
    },
    onPullDownRefresh: function() {
        this.getConvs(convStore.convQs);
        this.setData({refreshing: true});
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
            this.setData({refreshing: false});
        }, 500);
    },
    onShareAppMessage: function (res: any) {
        return userStore.getShareAppMessage(res);
    },
    onShareTimeline(): any {
        return {title: ShareTimelineMsg, query: ``};
    },
    onClear() {
        this.getConvs('');
    },
    onChange(e: any) {
        this.getConvs(e.detail);
    },
    onSearch(e: any) {
        this.getConvs(e.detail);
    },
    getConvs(query: string): void {
        convStore.apiGetConvs(query);
    },
    userInfoScopeAllow(e: any): void {
        userStore.userInfoScopeAllow(e);
    },
    goDialog(e: any): void {
        reqSMStore.reqSubscribeMsgSilent();
        const {convid} = e.currentTarget.dataset;
        const url = `${PageURL.PDialog}?convid=${convid}`;
        wx.navigateTo({url: url, success: () => reqSMStore.reqSubscribeMsgModal() });
    },
    reqSubscribeMsg() {
        reqSMStore.reqSubscribeMsg();
    },
    goStoreMPA() {
        tools.goMPAStore();
    }
});

