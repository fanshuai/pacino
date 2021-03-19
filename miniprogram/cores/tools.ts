import Toast from '@vant/weapp/toast/toast';
import { MPAStoreInfo } from './const';
import { logger } from './log';


function saveImageToAlbum(imgSrc: string): void {
    if (!imgSrc) return;
    Toast.loading({
        duration: 0,
        message: '保存中...',
        loadingType: 'spinner',
    });
    wx.vibrateShort({success: () => {}});
    wx.downloadFile({
        url: imgSrc,
        success: (res: any) => {
            wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => Toast.success('已保存'),
                fail: () => Toast.fail('未授权相册'),
            });
        },
        fail: () => wx.nextTick(() => Toast.clear()),
    })
}

function goMPAStore(spuid: string = '') {
    const path = spuid ? `${MPAStoreInfo.PathProductDetail}${spuid}` : '';
    wx.navigateToMiniProgram({
        appId: MPAStoreInfo.AppId, path: path,
        success: () => console.info('goMPAStore:success', spuid),
        fail: (e: any) => logger.warn('goMPAStore:fail', spuid, e),
    });
}

function currentPage(): string {
    const pages = getCurrentPages();
    if (pages.length === 0) return''
    return pages[pages.length - 1].route;
}


export const tools = {
    saveImageToAlbum: saveImageToAlbum,
    currentPage: currentPage,
    goMPAStore: goMPAStore,
};
