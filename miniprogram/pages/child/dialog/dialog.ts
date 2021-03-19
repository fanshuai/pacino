import { when } from 'mobx-miniprogram';
// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Toast from '@vant/weapp/toast/toast';
import { PageURL } from '../../../cores/const';
import { userStore } from '../../../store/user';
import { convStore } from '../../../store/conv';
import { callStore } from '../../../store/call';
import { reqSMStore } from '../../../store/reqsm';

Page({
    data: {
        convid: '',
        height: 0,
        scrollTo: '',
        pages: PageURL,
        conv: {},
        msgs: [],
        avatar: '',
        action: '',
    },
    onLoad: function (options: any) {
        this.setData({
            convid: options.convid,
            action: options.action || '',
            avatar: userStore.appUser?.avatar,
        });

        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                conv: () => convStore.conv || {},
                msgs: () => convStore.msgs || [],
                msgAmt: () => convStore.msgAmt,
                scrollTo: () => convStore.scrollTo,
                rsmAllowed: () => reqSMStore.allowed,
            },
            actions: [],
        });
        if (userStore.logged && options.convid) {
            when(() => Boolean(convStore.convTitle), () => {
                wx.setNavigationBarTitle({title: convStore.convTitle, success: () => {}});
            });
            convStore.selectConv(options.convid);
        } else {
            wx.switchTab({url: PageURL.PBarEver, success: () => {}});
        }
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow: function() {
        convStore.apiGetMsg('-');  // 全量更新
        if (convStore.convid !== callStore.convid) {
            callStore.clearCallInfo();
        }
        if (this.data.action === 'call') {
            this.setData({action: ''});
            Toast.loading({
                duration: 800,
                message: '处理中...',
                forbidClick: true,
                loadingType: 'spinner',
                onClose: () => this.goCall(false),
            });
        } else if (this.data.action === 'msg') {
            this.setData({action: ''});
            Toast.loading({
                duration: 800,
                message: '处理中...',
                forbidClick: true,
                loadingType: 'spinner',
                onClose: () => this.goMsg(false),
            });
        } else {
            this.setData({action: ''});
            const title = convStore.convTitle;
            if (title) wx.setNavigationBarTitle({title: title, success: () => {}});
        }
    },
    goMsg(subMsg: boolean = true) {
        if (subMsg) reqSMStore.reqSubscribeMsgSilent();
        const url = `${PageURL.PDialogMsg}?convid=${this.data.convid}`;
        wx.navigateTo({url: url, success: () => {}});
    },
    goCall(subMsg: boolean = true) {
        if (subMsg) reqSMStore.reqSubscribeMsgSilent();
        const url = `${PageURL.PDialogCall}?convid=${this.data.convid}`;
        wx.navigateTo({url: url, success: () => {}});
    },
    goOther() {
        reqSMStore.reqSubscribeMsgSilent();
        const url = `${PageURL.PDialogOther}?convid=${this.data.convid}`;
        wx.navigateTo({url: url, success: () => {}});
    },
    reqSubscribeMsg() {
        reqSMStore.reqSubscribeMsg();
    }
});

