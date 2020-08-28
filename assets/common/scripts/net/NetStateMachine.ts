import StateMachine from "../state_machine/StateMachine";
import Net from "./Net";
import { GlobalDataCenter } from "../GlobalDataCenter";
import ProjectConfigs from "../ProjectConfigs";
import {
    NetState,
    NetStateEnum,
    NetStateConnecting,
    NetStateConnected,
    NetStateClosing,
    NetStateReconnect,
} from "./NetState";
import SYEventManager from "../SYEventManager";
import { CustomEventDefine } from "../ProjectEvents/CustomEventDefine";
import PM from "../popup_manager/PopupManager";
import { ServeOutEventDefine } from "../ProjectEvents/ServeOutEventDefine";
import { performAsyncWithErrorCatch } from "../Flow";
import { fetchable } from "../protocol_dispatch/ProtocolConfig";
import { injectable } from "../DI/DI";

/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/net/NetStateMachine.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Friday, June 28th 2019, 4:37:55 pm
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */

const { ccclass } = cc._decorator;
@ccclass
@injectable({
    factory: () => NetStateMachine.get(),
    share: true,
})
export default class NetStateMachine extends StateMachine {
    private static _ins: NetStateMachine = null;
    private _fetchList: any[] = [];
    private _net: Net = null;
    private _waitRedirectResolve = null;
    public set net(n: Net) {
        this._net = n;
    }
    public get net() {
        return this._net;
    }

    public static get(): NetStateMachine {
        if (!NetStateMachine._ins) {
            NetStateMachine._ins = new NetStateMachine();
        }

        return NetStateMachine._ins;
    }

    public static purge() {
        if (NetStateMachine._ins) {
            NetStateMachine._ins.unregisterListeners();
        }
        NetStateMachine._ins = null;
    }

    constructor() {
        super();
        this.registerListeners();
    }

    // ====================================================================================
    // public interfaces
    // ====================================================================================
    public init() {
        if (!this.curState || (this.curState as NetState).state == NetStateEnum.Closed) {
            // let {gameUrl} = Utils.getUrlPara();
            // GlobalDataCenter.Instance.currentUrl = gameUrl;
            this.changeState(new NetStateConnecting(this, GlobalDataCenter.Instance.currentUrl));
        }
    }

    public send(code: string, msg: any) {
        if (this.curState && (this.curState as NetState).state == NetStateEnum.Connected) {
            (this.curState as NetStateConnected).sendMsg(code, msg);
        } else {
            cc.log(
                `Network not available to send message, current state is ${
                    (this.curState as NetState).state
                }`
            );
        }
    }

    public async fetch(code: string, msg?: any) {
        msg = msg || {};
        if (!fetchable(code)) {
            this.send(code, msg);
            const err = `msg (${code}) isn't marked as fetchable, auto changed to "send" method`;
            return [err, null];
        }

        let fetchPromise = () => {
            if (!this.curState) {
                let err = `Network not available to send message, current state is ${
                    (this.curState as NetState).state
                }`;
                return Promise.reject(err);
            }
            if ((this.curState as NetState).state != NetStateEnum.Connected) {
                let err = `Network not available to send message, current state is ${
                    (this.curState as NetState).state
                }`;
                return Promise.reject(err);
            }
            return new Promise((resolve, reject) => {
                (this.curState as NetStateConnected).sendMsg(code, msg);

                let timeOut = setTimeout(() => {
                    let fetch = this._fetchList.find((each) => each.serialId == serialId);
                    if (fetch) {
                        clearTimeout(fetch.timeOut);
                        let idx = this._fetchList.indexOf(fetch);
                        this._fetchList.splice(idx, 1);
                    }
                    reject(`msg fetch timeout: ${code}`);
                }, 10000);
                let serialId = Net.sn;
                this._fetchList.push({ serialId, resolve, reject, code, timeOut });
            });
        };

        let p = performAsyncWithErrorCatch(fetchPromise);
        return p();
    }

    public ejectFetch(codeOrSerialId: string | number) {
        let predicate: (item: any, idx: number, arr: any[]) => boolean;
        if (typeof codeOrSerialId == "string") {
            predicate = (each) => each.code == codeOrSerialId;
        } else if (typeof codeOrSerialId == "number") {
            predicate = (each) => each.serialId == codeOrSerialId;
        }
        let fetch = this._fetchList.find(predicate);
        if (fetch) {
            clearTimeout(fetch.timeOut);
            let idx = this._fetchList.indexOf(fetch);
            this._fetchList.splice(idx, 1);
            return fetch;
        }
        return {};
    }

