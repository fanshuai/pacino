const accountInfo = wx.getAccountInfoSync().miniProgram;
export const envVersion = accountInfo.envVersion;

interface AppCfgInterface {
    Debug: boolean;
    ApiHost: string;
    AgoraAppId: string;
}

export const getAppCfg = (): AppCfgInterface => {
    let appCfg: AppCfgInterface = {
        Debug: false,
        ApiHost: 'https://ApiHost',
        AgoraAppId: 'AgoraAppId...',
    }
    if (envVersion === 'develop') {
        // // const apiHost = 'http://10.0.0.4:5566';
        // const apiHost = 'http://10.0.12.99:5566';
        // appCfg = {
        //     Debug: true,
        //     ApiHost: apiHost,
        //     AgoraAppId: 'AgoraAppId...',
        // }
    }
    return appCfg;
};


export const AppCfg: AppCfgInterface = getAppCfg();

export const LoadingMsg: string = 'The answer is blowin\' in the wind...';
export const ShareTimelineMsg: string = '扫码联系物主，便捷高效、保护隐私、安全可控 ~';

export enum AppInfo {
    Name = '道我',
    AppID = 'mpa-pacino',
    Version = '2020.1114',
    IcpB = 'IcpB...',
    PagePrivacy = 'https://PagePrivacy',
    PageTerms = 'https://PageTerms',
}
// 微信小商店配置信息
export enum MPAStoreInfo {
    AppId = 'AppId...',
    PathProductDetail = 'PathProductDetail...'
}

export enum StorageKey {
    UserSymbols = 'user-symbols',
}

export enum PageURL {
    PBarEver = '/pages/bar/ever/ever',  // 标签栏: 最近
    PBarScan = '/pages/bar/scan/scan',  // 标签栏: 扫码
    PBarMine = '/pages/bar/mine/mine',  // 标签栏: 我的
    PReview = '/pages/review/review',  // 扫码结果
    PDialog = '/pages/child/dialog/dialog',  // 最近 > 对话
    PDialogMsg = '/pages/child/dialog/touch/msg/msg',  // 最近 > 对话 > 留言
    PDialogCall = '/pages/child/dialog/touch/call/call',  // 最近 > 对话 > 双呼通话
    PDialogOther = '/pages/child/dialog/other/other',  // 最近 > 对话 > 对方信息
    PDialogRemark = '/pages/child/dialog/remark/remark',  // 最近 > 对话 > 备注
    PDialogReport = '/pages/child/dialog/report/report',  // 最近 > 对话 > 举报
    PSymbol = '/pages/child/symbol/symbol',  // 我的 > 场景码
    PSymbolView = '/pages/child/symbol/view/view',  // 我的 > 场景码 > 详情
    PSymbolTitle = '/pages/child/symbol/title/title',  // 我的 > 场景码 > 别名
    PSymbolSelfdom = '/pages/child/symbol/selfdom/selfdom',  // 我的 > 场景码 > 自定义签名
    PSymbolStrike = '/pages/child/symbol/strike/strike',  // 我的 > 场景码 > 删除
    PProfile = '/pages/child/profile/profile',  // 我的 > 个人信息
    PProfileBio = '/pages/child/profile/bio/bio',  // 我的 > 个人信息 > 个性签名
    PProfileName = '/pages/child/profile/name/name',  // 我的 > 个人信息 > 名字
    PProfileQRUser = '/pages/child/profile/qruser/qruser',  // 我的 > 个人信息 > 用户码
    PProfileGender = '/pages/child/profile/gender/gender',  // 我的 > 个人信息 > 性别
    PProfileAvatar = '/pages/child/profile/avatar/avatar',  // 我的 > 个人信息 > 头像
    PPhones = '/pages/child/phones/phones',  // 我的 > 手机号
    PPhonesAdd = '/pages/child/phones/add/add',  // 我的 > 手机号 > 添加
    PPhonesUnbind = '/pages/child/phones/unbind/unbind',  // 我的 > 手机号 > 解除绑定
    PSetting = '/pages/child/setting/setting',  // 我的 > 设置
    PSettingAbout = '/pages/child/setting/about/about',  // 我的 > 设置 > 关于
    PSettingDevice = '/pages/child/setting/device/device',  // 我的 > 设置 > 登录设备
    PSettingPrivacy = '/pages/child/setting/privacy/privacy',  // 我的 > 设置 > 隐私权政策
    PSettingTerms = '/pages/child/setting/terms/terms',  // 我的 > 设置 > 服务协议
}
