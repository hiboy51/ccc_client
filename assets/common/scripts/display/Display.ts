import SYEventManager from "../SYEventManager";
import { CustomEventDefine } from "../ProjectEvents/CustomEventDefine";
import { NetStateEnum } from "../net/NetState";

const { ccclass, property } = cc._decorator;

/**
 * Created by Kinnon.Zhang on 2017/7/25.
 * 抽象概念：“展示”
 *  一个“展示”可以根据自身注册的开关来决定拉取感兴趣的数据并更新自身视图
 *
 *  ##
 *  最佳实践：
 *      1.尽量避免在长动画中激活Display的刷新机制，可以灵活复写isDirty方法或
 *        设置阻断yield来控制刷新频率
 *      2.注意在_onNetworkDisconnected方法中处理断网情况，通常需要停掉正在播
 *        放的动画
 *      3.reset中初始化视图不是必须的，某些情况下需要保证节点上动画不被刷新机
 *        制打断，则避免在reset中重置节点
 *      ...
 *
 *      想到在写
 *
 *  ##
 */
@ccclass
export default class Display extends cc.Component {
    private static _switches = {};
    private static _switchesShare = {};

    /** 持有共享信号的Display将分别被自动赋以一个唯一标识 */
    private _realSwitch: string = null;

    private _savedDisconnectCb: Function = null;

    private _yield: boolean = false;
    /** 显式阻断刷新 */
    set yield(y: boolean) {
        this._yield = y;
    }
    get yield() {
        return this._yield;
    }

    // ======================================================================================================
    // static interfaces
    // ======================================================================================================

    /** 清除所有信号 */
    public static clearAll() {
        Display._switches = {};
        Display._switchesShare = {};
    }

    /** 打开所有信号 */
    public static turnOnAll() {
        for (let k in Display._switches) {
            Display._switches[k] = true;
        }

        for (let k in Display._switchesShare) {
            (Display._switchesShare[k] as Array<{ name: string; status: boolean }>).forEach(
                each => {
                    each.status = true;
                }
            );
        }
    }

    /**
     * 判断信号开启情况
     * @param switchKey 信号id
     */
    public static isSwitchOnByKey(switchKey: string): boolean {
        let tmp = Display._switches[switchKey];
        if (tmp !== undefined) {
            return tmp;
        }

        tmp = Display._switchesShare[switchKey];
        if (Array.isArray(tmp)) {
            return (tmp as Array<{ status: boolean; display: Display }>)
                .filter(each => each.display.enabled)
                .every(each => each.status);
        }
        return false;
    }

    /**
     * 打开某一信号
     * @param switchKey 信号id
     */
    public static turnOn(switchKey: string, realKey?: string) {
        let tmp = Display._switches[switchKey];
        if (typeof tmp == "boolean") {
            Display._switches[switchKey] = true;
            cc.log(`single signal turned on: ${switchKey}`);
            return;
        }

        tmp = Display._switchesShare[switchKey];
        if (Array.isArray(tmp)) {
            cc.log(`shared signal turned on: ${switchKey}`);
            for (let each of tmp as Array<{ status: boolean; name: string }>) {
                if (!realKey) {
                    each.status = true;
                } else if (realKey == each.name) {
                    each.status = true;
                }
            }
        }
    }

    /**
     * 关闭某一信号
     * @param switchKey 信号id
     * @param realKey 共享信号的Display所持有的唯一标识
     */
    public static turnOff(switchKey: string, realKey?: string) {
        if (!switchKey) {
            return;
        }

        let tmp = Display._switches[switchKey];
        if (typeof tmp == "boolean") {
            Display._switches[switchKey] = false;
            return;
        }

        if (!realKey) {
            return;
        }
        tmp = Display._switchesShare[switchKey];
        if (Array.isArray(tmp)) {
            for (let each of tmp as Array<{ name: string; status: boolean }>) {
                if (each.name == realKey) {
                    each.status = false;
                }
            }
        }
    }

    // ======================================================================================================
    // virtual interfaces
    // ======================================================================================================

    /**
     * virtual
     * 可以通过灵活覆写该方法来控制界面的刷新时机
     */
    protected _isDirty() {
        return !this.yield && this._isSwitchOn();
    }

    /**
     * virtual
     * 必须覆写
     * 本Display注册的信号Id
     */
    protected _getSwitchKey(): string {
        cc.warn(true, "invalid switch key");
        return null;
    }

    /**
     * virtual
     * 可用于在刷新界面前做一些清理工作
     */
    protected _reset() {}

