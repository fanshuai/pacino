import { userStore } from './store/user';

// @ts-ignore
App<IAppOption>({
    globalData: {},
    onLaunch(options: WechatMiniprogram.App.LaunchShowOption): void {
        console.log(`app.onLaunch scene: ${options.scene} shareTicket: ${options.shareTicket}`);
        userStore.wxCodeLogin();
        this.loadFont();
    },
    loadFont(): void {
        const sourceUrl = 'https://daowo-oss.ifand.com/fonts/RobotoMono-VariableFont_wght.ttf';
        wx.loadFontFace({
            global: true,
            family: 'RobotoMono',
            source: `url("${sourceUrl}")`,
            success: console.info,
            fail: console.warn,
        });
    }
});
