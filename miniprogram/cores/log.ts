const rtlog = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null;

export const logger = {
  info(...args: any[]) {
    if (!rtlog) return;
    console.info(...args);
    rtlog.info.apply(rtlog, args);
  },
  warn(...args: any[]) {
    if (!rtlog) return;
    console.warn(...args);
    rtlog.warn.apply(rtlog, args);
  },
  error(...args: any[]) {
    if (!rtlog) return;
    rtlog.error.apply(rtlog, args);
  },
  setFilterMsg(msg: string) { // 从基础库2.7.3开始支持
    if (!rtlog || !rtlog.setFilterMsg) return;
    rtlog.setFilterMsg(msg);
  },
  addFilterMsg(msg: string) { // 从基础库2.8.1开始支持
    if (!rtlog || !rtlog.addFilterMsg) return;
    rtlog.addFilterMsg(msg);
  }
};
