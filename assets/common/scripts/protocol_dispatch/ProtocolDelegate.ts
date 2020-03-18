import { getProtocolIdByKey, getReferedKeyRecursively } from "./ProtocolConfig";
import SYEventManager from "../SYEventManager";

const { ccclass, property } = cc._decorator;

@ccclass("ProtocolHandler")
class ProtocolHandler {
    @property({
        displayName: "协议号"
    })
    protocol_id: string = "EMPTY_KEY";

    @property({
        displayName: "协议执行体",
        type: cc.Component.EventHandler
    })
    protocol_handler: cc.Component.EventHandler = null;
}

@ccclass
export default class ProtocolDelegate extends cc.Component {
    @property({
        displayName: "注册协议",
        type: [ProtocolHandler]
    })
    protocols: ProtocolHandler[] = [];

    @property({
        displayName: "是否在组件失能的状态下监听"
    })
    workBackground: boolean = false;

    /** 缓存事件监听 */
    private _callbacksCache = [];

    // =====================================================================================================
    // life cycle
    // =====================================================================================================
    onLoad() {
        this._registerHandlers();
    }

    onDestroy() {
        this._unregisterHandlers();
    }

    // =====================================================================================================
    // private interfaces
    // =====================================================================================================
    private _registerHandlers() {
        this.protocols.forEach(ph => {
            let duplicated = getReferedKeyRecursively(ph.protocol_id);
            let command = getProtocolIdByKey(duplicated);
            if (!command) {
                return;
            }
            let handler = ph.protocol_handler;
            if (!handler) {
                return;
            }

            let callback = SYEventManager.Instance.getEventTarget().on(
                command,
                function(...args: any[]) {
                    let enable = this.thiz.node.active;
                    if (!this.thiz.workBackground && !enable) {
                        return;
                    }
                    this.handler.emit(args);
                }.bind({ handler, command, thiz: this }),
                this.node
            );

            this._callbacksCache.push({ command, callback });
        });
    }

    private _unregisterHandlers() {
        this._callbacksCache.forEach(cache => {
            SYEventManager.Instance.getEventTarget().off(cache.command, cache.callback, this.node);
        });
        this._callbacksCache.length = 0;
    }
}
