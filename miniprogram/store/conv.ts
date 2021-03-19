import { configure, observable, action, computed } from 'mobx-miniprogram';
import Toast from '@vant/weapp/toast/toast';
import { fly, fly_catch } from '../cores/http';
import { PageURL } from '../cores/const';
import { tools } from '../cores/tools';
import { logger } from '../cores/log';
import { userStore } from './user';

// 不允许在动作外部修改状态
configure({enforceActions: true});

// 会话信息
interface Conv {
    convid: string,  // 会话ID
    unread: number,  // 未读消息量
    block: boolean,  // 是否屏蔽对方
    memo: string,  // 最新消息摘要
    timer: string,  // 最新消息时间
    name: string,  // 对方名字
    avatar: string,  // 对方头像
    remark: string,  // 对方备注
    called: number,  // 通话次数
}
// 对方用户信息
interface Other {
    tid: string,  // 用户ID
    name: string,  // 名字
    avatar: string,  // 头像
    codef: string,  // 用户码，格式化
    gender: number,  // 性别编码
    genderd: string,  // 性别
}

// 对话或消息数量
interface Amount {
    count: number,  // 总量
    limit: number,  // 显示量
}
// 消息内容
interface Msg {
    tid: string,  // 主键
    timer: string,  // 发送时间
    timed: boolean,  // 是否显示时间
    type: number,  // 消息类型
    self: boolean,  // 自己发送
    memo: string,  // 内容摘要
    avatar: string,  // 发送方头像
    reach: number,  // 通话触达状态
}


class ConvStore {

    @observable unread: number = 0;  // 未读会话量
    @observable convQs: string = '';  // 会话搜索
    @observable convs: Array<Conv> = []; // 会话列表
    @observable noCReason: string = '';  // 无会话提示
    ///////////
    @observable convid: string = '';  // 当前会话
    @observable conv: Conv | undefined;  // 当前会话
    @observable other: Other | undefined;  // 对方用户信息
    @observable msgs: Array<Msg> = []; // 当先会话消息列表
    @observable lastMsg: string = '';  // 最新消息
    @observable msgAmt: Amount = {count: 0, limit: 0};  // 消息数量
    @observable convAmt: Amount = {count: 0, limit: 0};  // 会话数量

    constructor() {

    }

    @computed get scrollTo() {
        return `ID-${this.lastMsg}`;
    }
    @computed get isBlock() {
        return Boolean(this.conv?.block);
    }
    @computed get hasMsgs() {
        return this.msgs.length > 0;
    }
    @computed get otherTid() {
        return this.other?.tid || '';
    }
    @computed get otherAvatar() {
        return this.other?.avatar || '';
    }
    @computed get convTitle(): string {
        return this.conv?.remark || this.conv?.name || '';
    }

    @action.bound selectConv(convid: string): void {
        if (!convid) {
            this.convid = '';
            this.conv = undefined;
            this.other = undefined;
            this.lastMsg = '';
            this.msgs = [];
            this.msgAmt = {count: 0, limit: 0};
        } else {
            this.convid = convid;
            this.apiGetConv();
        }
    }
    @action.bound apiGetConvs(convQs: string = ''): void {
        this.noCReason = '';
        this.convQs = convQs;
        if (!userStore.logged) return;
        fly.get(`/convert/convs?q=${convQs}`).then(this.apiGetConvsSuccess).catch(this.apiError);
    }
    @action.bound apiGetConvsSuccess(res: any) {
        this.noCReason = res.count > 0 ? '' : (this.convQs ? '无搜索结果' : '无最近联系人');
        this.convAmt = {count: res.count, limit: res.limit};
        this.unread = res.unread;
        this.convs = res.convs;
    }
    @action.bound apiGetConv(): void {
        if (!(this.convid && userStore.logged)) return;
        fly.get(`/convert/conv/${this.convid}`).then(this.apiGetConvSuccess).catch(this.apiError);
    }
    @action.bound apiGetConvSuccess(res: any) {
        this.other = res.other;
        this.conv = res.conv;
    }
    @action.bound apiGetMsg(last: string = ''): void {
        if (!(this.convid && userStore.logged)) return;
        if (`/${tools.currentPage()}` !== PageURL.PDialog) return;
        const url = `/convert/conv/${this.convid}/msg?last=${last || this.lastMsg}`;
        fly.get(url).then(this.apiGetMsgSuccess).catch(this.apiGetMsgFail);
    }
    @action.bound apiGetMsgSuccess(res: any) {
        this.msgAmt = {count: res.count, limit: res.limit};
        this.lastMsg = res.last;
        if (res.add) {
            this.msgs = this.msgs.concat(res.msgs)
        } else {  // 全量更新
            this.msgs = res.msgs;
        }
    }
    @action.bound apiGetMsgFail(e: any) {
        logger.warn('apiGetMsgFail', e);
        this.selectConv(this.convid);
        fly_catch(e);
    }
    @action.bound apiSetBlock(convid: string, block: boolean): void {
        if (this.convid !== convid) return;
        fly.post(`/convert/conv/${this.convid}/block`, {block: block}).then(
            this.apiSetBlockSuccess
        ).catch(this.apiError);
    }
    @action.bound apiSetBlockSuccess(res: any) {
        if (!res.block) Toast.success('已取消');
        this.other = res.other;
        this.conv = res.conv;
    }

    @action.bound apiError(e: any): void {
        this.convQs = '';
        fly_catch(e);
    }
    apiMsgStayPromise(params: any): any {
        if (!this.convid) return;
        return fly.post(`/convert/conv/${this.convid}/stay`, params);
    }
    apiSetRemarkPromise(convid: string, remark: string): any {
        if (this.convid !== convid) return;
        return fly.post(`/convert/conv/${this.convid}/remark`, {remark: remark});
    }
    apiAddReportPromise(convid: string, data: any): any {
        if (this.convid !== convid) return;
        return fly.post(`/convert/conv/${this.convid}/report`, data);
    }
}

export const convStore = new ConvStore();
