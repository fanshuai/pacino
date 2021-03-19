// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import Dialog from '@vant/weapp/dialog/dialog';
import Toast from '@vant/weapp/toast/toast';
import { constStore } from '../../../../store/const';
import { convStore } from '../../../../store/conv';
import { fly_catch } from '../../../../cores/http';

Page({
    data: {
        convid: '',
        report: '',
        reports: [],
        otherTxt: '',
        offend: false,
        offendTxt: '',
        autosize: {minHeight: 50, maxHeight: 80},
    },
    onLoad: function (options: any) {
        this.setData({convid: options.convid});
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                reports: () => constStore.reports,
            },
            actions: [],
        });
        if (!(convStore.convid == options.convid)) {
            wx.navigateBack({delta: 1, success: () => {}});
        } else {
            constStore.apiFetch();
        }
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onKindClick(e: any) {
        const {report} = e.currentTarget.dataset;
        this.setData({report: report});
    },
    onOtherChange(e: any) {
        this.setData({otherTxt: e.detail});
    },
    onOffendSwitch(e: any) {
        this.setData({offend: e.detail});
    },
    onOffendChange(e: any) {
        this.setData({offendTxt: e.detail});
    },
    submit() {
        const kind = this.data.report || '';
        const kindTxt = this.data.otherTxt || '';
        if (kind === '') {
            Toast('请选择举报类型');
        } else if (kind === '0' && !kindTxt) {
            Toast('请确认举报类型输入');
        } else {
            const data = {
                kind: Number(kind),
                report: kindTxt,
                offend: this.data.offend,
                offended: this.data.offendTxt,
            };
            this.apiAddReport(data);
        }
    },
    apiAddReport(data: any): void {
        convStore.apiAddReportPromise(this.data.convid, data).then((res: any) => {
            wx.navigateBack({
                delta: 1, success: () => {
                    if (res.offend) {
                        Dialog.alert({
                            title: '提交成功',
                            message: '感谢反馈，我们会尽快核实处理，请您注意自我保护。',
                        });
                    } else {
                        Toast('感谢反馈，我们会尽快核实处理');
                    }
                }
            });

        }).catch(this.apiError);
    },
    apiError(e: any): void {
        fly_catch(e);
    },
});
