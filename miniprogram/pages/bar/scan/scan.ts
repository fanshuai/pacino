import { LoadingMsg } from '../../../cores/const';
import { scanQStore } from '../../../store/scanq';


Page({
    data: {
        LoadingMsg: LoadingMsg,
    },
    onLoad: function() {

    },
    onShow: function() {
        scanQStore.scanCode();
    },
});
