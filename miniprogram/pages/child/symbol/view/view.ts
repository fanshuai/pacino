import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
import { PageURL } from '../../../../cores/const';
import { fly, fly_catch } from '../../../../cores/http';
import { scanQStore } from '../../../../store/scanq';
import { phoneStore } from '../../../../store/phone';

const openActions = [
    {
        name: '关闭',
        color: '#F49000',
        action: 'status',
    },
    {
        name: '永久删除',
        color: '#E64349',
        action: 'delete',
    }
];

const closeActions = [
    {
        name: '开启',
        color: '#09BB07',
        action: 'status',
    },
    {
        name: '永久删除',
        color: '#E64349',
        action: 'delete',
    }
];

Page({
    data: {
        title: '',
        symbol: '',
        show: false,
        info: {
            open: true,
            views: 0,
            title: '',
            scened: '',
            selfdom: '',
            qrurl: '',
        },
        actions: openActions,
        pages: PageURL,
    },
    onLoad: function (options: any) {
        this.setData({symbol: options.symbol});
        wx.setNavigationBarTitle({title: options.title || '', success: () => {}});
    },
    onShow: function() {
        this.apiGetSymbol();
    },
    onPullDownRefresh: function() {
        this.apiGetSymbol();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
        }, 500);
    },
    setDetail(data: any): void {
        this.setData({info: data});
        const title = data.title || data.scened;
        wx.setNavigationBarTitle({title: title, success: () => {}});
    },
    openAction(): void {
        const actions = this.data.info.open ? openActions : closeActions;
        this.setData({actions: actions, show: true});
    },
    closeAction() {
        this.setData({show: false});
    },
    selectAction(e: any) {
        if (e.detail.action === 'status') {
            this.upStatus();
        } else if (e.detail.action === 'delete') {
            this.goUnbind();
        }
    },
    upStatus() {
        if (this.data.info.open) {
            const scened = this.data.info.scened;
            Dialog.confirm({
                title: `是否关闭当前${scened}？`,
                message: `关闭后${scened}信息仍保留，\n但他人将无法通过当前场景码查找到我。`,
                confirmButtonText: '确认关闭',
            }).then(() => {
                this.apiSymbolStatus();
            }).catch(() => {});
        } else {
            this.apiSymbolStatus();
        }
    },
    apiGetSymbol(): void {
        fly.get(`/release/symbol/${this.data.symbol}`).then((res: any) => {
            this.setDetail(res);
        }).catch(this.apiError);
    },
    apiSymbolStatus(): void {
        this.closeAction();
        const status = this.data.info.open ? 'close' : 'open';
        fly.post(`/release/symbol/${this.data.symbol}/${status}`).then((res: any) => {
            if (res.open) Toast.success('已开启');
            this.setDetail(res);
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        fly_catch(e);
    },
    goReview(): void {
        scanQStore.setQ(this.data.info.qrurl);
        wx.navigateTo({url: PageURL.PReview, success: () => {}});
    },
    goTitle(): void {
        const title = encodeURIComponent(this.data.info.title);
        const url = `${PageURL.PSymbolTitle}?symbol=${this.data.symbol}&title=${title}`;
        wx.navigateTo({url: url, success: () => {}});
    },
    goSelfdom(): void {
        const selfdom = encodeURIComponent(this.data.info.selfdom);
        const url = `${PageURL.PSymbolSelfdom}?symbol=${this.data.symbol}&selfdom=${selfdom}`;
        wx.navigateTo({url: url, success: () => {}});
    },
    goUnbind(): any {
        this.closeAction();
        if (!phoneStore.mainShow) return Toast('需短信验证请先添加手机号');
        wx.navigateTo({url: `${PageURL.PSymbolStrike}?symbol=${this.data.symbol}`, success: () => {}});
    }
});
