import Dialog from '@vant/weapp/dialog/dialog';
// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { AppInfo, PageURL, ShareTimelineMsg } from '../../../../cores/const';
import { scanQStore } from '../../../../store/scanq';
import { reqSMStore } from '../../../../store/reqsm';
import { userStore } from '../../../../store/user';
import { tools } from '../../../../cores/tools';

Page({
    data: {
        qrimg: '',
        show: false,
        appName: AppInfo.Name,
        actions: [
            {
                name: '重置二维码',
                action: 'reset',
            },
            {
                name: '扫码结果预览',
                action: 'review',
            },
            {
                name: '用户码个性签名',
                action: 'bio',
            },
            {
                name: '保存图片自行打印',
                action: 'save',
            },
            {
                name: '分享链接可通话',
                openType: 'share',
            },
        ]
    },
    onLoad: function() {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                qrimg: () => userStore.uqrInfo?.img,
                rsmAllowed: () => reqSMStore.allowed,
            },
            actions: [],
        });
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow(): void {
        userStore.apiUQRImageInfo();
    },
    onShareAppMessage: function (res: any) {
        return userStore.getShareAppMessage(res);
    },
    onShareTimeline(): any {
        return {title: ShareTimelineMsg, query: ``};
    },
    openAction(): void {
        this.setData({show: true});
    },
    closeAction() {
        this.setData({show: false});
    },
    selectAction(e: any) {
        this.closeAction();
        if (e.detail.action === 'reset') {
            Dialog.confirm({
                title: '是否重置二维码？',
                message: `重置后你将会获得新的二维码，\n而之前的二维码均将失效。`,
                confirmButtonText: '确认重置',
            }).then(() => {
                userStore.apiUQRReset();
            }).catch(() => {});
        } else if (e.detail.action === 'review') {
            scanQStore.setQ(userStore.uqrInfo?.url || '');
            wx.navigateTo({url: PageURL.PReview, success: () => {}});
        } else if (e.detail.action === 'bio') {
            wx.navigateTo({url: PageURL.PProfileBio, success: () => {}});
        } else if (e.detail.action === 'save') {
            this.saveImage();
        }
    },
    saveImage() {
        reqSMStore.reqSubscribeMsgSilent();
        const imgSrc = userStore.uqrInfo?.img || '';
        tools.saveImageToAlbum(imgSrc);
    },
    reqSubscribeMsg() {
        reqSMStore.reqSubscribeMsg();
    }
});
