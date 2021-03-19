import { configure, observable, action, computed, when } from 'mobx-miniprogram';
import { fly, fly_catch } from '../cores/http';

// 不允许在动作外部修改状态
configure({enforceActions: true});

interface OSSToken {
    url: string,
    key: string,
    host: string,
    name: string,
    akid: string,
    policy: string,
    signature: string,
}

export class ImageUploadStore {
    readonly img: string;  // 本地图片地址
    private scene: string;  // 场景，OSS目录
    @observable cimg: string = '';
    @observable ossToken?: OSSToken;
    @observable progress: number = 0;
    crashMsg: string = '';
    upimg: string = '';

    constructor (img: string, scene: string) {
        this.img = img;
        this.scene = scene;
        when(() => {
            return this.uploadReady;
        }, () => {
            this.uploadFile();
        });
    }

    upload() {
        this.apiOSSToken();
        this.compressImage();
    }

    get ext(): string {
        const _ext = this.img.split('.').pop();
        return _ext ? _ext.toLowerCase() : '';
    }

    @computed get failure(): boolean {
        return this.progress == -1;
    }

    @computed get success(): boolean {
        return this.progress == 100;
    }

    @computed get uploadReady(): boolean {
        return Boolean(this.cimg && this.ossToken);
    }

    @action.bound crashFail(msg: string) {
        this.progress = -1;
        this.crashMsg = msg;
    }

    // 获取OSS上传Token，进度+25
    @action apiOSSToken(): void {
        fly.post('/outside/oss-token', {
            ext: this.ext, scene: this.scene
        }).then(this.apiOSSTokenSuccess).catch(this.apiOSSTokenFail)
    }
    @action.bound apiOSSTokenSuccess(res: any) {
        this.ossToken = res;
        this.progress += 25;
    }
    @action.bound apiOSSTokenFail(e: any) {
        this.crashFail('获取Token失败');
        fly_catch(e);
    }
    // 压缩图片，进度+25
    @action compressImage() {
        wx.compressImage({
            src: this.img, quality: 80,
            success: this.compressImageSuccess,
            fail: this.compressImageFail,
        });
    }
    @action.bound compressImageSuccess(res: any) {
        this.cimg = res.tempFilePath;
        this.progress += 25;
    }

    @action.bound compressImageFail(e: any): void {
        console.log(`compressImageFail: ${e}`);
        this.crashFail('图片压缩失败');
    }
    // 图片上传，进度+25
    @action uploadFile(): void {
        if (!this.ossToken) {
            this.crashFail('无发获取Token信息');
            return;
        }
        wx.uploadFile({
            url: this.ossToken.host,
            filePath: this.cimg,
            name: 'file',
            formData: {
                name: this.ossToken.name,
                key: this.ossToken.key,
                policy: this.ossToken.policy,
                OSSAccessKeyId: this.ossToken.akid,
                signature: this.ossToken.signature,
                success_action_status: '200',
            },
            success: this.uploadFileSuccess,
            fail: this.uploadFileFail,
        });
    }
    @action.bound uploadFileSuccess(): void {
        this.upimg = this.ossToken?.url || '';
        this.progress = 100;
        this.crashMsg = '';
    }
    @action.bound uploadFileFail(e: any): void {
        console.log(`uploadFileFail: ${e}`);
        this.crashFail('上传失败');
    }
}
