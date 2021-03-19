// @ts-ignore
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { fly, fly_catch } from '../../../../cores/http';
import { constStore } from '../../../../store/const';
import { userStore } from '../../../../store/user';

Page({
    data: {
        gender: '',
        genders: [],
    },
    onLoad: function() {
        // @ts-ignore
        this.storeBindings = createStoreBindings(this, {
            store: null,
            fields: {
                genders: () => constStore.genders,
            },
            actions: [],
        });
        constStore.apiFetch();
    },
    onUnload: function() {
        // @ts-ignore  // 页面销毁时执行
        this.storeBindings.destroyStoreBindings();
    },
    onShow(): void {
        this.setData({gender: `${userStore.appUser?.gender}`});
    },
    onClick(e: any) {
        const {gender} = e.currentTarget.dataset;
        if (gender !== this.data.gender) {
            this.setData({gender: gender});
            this.apiSetGender(gender);
        }
    },
    apiSetGender(gender: string): void {
        fly.post('/account/profile', {
            gender: gender,
        }).then((res: any) => {
            userStore.upAppUser(res.user);
            wx.navigateBack({delta: 1, success: () => {}});
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        fly_catch(e);
    },
});
