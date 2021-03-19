// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { userStore } from '../../../store/user';
import { PageURL } from '../../../cores/const';

Page({
    data: {
        pages: PageURL,
    },
    onLoad: function() {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                appUser: () => userStore.appUser,
                logged: () => userStore.logged,
            },
            actions: [],
        });
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onPullDownRefresh: function() {
        userStore.apiGetProfile();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
        }, 500);
    },
});
