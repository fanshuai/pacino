import { configure, observable, action, computed } from 'mobx-miniprogram';

// 不允许在动作外部修改状态
configure({enforceActions: true});


class TimerStore {

    interval?: number;
    @observable _count: number;

    constructor () {
        this._count = 0;
    }

    @computed get count(): number {
        return this._count;
    }

    @action.bound reset(val: number): void {
        this.clear();
        this._count = val;
        this.interval = setInterval(this.reduce, 1000);
    }

    @action.bound reduce() {
        this._count -= 1;
        if (this._count == 0) {
            this.clear();
        }
    }

    @action.bound clear() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this._count = 0;
    }
}

export const timerStore = new TimerStore();

