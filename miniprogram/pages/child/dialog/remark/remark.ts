import { fly_catch } from '../../../../cores/http';
import { convStore } from '../../../../store/conv';

Page({
    data: {
        name: '',
        convid: '',
        remark: '',
    },
    onLoad: function (options: any) {
        wx.setNavigationBarTitle({title: `${options.name} 备注`, success: () => {}});
        this.setData({name: options.name, convid: options.convid, remark: options.remark});
    },
    onChange(e: any) {
        this.setData({remark: e.detail});
    },
    submit() {
        this.apiConvRemark();
    },
    apiConvRemark(): void {
        convStore.apiSetRemarkPromise(this.data.convid, this.data.remark).then(() => {
            wx.navigateBack({delta: 1, success: () => {}});
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        fly_catch(e);
    },
});
