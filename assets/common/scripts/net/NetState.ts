import { MachineState, MACHINE_STATE_CHANGE_CALLBACK } from "../state_machine/StateMachine";

import NetStateMachine from "./NetStateMachine";

import Net from "./Net";

import SYEventManager from "../SYEventManager";

import { CustomEventDefine } from "../ProjectEvents/CustomEventDefine";

import { ServeInEventDefine } from "../ProjectEvents/ServeInEventDefine";

import { GlobalDataCenter } from "../GlobalDataCenter";

import { ServeOutEventDefine } from "../ProjectEvents/ServeOutEventDefine";
import { getRoundtrip } from "../ProtocolConfig";

/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/net/NetState.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Monday, July 1st 2019, 11:40:18 am
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */

export enum NetStateEnum {
    Connecting,
    Connected,
    Closing,
    Closed,
    Redirecting,
    Reconnect
}

export class NetState implements MachineState {
    public state: NetStateEnum = NetStateEnum.Connecting;
    protected machine: NetStateMachine;
    constructor(mc: NetStateMachine) {
        this.machine = mc;
    }

    // ====================================================================================
    // implementations
    // ====================================================================================
    public onEnterState(pre: MachineState): void {}

    public onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        succ(true);
    }
}

// ====================================================================================
// Net states Connecting
// ====================================================================================

export class NetStateConnecting extends NetState {
    private _complete: boolean = false;
    private _url: string;
    private _port: number;
    private _sc_time: number;
    private _ec_time: number;
    constructor(machine: NetStateMachine, url: string) {
        super(machine);
        this.state = NetStateEnum.Connecting;
        this._url = url;
    }

    public onEnterState(pre: MachineState): void {
        cc.log(`start connecting to ${this._url}`);
        let net = (this.machine.net = new Net(undefined, this._url, this._port));
        net.openFunc = this.onNetOpen.bind(this);
        net.errorFunc = this.onNetError.bind(this);
        net.connect();
        this._sc_time = new Date().getTime();
        SYEventManager.Instance.getEventTarget().emit(
            CustomEventDefine.CE_NETWORK_CONNECTING,
            net.Url
        );
    }

    public onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        if (this._complete) {
            let net = this.machine.net;
            net.openFunc = null;
            net.errorFunc = null;
        }
        succ(this._complete);
    }

    private onNetOpen(key: string) {
        this._ec_time = new Date().getTime();
        cc.log(`Successfully connected to ${this._url}`);
        cc.log(`Current connecting cost time: ${this._ec_time - this._sc_time}`);
        this._complete = true;
        this.machine.changeState(new NetStateConnected(this.machine));
    }

    private onNetError(key: string) {
        cc.log(`Connecting to ${this._url} failed`);
        this._complete = true;
        this.machine.changeState(new NetStateReconnect(this.machine));
    }
}

// ====================================================================================
// Net state Connected
// ====================================================================================

export class NetStateConnected extends NetState {
    private _heartBeatInterval: number = NaN;
    private _updateTokenInterval: number = NaN;
    private _networkTimeout: boolean = false;
    constructor(machine: NetStateMachine) {
        super(machine);
        this.state = NetStateEnum.Connected;
    }

    public sendMsg(code: string, msg: any) {
        let msgObj = msg;
        if (typeof msg === "string") {
            msgObj = JSON.parse(msg);
        }
        this.machine.net.send(code, msgObj);
        cc.log(`send server ${code}: ${JSON.stringify(msgObj, null, "\t")}`);
    }

    public onEnterState(pre: MachineState): void {
        let net = this.machine.net;
        net.msgFunc = this._onNetMessage.bind(this);
        net.errorFunc = this._onNetError.bind(this);
        net.closeFunc = this._onNetClosed.bind(this);

        SYEventManager.Instance.getEventTarget().emit(
            CustomEventDefine.CE_NETWORK_OPEN,
            (pre as NetState).state,
            net.Url
        );
    }

