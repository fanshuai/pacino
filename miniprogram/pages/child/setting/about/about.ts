import { AppInfo, PageURL } from '../../../../cores/const';

Page({
    data: {
        hasUpdate: false,
        updateReady: false,
        appInfo: AppInfo,
        pages: PageURL,
        year: new Date().getFullYear(),
    },
});
