import { configure, action, observable, computed } from 'mobx-miniprogram';
import { AppCfg } from '../cores/const';
import { convStore } from './conv';
import { callStore } from './call';

const AgoraRTM = require('../cores/libs/agora-rtm-miniapp-1.0.1');

// 不允许在动作外部修改状态
configure({enforceActions: true});

class AgrtmStore {

    rtmClient: any = null;
    @observable clientId: string = '';  // 客户端ID

    constructor() {
        console.log('AgrtmStore.constructor');
    }

    @computed get logged(): boolean {
        return Boolean(this.clientId);
    }

    @action.bound login(token: string, uid: string) {
        if (this.logged) return;
        if (!(token && uid)) return;
        const obj = {token: token, uid: uid};
        console.log('AgrtmStore.login', uid);
        this.rtmClient = AgoraRTM.createInstance(AppCfg.AgoraAppId);
        this.rtmClient.login(obj).then(() => {
            console.log('AgrtmStore.login__done', uid);
            this.subscribeLoginEvents();
            this.clientId = uid;
        });
    }

    @action.bound logout() {
        if (!(this.logged && this.rtmClient)) return;
        console.log('AgrtmStore.logout', this.clientId);
        this.rtmClient.logout().then(() => {
            console.log('AgrtmStore.logout__done', this.clientId);
            this.clientId = '';
        });
    }

    @action.bound subscribeLoginEvents() {
        if (!this.rtmClient) return;
        this.rtmClient.on('ConnectionStateChanged', (newState: any, reason: any) => {
            console.info('AgrtmStore.ConnectionStateChanged', newState, reason);
        });
        this.rtmClient.on('MessageFromPeer', (message: any, peerId: string, info: any) => {
            console.log('AgrtmStore.MessageFromPeer', info);
            this.rtmNewMsg(message, peerId);
        });
    }

    @action.bound rtmNewMsg(message: any, peerId: string) {
        if (peerId !== '-') return;
        if (message.messageType !== 'TEXT') return;
        const data = JSON.parse(message.text);
        switch (data.evt) {
            case 10:    // 打开会话，接收消息者触发
                if (data.usrtid === this.clientId) {
                    // 更新接收者，会话列表未读消息量
                    convStore.apiGetConvs(convStore.convQs);
                } else if (data.cid == convStore.convid) {
                    // 全量更新，发送者消息已读状态
                    convStore.apiGetMsg('-');
                }
                break;
            case 20:    // 新消息
                if (data.cid == convStore.convid) {
                    convStore.apiGetMsg();  // 增量更新
                } else {
                    convStore.apiGetConvs(convStore.convQs);
                }
                break;
            case 52:    // 通话触达状态
                if (data.cid == convStore.convid) {
                    convStore.apiGetMsg('-');  // 全量更新，通话触达状态
                } else {
                    convStore.apiGetConvs(convStore.convQs);
                }
                callStore.upCallMsgReach(data);
                break;
            default:
                console.log(`rtm event not support ${data.evt}`);
                break;
        }
    }
}

export const agrtmStore = new AgrtmStore();