    public onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        let net = this.machine.net;
        net.msgFunc = null;
        net.errorFunc = null;
        net.closeFunc = null;
        this._stopHeartbeat();
        this._stopUpdateToken();
        succ(true);
    }

    private _onNetClosed(key: string) {
        let { Url } = this.machine.net;
        cc.log(`Network has been closed <== ${Url}`);
        this.machine.changeState(new NetStateClosed(this.machine));
    }

    private _onNetError(key: string) {
        let { Url } = this.machine.net;
        cc.log(`Network error ocurrs <== ${Url}`);
        SYEventManager.Instance.getEventTarget().emit(CustomEventDefine.CE_NETWORK_ERROR, Url);
        this.machine.changeState(new NetStateReconnect(this.machine));
    }

    private _onNetMessage(key: string, code: string, msg: any, sn: number) {
        cc.log(`receive server msg ${code}: ${JSON.stringify(msg, null, "\t")}`);
        if (msg.code === undefined) {
            let paired = getRoundtrip(code);
            if (paired) {
                let { resolve } = this.machine.ejectFetch(paired);
                resolve && resolve(msg);
            }
            // server push
            SYEventManager.Instance.getEventTarget().emit(code, msg);
        } else {
            //process error
            let { resolve, reject } = this.machine.ejectFetch(sn);
            if (msg.code != 0) {
                // msg.msg : message error
                reject && reject(msg.msg);
                SYEventManager.Instance.getEventTarget().emit(
                    CustomEventDefine.CE_SERVER_ERROR,
                    msg,
                    code
                );
            } else {
                //first : deal with global function
                this._preprocess(code, msg);
                //seconde : notice to logic
                resolve && resolve(msg.content);
                SYEventManager.Instance.getEventTarget().emit(code, msg.content);
            }
        }
    }

    private _preprocess(code: string, msg: any) {
        if (code === ServeInEventDefine.SEI_HALL_AUTHOR) {
            GlobalDataCenter.Instance.userToken = msg.content.token;
            GlobalDataCenter.Instance.nodeId = msg.content.nodeId;
            GlobalDataCenter.Instance.playerId = msg.content.playerId;
            GlobalDataCenter.Instance.playerName = msg.content.name;
            GlobalDataCenter.Instance.playerIcon = msg.content.icon;
            GlobalDataCenter.Instance.redirect = msg.content.redirect;
            cc.log(`Hall author ==> nodeId = ${GlobalDataCenter.Instance.nodeId}`);
            //start heart bit, 1min
            this._startHeartbeat();
            //start update token, 10min
            this._startUpdateToken();
            this._redirectServerIfNecessary();
        } else if (code === ServeInEventDefine.SEI_HALL_UPDATETOKEN) {
            GlobalDataCenter.Instance.userToken = msg.content.token;
        } else if (code === ServeInEventDefine.SEI_HALL_GETHALLDATA) {
            GlobalDataCenter.Instance.coin = msg.content.coin / GlobalDataCenter.COIN_EXCHANGE;
            GlobalDataCenter.Instance.diamond = msg.content.diamond;
            GlobalDataCenter.Instance.horn = msg.content.horn;
            GlobalDataCenter.Instance.rankMetaData = msg.content.rankMetaDataVO;
            GlobalDataCenter.Instance.coinInSavebox =
                msg.content.safeValue / GlobalDataCenter.COIN_EXCHANGE;
            // GlobalDataCenter.Instance.playerName = msg.content.name;
            // GlobalDataCenter.Instance.playerIcon = msg.content.icon;
        } else if (code === ServeInEventDefine.SEI_HEART) {
            this._networkTimeout = false;
        } else if (code === ServeInEventDefine.SEI_HALL_MATCHGAME) {
            GlobalDataCenter.Instance.currentGameType = msg.content.gameType;
            GlobalDataCenter.Instance.currentRoomId = msg.content.roomId;
            GlobalDataCenter.Instance.redirect = msg.content.redirect;
            GlobalDataCenter.Instance.currentField = msg.content.field;
            this._redirectServerIfNecessary();
        } else if (code === ServeInEventDefine.SEI_ENTERROOM) {
            if (Number.isNaN(this._heartBeatInterval)) {
                this._startHeartbeat();
            }

            if (Number.isNaN(this._updateTokenInterval)) {
                this._startUpdateToken();
            }
        }
    }

    private _redirectServerIfNecessary() {
        let nodeId = GlobalDataCenter.Instance.nodeId;
        let redirect = GlobalDataCenter.Instance.redirect;

        if (nodeId && redirect && nodeId != redirect.nodeId) {
            //need redirect
            let _url = redirect.url;
            if (_url != undefined) {
                GlobalDataCenter.Instance.currentUrl = _url;
                //reconnect
                this.machine.changeState(new NetStateRedirecting(this.machine));
            }
        }
    }

    private _startHeartbeat() {
        let f = () => {
            if (this._networkTimeout) {
                this.machine.changeState(new NetStateReconnect(this.machine));
                return;
            }

            let net = this.machine.net;
            net.send(ServeOutEventDefine.SEO_HEART);
            this._networkTimeout = true;
        };

        this._heartBeatInterval = setInterval(f, 50000);
        f();
    }

    private _stopHeartbeat() {
        if (!Number.isNaN(this._heartBeatInterval)) {
            clearInterval(this._heartBeatInterval);
            this._heartBeatInterval = NaN;
        }
    }

    private _startUpdateToken() {
        let f = () => {
            let net = this.machine.net;
            net.send(ServeOutEventDefine.SEO_HALL_UPDATETOKEN);
        };
        this._updateTokenInterval = setInterval(f, 300000);
        f();
    }

    private _stopUpdateToken() {
        if (!Number.isNaN(this._updateTokenInterval)) {
            clearInterval(this._updateTokenInterval);
            this._updateTokenInterval = NaN;
        }
    }
}

// ====================================================================================
// Net state Redirecting
// ====================================================================================

export class NetStateRedirecting extends NetState {
    private _sc_time: number;
    private _ec_time: number;
    constructor(machine: NetStateMachine) {
        super(machine);
        this.state = NetStateEnum.Redirecting;
    }

