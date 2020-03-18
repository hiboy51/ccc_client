/*
 * Filename: /Users/kinnon.zhang/SY01/assets/common/scripts/StateMachine.ts
 * Path: /Users/kinnon.zhang/SY01
 * Created Date: Monday, May 27th 2019, 5:02:44 pm
 * Author: kinnon.zhang
 * 
 * Copyright (c) 2019 Your Company
 */
const {ccclass, property} = cc._decorator;

export interface MACHINE_STATE_CHANGE_CALLBACK {
    (b: boolean):void;
}

export interface MachineState {
    /**
     * 进入该状态时触发
     * @param pre 前一个状态
     */
    onEnterState(pre: MachineState): void;
    /**
     * 当前状态退出时触发
     * @param next 下一个状态
     * @param succ 当前状态结束清理后调用
     */
    onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void;

    /**
     * 判断相等
     */
    equal?(another: MachineState): boolean;
}

@ccclass
export default class StateMachine extends cc.Component {
    protected _curState: MachineState = null;
    get curState() {
        return this._curState;
    }
    set curState(state: MachineState) {
        this._curState = state;
    }

    /** final */
    public changeState(st: MachineState) {
        if (!this._canChangeState(st)) {
            return;
        }

        if (this.curState) {
            this.curState.onExitState(st, succ => {
                if (succ) {
                    let stPre = this.curState;
                    this.curState = st;
                    st && st.onEnterState(stPre);
                }
            });
        }
        else {
            this.curState = st;
            st && st.onEnterState(null);
        }
    }

    private _canChangeState(st: MachineState) {
        if (!this.curState) {
            return true;
        }

        let equal = this.curState.equal;
        if (equal) {
            return !this.curState.equal(st);
        }
        return !this._defaultEqual(this.curState, st);
    }

    private _defaultEqual(thiz: MachineState, that: MachineState) {
        return thiz == that;
    }
}