    /**
     * virtual
     * 可用于实现主要的界面刷新逻辑
     * 通常用于展示静态的界面状态
     */
    protected _refreshView() {}

    /**
     * virtual
     * 是否监听共享信号
     * 共享相同信号的Display会被视为一组
     * 组内所有成员都执行更新后才会关闭信号
     */
    protected _sharedSignal(): boolean {
        return false;
    }

    /**
     * virtual
     * 用于处理断网事件
     */
    protected _onNetworkDisconnected(prestate: NetStateEnum) {
        if (!this.enabled) {
            return;
        }
        let switchKey = this._getSwitchKey();
        cc.log(
            `Disconnected Listener by Key ${
                this._sharedSignal ? this._realSwitch : switchKey
            } worked`
        );
    }

    // ======================================================================================================
    // final interfaces
    // ======================================================================================================

    /** final */
    private _onTick() {
        if (!this._isDirty()) {
            return;
        }

        this._reset();
        this._refreshView();

        let switchKey = this._getSwitchKey();
        Display.turnOff(switchKey, this._realSwitch);
        cc.log(`Display updated by Key: ${switchKey} | ${this._realSwitch || ""}`);
    }

    /** final */
    private _registerSwitchKey(explicitOn: boolean = false) {
        let switchKey = this._getSwitchKey();
        let shared = this._sharedSignal();
        if (!shared) {
            Display._switches[switchKey] = explicitOn;
            return;
        }

        this._realSwitch = this._realSwitch || this._genUUID();
        Display._switchesShare[switchKey] = Display._switchesShare[switchKey] || [];
        let sharedList = Display._switchesShare[switchKey] as Array<{
            name: string;
            status: boolean;
            display: Display;
        }>;
        if (sharedList.every(each => each.name != this._realSwitch)) {
            sharedList.push({ name: this._realSwitch, status: explicitOn, display: this });
        }
    }

    /** final */
    private _unregisterSwitchKey() {
        let switchKey = this._getSwitchKey();
        let shared = this._sharedSignal();
        if (shared) {
            let sharedList = Display._switchesShare[switchKey] as Array<{ name: string }>;
            for (let i = sharedList.length - 1; i >= 0; --i) {
                let each = sharedList[i];
                if (each.name == this._realSwitch) {
                    sharedList.splice(i, 1);
                    cc.log(`Unregister shared key: ${switchKey} | ${this._realSwitch}`);
                }
            }
        } else {
            delete Display._switches[switchKey];
        }
    }

    /** final */
    private _isSwitchOn(): boolean {
        let signal = this._getSwitchKey();
        if (!signal) {
            return false;
        }

        let shared = this._sharedSignal();
        // 如果监听的是独立信号
        if (!shared) {
            return Display._switches[signal] || false;
        }

        // 如果监听的是共享信号
        if (!this._realSwitch) {
            return false;
        }
        let list = Display._switchesShare[signal];
        if (!list || !Array.isArray(list)) {
            return false;
        }
        for (let v of list as Array<{ name: string; status: boolean }>) {
            if (v.name == this._realSwitch) {
                return v.status;
            }
        }
        return false;
    }

    /** final */
    private _genUUID(): string {
        let s = [];
        let hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        let uuid = s.join("");
        return uuid;
    }

    // ====================================================================================
    // public interfaces
    // ====================================================================================
    public turnOnMySwitch() {
        let mySwitch = this._getSwitchKey();
        if (this._sharedSignal()) {
            Display.turnOn(mySwitch, this._realSwitch);
        } else {
            Display.turnOn(mySwitch);
        }
    }

    // ======================================================================================================
    // life cycle
    // ======================================================================================================

    onLoad() {
        // 监听断网
        this._savedDisconnectCb = SYEventManager.Instance.getEventTarget().on(
            CustomEventDefine.CE_NETWORK_CLOSED,
            this._onNetworkDisconnected,
            this
        );
        this._registerSwitchKey();
    }

    onDestroy() {
        this.unschedule(this._onTick);
        SYEventManager.Instance.getEventTarget().off(
            CustomEventDefine.CE_NETWORK_CLOSED,
            this._savedDisconnectCb,
            this
        );
        this._unregisterSwitchKey();
    }

    start() {
        this.schedule(this._onTick, 0);
    }

    onEnable() {
        this.turnOnMySwitch();
        // 界面唤醒时立即执行一次，避免界面刷新有一帧的延迟
        this._onTick();
    }
}
