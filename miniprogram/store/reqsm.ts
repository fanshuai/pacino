import { configure, action, observable } from 'mobx-miniprogram';
import Dialog from '@vant/weapp/dialog/dialog';
import Toast from '@vant/weapp/toast/toast';
import { logger } from '../cores/log';

// 不允许在动作外部修改状态
configure({enforceActions: true});

// 消息未读提醒 & 来电未接提醒
const tmplIdUnread = 'DVOmo8aixP5Zu7Y6SewZ4qnhbVENGJgdoIqqqJgcxMc';
const tmplIdMissed = 'ihGOZxgR-80yerah7ZUH9K9-z08gY_WFErniZKd9c3k';

// 订阅消息状态维护
class ReqSMStore {

    reqCount: number = 0;
    modalCancel: boolean = false;
    @observable checked: number = 0;
    @observable allowed: boolean = true;

    constructor() {
        this.checkAllowed();
    }

    @action.bound checkAllowed(): void {
        wx.getSetting({
            withSubscriptions: true,
            success: this.checkAllowedSuccess,
        });
    }

    @action.bound checkAllowedSuccess(res: any): void {
        let {
            authSetting = {},
            subscriptionsSetting: { mainSwitch = false, itemSettings = {} } = {}
        } = res;
        if (
            (authSetting['scope.subscribeMessage'] || mainSwitch)
            && itemSettings[tmplIdUnread] === 'accept'
            && itemSettings[tmplIdMissed] === 'accept'
        ) {
            this.allowed = true;
            if (this.checked > 0) Toast.success('已订阅提醒');
        } else {
            this.allowed = false;
        }
        this.checked += 1;
        console.log('ReqSMStore.checkAllowedSuccess', this.checked, this.allowed);
    }

    @action.bound guideOpenSubscribeMessage(): void {
        Dialog.confirm({
            title: '打开订阅消息？',
            message: '订阅已关闭，接收消息和来电提醒，\n需要打开[接收订阅消息]设置。',
            confirmButtonText: '去设置',
            confirmButtonOpenType: 'openSetting',
        }).then(() => {
            console.log('openSetting:confirm');
        }).catch(() => {
            console.log('openSetting:cancel');
            Toast.fail('未打开订阅');
        });
    }

    // 用户已授权始终保持允许，静默订阅
    @action.bound reqSubscribeMsgSilent(): void {
        if (!this.allowed) return;
        this.reqSubscribeMsg();
    }

    @action.bound reqSubscribeMsg(): void {
        this.modalCancel = false;
        wx.requestSubscribeMessage({
            tmplIds: [tmplIdUnread, tmplIdMissed],
            success: this.reqSubscribeMsgSuccess,
            fail: this.reqSubscribeMsgFail,
        });
    }

    @action.bound reqSubscribeMsgSuccess(res: any) {
        console.log('reqSubscribeMsgSuccess');
        if ((res[tmplIdUnread] === 'reject') && (res[tmplIdMissed] === 'reject')) {
            console.warn('requestSubscribeMessage.reject', res);
        } else if ((res[tmplIdUnread] === 'accept') || (res[tmplIdMissed] === 'accept')) {
            if (!this.allowed) this.checkAllowed();  // 非始终允许
        }
        this.reqCount += 1;
    }
    @action.bound reqSubscribeMsgFail(res: any) {
        logger.warn('reqSubscribeMsgFail', res);
        if (res.errCode == 20004) {
            logger.warn('requestSubscribeMessage:switchOff', this.reqCount);
            this.guideOpenSubscribeMessage();
        }
    }
    @action.bound reqSubscribeMsgModal(): void {
        // 路由成功回调函数无法直接订阅，配合静默订阅使用
        if (this.allowed) return;
        if (this.modalCancel) return;
        setTimeout(() => {
            Dialog.confirm({
                title: '订阅提醒消息',
                message: '接收消息和来电提醒，\n需订阅消息并总是保持允许。',
                confirmButtonText: '确认订阅',
            }).then(() => {
                this.reqSubscribeMsg();
            }).catch(() => {
                logger.warn('reqSubscribeMsgModal:cancel');
                this.modalCancel = true;
            });
        }, 800);
    }
}


export const reqSMStore = new ReqSMStore();