    public get currentStateEnum(): NetStateEnum {
        return this.curState ? (this.curState as NetState).state : null;
    }

    public shutdown() {
        if (this.currentStateEnum == NetStateEnum.Connected) {
            this.changeState(new NetStateClosing(this));
        }
    }

    public async waitRedirectIfNecessary() {
        let fuc = () => {
            if (this.currentStateEnum == NetStateEnum.Redirecting) {
                return new Promise((resolve) => (this._waitRedirectResolve = resolve));
            }
            if (this.currentStateEnum == NetStateEnum.Connected) {
                return Promise.resolve(true);
            }
            return Promise.reject("cannot redirect network");
        };
        return await performAsyncWithErrorCatch(fuc)();
    }

    public registerListeners() {
        let eventTarget = SYEventManager.Instance.getEventTarget();
        eventTarget.on(
            CustomEventDefine.CE_NETWORK_CONNECTING,
            this.onNoti_ce_network_connecting,
            this
        );
        eventTarget.on(CustomEventDefine.CE_NETWORK_OPEN, this.onNoti_ce_network_open, this);
        eventTarget.on(
            CustomEventDefine.CE_NETWORK_RECONNECT,
            this.onNoti_ce_network_reconnect,
            this
        );
        eventTarget.on(CustomEventDefine.CE_NETWORK_CLOSED, this.onNoti_ce_network_closed, this);
        eventTarget.on(CustomEventDefine.CE_SERVER_ERROR, this.onNoti_ce_server_error, this);
    }

    public unregisterListeners() {
        let eventTarget = SYEventManager.Instance.getEventTarget();
        eventTarget.targetOff(this);
    }

    // ====================================================================================
    // notification listeners
    // ====================================================================================

    public onNoti_ce_network_connecting() {
        PM.Waiting("正在连接网络", 30);
    }

    public onNoti_ce_network_open(prestate: NetStateEnum) {
        PM.$Tips();
        PM.$Waiting();
        if (prestate == NetStateEnum.Reconnect) {
            let curSceneName = cc.director.getScene().name;
            if (curSceneName != ProjectConfigs.HALL_NAME) {
                let gCenter = GlobalDataCenter.Instance;
                this.send(ServeOutEventDefine.SEO_ENTERROOM, {
                    token: gCenter.userToken,
                    playerId: gCenter.playerId,
                    gameType: gCenter.currentGameType,
                    roomId: gCenter.currentRoomId,
                    field: gCenter.currentField,
                    pAccount: gCenter.agencyAccount,
                    agent: gCenter.agencyId,
                });
            }
        } else if (prestate == NetStateEnum.Redirecting) {
            this._waitRedirectResolve && this._waitRedirectResolve();
            this._waitRedirectResolve = null;
        }
    }

    public onNoti_ce_network_reconnect(count: number) {
        PM.$Waiting();
        PM.Tips(`检测到网络不可用，正在努力连接(第${count}次)...`, 30, true);
    }

    public onNoti_ce_network_closed(prestate: NetStateEnum) {
        PM.$Tips();
        PM.$Waiting();
        if (prestate) {
            cc.log(`=================> ${prestate}`);
            if (prestate == NetStateEnum.Reconnect) {
                let optionOk = {
                    optionCode: 0,
                    name: "重连",
                    onClick: () => this.changeState(new NetStateReconnect(this)),
                };
                PM.MsgBox("网络无法连接, 是否重试?", optionOk);
            } else if (prestate == NetStateEnum.Connected) {
                let optionOk = {
                    optionCode: 0,
                    name: "连接",
                    onClick: () => this.changeState(new NetStateReconnect(this)),
                };
                PM.MsgBox("网络已断开, 是否尝试连接?", optionOk);
            } else if (prestate == NetStateEnum.Redirecting) {
                this._waitRedirectResolve = null;
                let optionOk = {
                    optionCode: 0,
                    name: "连接",
                    onClick: () => this.changeState(new NetStateReconnect(this)),
                };
                PM.MsgBox("网络重定向失败, 请尝试重连?", optionOk);
            }
        }
    }

    public onNoti_ce_server_error(msgData: any) {
        let { code, msg } = msgData;
        PM.$Waiting();
        if (code == 4 || code == 7) {
            // 未登录或或者未授权
            SYEventManager.Instance.getEventTarget().emit(
                CustomEventDefine.CE_SERVER_TOKEN_OUTDATED
            );
        } else {
            PM.Tips(msg);
        }
    }
}
