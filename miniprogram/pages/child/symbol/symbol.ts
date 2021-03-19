import { PageURL, StorageKey } from '../../../cores/const';
import { fly, fly_catch } from '../../../cores/http';
import { scanQStore } from '../../../store/scanq';

Page({
    data: {
        symbols: [],
        pages: PageURL,
        navigated: false,
    },
    onLoad: function() {
        const symbols = wx.getStorageSync(StorageKey.UserSymbols);
        if (symbols) this.setData({symbols: symbols});
    },
    onShow(): void {
        this.apiGetSymbols();
    },
    onPullDownRefresh: function() {
        this.apiGetSymbols();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
        }, 500);
    },
    apiGetSymbols(): void {
        fly.get('/release/symbols').then((res: any) => {
            this.setData({symbols: res.symbols});
            wx.setStorage({key: StorageKey.UserSymbols, data: res.symbols, success: () => {}});
        }).catch(this.apiError);
    },
    goScan(): void {
        scanQStore.setFromPage(PageURL.PSymbol);
        scanQStore.scanCode();
    },
    apiError(e: any): void {
        fly_catch(e);
    }
});
