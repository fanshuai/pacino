// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Dialog from '@vant/weapp/dialog/dialog';
import { AppInfo, PageURL } from '../../../cores/const';
import { phoneStore } from '../../../store/phone';
import { reqSMStore } from '../../../store/reqsm';
import { scanQStore } from '../../../store/scanq';
import { userStore } from '../../../store/user';
import { tools } from '../../../cores/tools';
import { logger } from '../../../cores/log';

const anonAvatar = 'https://daowo-oss.ifand.com/assets/avatar.png';

Page({
    data: {
        pages: PageURL,
        anonAvatar: anonAvatar,
        appName: AppInfo.Name,
        loading: false,
    },
    onLoad: function() {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                loading: () => userStore.loading,
                appUser: () => userStore.appUser,
                logged: () => userStore.logged,
                phone: () => phoneStore.mainShow,
                rsmAllowed: () => reqSMStore.allowed,
            },
            actions: [],
        });
        setTimeout(() => this.checkPhoneNumber(), 800);
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow: function() {
        userStore.apiGetProfile();
        phoneStore.apiGetPhones();
        userStore.wxCheckSession('mine');
        scanQStore.setFromPage(PageURL.PBarMine);
    },
    onPullDownRefresh: function() {
        userStore.apiGetProfile();
        phoneStore.apiGetPhones();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
        }, 500);
    },
    onShareAppMessage: function (res: any) {
        return userStore.getShareAppMessage(res);
    },
    userInfoScopeAllow(e: any): void {
        userStore.userInfoScopeAllow(e);
    },
    checkPhoneNumber(): void {
        if (!userStore.logged) return;
        if (phoneStore.mainShow) return;
        const symbols = Boolean(userStore.appUser?.symbols);
        let message: string;
        if (symbols) {
            message = '已绑定场景码，请完善手机号，\n以保证他人可以正常联系。';
        } else {
            message = '需完善手机号，以保证通话功能正常使用。';
        }
        Dialog.confirm({
            title: '完善手机号',
            message: message,
            confirmButtonText: '获取手机号',
            confirmButtonOpenType: 'getPhoneNumber',
            showCancelButton: !symbols,
        }).then(() => {
            logger.info('checkPhone:confirm');
        }).catch(() => {
            logger.warn('checkPhone:cancel');
        });
    },
    getPhoneNumber(e: any): void {
        phoneStore.getWXPhoneNumber(e, false);
    },
    goPhones() {
        reqSMStore.reqSubscribeMsgSilent();
        wx.navigateTo({url: PageURL.PPhones, success: () => {}});
    },
    goSymbol() {
        reqSMStore.reqSubscribeMsgSilent();
        wx.navigateTo({url: PageURL.PSymbol, success: () => {}});
    },
    goQRUser() {
        reqSMStore.reqSubscribeMsgSilent();
        wx.navigateTo({url: PageURL.PProfileQRUser, success: () => {}});
    },
    goScan() {
        reqSMStore.reqSubscribeMsgSilent();
        wx.switchTab({url: PageURL.PBarScan, success: () => {}});
    },
    reqSubscribeMsg() {
        reqSMStore.reqSubscribeMsg();
    },
    goStoreMPA() {
        tools.goMPAStore();
    }
});
