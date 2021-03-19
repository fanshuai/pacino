import { configure, action, observable, computed } from 'mobx-miniprogram';
import { fly, fly_catch } from '../cores/http';
import { logger } from '../cores/log';

// 不允许在动作外部修改状态
configure({enforceActions: true});

class CallStore {

    readonly endStatus = [410, 420, 500];

    convid: string = '';
    callMsgTid: string = '';  // 通话消息ID
    @observable called: boolean = false;
    @observable callReach: number = 0;  // 呼叫状态
    @observable callReachd: string = '';  // 呼叫状态描述
    @observable callSummary: string = '';  // 呼叫摘要
    @observable showNum: string = '';  // 呼叫显号

    constructor() {

    }

    @computed get callEnd(): boolean {
        return this.endStatus.indexOf(this.callReach) > -1;
    }

    @computed get callStatus(): string {
        if (this.callEnd) {
            return '再次呼叫'
        } else if (this.called) {
            return this.callReachd || '正在呼叫';
        } else {
            return '确认呼叫';
        }
    }

    @action.bound upCallMsgReach(data: any): void {
        if (data.mid == this.callMsgTid) {
            const notEnd = this.endStatus.indexOf(data.reach) === -1;
            if (this.callEnd && notEnd) {
                console.log(`=====callEnd status back block: ${this.callMsgTid}`);
            } else {
                this.callReach = data.reach;
                this.callReachd = data.reachd;
                this.callSummary = data.summary;
            }
        } else {
            console.log('=====upCallMsgReach not match');
        }
    }

    @action.bound clearCallInfo(): void {
        this.called = false;
        this.convid = '';
        this.showNum = '';
        this.callReach = 0;
        this.callReachd = '';
        this.callMsgTid = '';
        this.callSummary = '';
    }

    @action.bound apiCallPhone(convid: string): void {
        this.clearCallInfo();
        this.convid = convid;
        this.called = true;  // 必须在clearCallInfo之后
        fly.post(`/convert/conv/${convid}/call`).then(
            this.apiCallPhoneSuccess
        ).catch(this.apiCallPhoneFail);
    }

    @action.bound apiCallPhoneSuccess(res: any): any {
        this.callMsgTid = res.msg.tid;
        this.showNum = res.show;
    }
    @action.bound apiCallPhoneFail(e: any): any {
        logger.warn('apiCallPhoneFail', e);
        this.clearCallInfo();
        this.apiError(e);
    }

    @action.bound apiCallReach(): any {
        if (!this.callMsgTid) return;
        fly.get(`/convert/msg/${this.callMsgTid}/reach`).then(
            this.apiCallReachSuccess
        ).catch(this.apiError);
    }

    @action.bound apiCallReachSuccess(res: any): any {
        this.upCallMsgReach(res.res);
    }

    @action.bound apiError(e: any): void {
        fly_catch(e);
    }
}

export const callStore = new CallStore();
