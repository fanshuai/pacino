import { fly, fly_catch } from '../../../../cores/http';

Page({
    data: {
        symbol: '',
        selfdom: '',
        autosize: {minHeight: 50, maxHeight: 80},
    },
    onLoad: function (options: any) {
        const selfdom = decodeURIComponent(options.selfdom || '');
        this.setData({symbol: options.symbol, selfdom: selfdom});
    },
    onChange(e: any) {
        this.setData({selfdom: e.detail});
    },
    submit() {
        this.apiSymbolSelfdom();
    },
    apiSymbolSelfdom(): void {
        fly.post(`/release/symbol/${this.data.symbol}/selfdom`, {
            selfdom: this.data.selfdom
        }).then(() => {
            wx.navigateBack({delta: 1, success: () => {} });
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        fly_catch(e);
    },
});
