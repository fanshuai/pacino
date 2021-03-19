import { fly, fly_catch } from '../../../../cores/http';

Page({
    data: {
        symbol: '',
        title: '',
    },
    onLoad: function (options: any) {
        const title = decodeURIComponent(options.title || '');
        this.setData({symbol: options.symbol, title: title});
    },
    onChange(e: any) {
        this.setData({title: e.detail});
    },
    submit() {
        this.apiSymboltitle();
    },
    apiSymboltitle(): void {
        fly.post(`/release/symbol/${this.data.symbol}/title`, {
            title: this.data.title
        }).then(() => {
            wx.navigateBack({delta: 1, success: () => { }});
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        fly_catch(e);
    },
});