    public onEnterState(pre: MachineState): void {
        SYEventManager.Instance.getEventTarget().emit(CustomEventDefine.CE_NETWORK_REDIRECTION);
        let net = this.machine.net;
        net.openFunc = this._onNetOpen.bind(this);
        net.closeFunc = this._onNetClose.bind(this);
        net.errorFunc = this._onNetError.bind(this);
        net.close();
        this._sc_time = new Date().getTime();
    }

    public onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        let net = this.machine.net;
        net.openFunc = null;
        net.closeFunc = null;
        net.errorFunc = null;
        succ(true);
    }

    private _onNetClose(key: string) {
        let url = GlobalDataCenter.Instance.currentUrl;
        let net = this.machine.net;
        net.Url = url;
        net.connect();
    }

    private _onNetError(key: string) {
        cc.log(`browser type = ${cc.sys.browserType}`);
        if (cc.sys.browserType == cc.sys.BROWSER_TYPE_EDGE) {
            // 兼容edge
            // edge下websocket.close会触发error
            this._onNetClose(key);
        } else {
            let { Url } = this.machine.net;
            cc.log(`Redirecting faild to ${Url}`);
            this.machine.changeState(new NetStateClosed(this.machine));
        }
    }

    private _onNetOpen(key: string) {
        let redirect = GlobalDataCenter.Instance.redirect;
        GlobalDataCenter.Instance.nodeId = redirect.nodeId;
        this._ec_time = new Date().getTime();
        cc.log(`redirection end ==> nodeId = ${GlobalDataCenter.Instance.nodeId}`);
        cc.log(`Current redirection cost time: ${this._ec_time - this._sc_time}`);
        this.machine.changeState(new NetStateConnected(this.machine));
    }
}

// ====================================================================================
// Net state Closing
// ====================================================================================

export class NetStateClosing extends NetState {
    private _complete: boolean = false;
    constructor(machine: NetStateMachine) {
        super(machine);
        this.state = NetStateEnum.Closing;
    }

    public onEnterState(pre: MachineState): void {
        SYEventManager.Instance.getEventTarget().emit(CustomEventDefine.CE_NETWORK_CLOSING);

        let net = this.machine.net;
        net.closeFunc = this._onNetClose.bind(this);
        net.close();
    }

    public onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        succ(this._complete);
    }

    private _onNetClose(key: string) {
        this._complete = true;
        let net = this.machine.net;
        net.closeFunc = null;
        this.machine.changeState(new NetStateClosed(this.machine));
    }
}

// ====================================================================================
// Net state Closed
// ====================================================================================

export class NetStateClosed extends NetState {
    constructor(machine: NetStateMachine) {
        super(machine);
        this.state = NetStateEnum.Closed;
    }

    public onEnterState(pre: MachineState): void {
        let state = pre ? (pre as NetState).state : null;
        SYEventManager.Instance.getEventTarget().emit(CustomEventDefine.CE_NETWORK_CLOSED, state);
    }
}

// ====================================================================================
// Net State Reconnect
// ====================================================================================

export class NetStateReconnect extends NetState {
    private _complete: boolean = false;
    private _maxTry: number = 3;
    private _interval: number = 10000;
    private _tryCount: number = 0;
    private _sc_time: number;
    private _ec_time: number;
    constructor(machine: NetStateMachine) {
        super(machine);
        this.state = NetStateEnum.Reconnect;
    }

    public onEnterState(pre: MachineState): void {
        let net = this.machine.net;
        net.errorFunc = this._onNetError.bind(this);
        net.openFunc = this._onNetOpen.bind(this);
        net.connect();
        ++this._tryCount;
        this._sc_time = new Date().getTime();
        SYEventManager.Instance.getEventTarget().emit(
            CustomEventDefine.CE_NETWORK_RECONNECT,
            this._tryCount,
            net.Url
        );
        cc.log(`Start to reconnect to ${net.Url}`);
    }

    public onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        if (this._complete) {
            let net = this.machine.net;
            net.openFunc = null;
            net.errorFunc = null;
        }
        succ(this._complete);
    }

    private _onNetError(key: string) {
        ++this._tryCount;
        if (this._tryCount <= this._maxTry) {
            setTimeout(() => {
                let net = this.machine.net;
                net.connect();
                SYEventManager.Instance.getEventTarget().emit(
                    CustomEventDefine.CE_NETWORK_RECONNECT,
                    this._tryCount,
                    net.Url
                );
                cc.log(`try reconnecting to ${net.Url} ${this._tryCount} times`);
            }, this._interval);
        } else {
            let net = this.machine.net;
            cc.log(`failed to reconnecting to ${net.Url}`);
            this._complete = true;
            this.machine.changeState(new NetStateClosed(this.machine));
        }
    }

    private _onNetOpen(key: string) {
        this._ec_time = new Date().getTime();
        cc.log(`reconnect successfully`);
        cc.log(`Current reconnecting cost time: ${this._ec_time - this._sc_time}`);
        this._complete = true;
        this.machine.changeState(new NetStateConnected(this.machine));
    }
}
