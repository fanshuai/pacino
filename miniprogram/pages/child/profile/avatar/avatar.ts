import { when } from 'mobx-miniprogram';
import Toast from '@vant/weapp/toast/toast';
import { ImageUploadStore } from '../../../../store/image';
import { fly, fly_catch } from '../../../../cores/http';
import { userStore } from '../../../../store/user';

Page({
    data: {
        ext: '',
        avatar: '',
        loading: false,
        imgUrl: '',
    },
    onShow(): void {
        this.setData({
            avatar: userStore.appUser?.avatar,
        });
    },
    afterRead(e: any) {
        const {file} = e.detail;
        Toast.loading({
            duration: 0,
            message: '上传中...',
            forbidClick: true,
            loadingType: 'spinner',
        });
        this.setData({loading: true});
        const imgUp = new ImageUploadStore(file.path, '_tmpfe');
        const clearFailure = when(() => imgUp.failure, () => {
            Toast.fail(imgUp.crashMsg || '更新失败');
            this.setData({loading: false});
            clearSuccess();
        });
        const clearSuccess = when(() => imgUp.success, () => {
            this.apiSetAvatar(imgUp.ossToken?.key || '');
            clearFailure();
        });
        imgUp.upload();
    },
    apiSetAvatar(key: string): void {
        fly.post('/account/profile', {
            avatar: key,
        }).then((res: any) => {
            Toast.success('已更新');
            userStore.upAppUser(res.user);
            this.setData({loading: false, avatar: userStore.appUser?.avatar});
        }).catch(this.apiError);
    },
    apiError(e: any): void {
        this.setData({loading: false});
        Toast.fail('更新失败');
        fly_catch(e);
    },
});
