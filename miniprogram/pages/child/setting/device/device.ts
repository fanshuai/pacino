import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
import { PageURL } from '../../../../cores/const';
import { fly, fly_catch } from '../../../../cores/http';
import { userStore } from '../../../../store/user';

Page({
    data: {
        devices: [],
    },
    onLoad: function() {

    },
    onShow(): void {
        this.apiGetDevices();
    },
    onPullDownRefresh: function() {
        this.apiGetDevices();
        setTimeout(() => {
            wx.stopPullDownRefresh({success: () => {}});
        }, 500);
    },
    logoutDevice(e: any): void {
        const {tid} = e.currentTarget.dataset;
        Dialog.confirm({
            message: '确认注销该设备登录？',
            confirmButtonText: '确认注销',
        }).then(() => {
            this.apiDeviceLogout(tid);
        }).catch(() => {});
    },
    apiGetDevices(): void {
        fly.get('/account/devices').then((res: any) => {
            this.setData({devices: res.devices});
        }).catch(fly_catch);
    },
    apiDeviceLogout(tid: string): void {
        fly.post('/account/device/logout', {
            tid: tid
        }).then((res: any) => {
            this.setData({devices: res.devices});
            userStore.apiGetProfile();
            Toast.success('已注销');
        }).catch(fly_catch);
    },
    logout(): void {
        Dialog.confirm({
            message: '确认退出登录当前设备？',
            confirmButtonText: '确认退出',
        }).then(() => {
            fly.get('/account/logout').then(() => {
                this.userStoreLogout();
            }).catch((e: any) => {
                this.userStoreLogout();
                fly_catch(e);
            });
        }).catch(() => {});
    },
    userStoreLogout(): void {
        userStore.logout();
        wx.reLaunch({url: PageURL.PBarEver, success: () => {}});
    }
});
