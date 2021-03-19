// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { AppInfo, PageURL } from '../../../cores/const';
import { userStore } from '../../../store/user';

Page({
    data: {
        devices: 1,
        logged: false,
        pages: PageURL,
        hasUpdate: false,
        updateReady: false,
        version: AppInfo.Version,
    },
    onLoad(): void {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                logged: () => userStore.logged,
            },
            actions: [],
        });
    },
    onShow(): void {
        this.setData({devices: userStore.appUser?.devices});
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onPullDownRefresh: function() {
        userStore.apiGetProfile();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
            this.setData({devices: userStore.appUser?.devices});
        }, 200);
    },
    userInfoScopeAllow(e: any): void {
        userStore.userInfoScopeAllow(e);
    },
});
