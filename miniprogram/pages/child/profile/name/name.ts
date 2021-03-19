import { fly, fly_catch } from '../../../../cores/http';
import { userStore } from '../../../../store/user';

Page({
    data: {
        name: '',
    },
    onLoad: function() {

    },
    onShow(): void {
        this.setData({
            name: `${userStore.appUser?.name}`,
        });
    },
    onChange(e: any) {
        this.setData({name: e.detail});
    },
    submit() {
        this.apiSetName();
    },
    apiSetName(): void {
        fly.post('/account/profile', {
            name: this.data.name,
        }).then((res: any) => {
            userStore.upAppUser(res.user);
            wx.navigateBack({delta: 1, success: () => {}});
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        fly_catch(e);
    },
});
