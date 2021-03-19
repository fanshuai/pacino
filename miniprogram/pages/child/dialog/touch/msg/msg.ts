import Toast from '@vant/weapp/toast/toast';
import { convStore } from '../../../../../store/conv';
import { reqSMStore } from '../../../../../store/reqsm';
import { fly_catch } from '../../../../../cores/http';

Page({
    data: {
        message: '',
        loading: false,
        autosize: {minHeight: 50, maxHeight: 80},
    },
    onLoad: function (options: any) {
        if (convStore.convid !== options.convid) {
            wx.navigateBack({delta: 1, success: () => {}});
        }
    },
    onChange(e: any) {
        this.setData({message: e.detail});
    },
    submit() {
        this.apiSendMsg();
    },
    apiSendMsg(): any {
        if (this.data.loading) return;
        if (!this.data.message) {
            Toast.fail('请输入');
            return;
        }
        this.setData({loading: true});
        const params = {txt: this.data.message};
        convStore.apiMsgStayPromise(params).then((res: any) => {
            this.setData({loading: false});
            reqSMStore.reqSubscribeMsgSilent();
            console.info('apiMsgStayPromise:success', res);
            wx.navigateBack({delta: 1, success: () => reqSMStore.reqSubscribeMsgModal()});
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        this.setData({loading: false});
        fly_catch(e);
    }
});
