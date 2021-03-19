import { fly, fly_catch } from '../../../../cores/http';
import { userStore } from '../../../../store/user';

Page({
    data: {
        bio: '',
        autosize: {minHeight: 50, maxHeight: 80},
    },
    onLoad: function() {

    },
    onShow(): void {
        this.setData({
            bio: `${userStore.appUser?.bio}`,
        });
    },
    onChange(e: any) {
        this.setData({bio: e.detail});
    },
    submit() {
        this.apiSetbio();
    },
    apiSetbio(): void {
        fly.post('/account/profile/bio', {
            bio: this.data.bio,
        }).then((res: any) => {
            userStore.upAppUser(res.user);
            wx.navigateBack({delta: 1, success: () => {}});
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        fly_catch(e);
    },
});
