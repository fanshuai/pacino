// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Dialog from '@vant/weapp/dialog/dialog';
import { PageURL } from '../../../../cores/const';
import { convStore } from '../../../../store/conv';

Page({
    data: {
        convid: '',
        conv: {},
        other: {},
        block: false,
        pages: PageURL,
    },
    onLoad: function (options: any) {
        this.setData({convid: options.convid});
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                conv: () => convStore.conv,
                other: () => convStore.other,
                block: () => convStore.isBlock,
            },
            actions: [],
        });
        if (!(convStore.convid == options.convid)) {
            wx.navigateBack({delta: 1, success: () => {}});
        }
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow(): void {
        convStore.apiGetConv();
    },
    onPullDownRefresh: function() {
        convStore.apiGetConv();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
        }, 500);
    },
    changeBlock(e: any) {
        if (e.detail) {
            Dialog.confirm({
                title: '是否屏蔽对方？',
                message: '屏蔽后，对方将无法与我通话。',
                confirmButtonText: '确认屏蔽',
            }).then(() => {
                convStore.apiSetBlock(this.data.convid, true);
            }).catch(() => {});
        } else {
            convStore.apiSetBlock(this.data.convid, false);
        }
    },
});
