/*
 * @Author: Kinnon.Z
 * @Date: 2020-03-18 15:33:12
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-03-18 15:36:06
 */

export default class SYEventManager {
    public static readonly Instance: SYEventManager = new SYEventManager();
    public eventTarget: cc.EventTarget;

    public getEventTarget(): cc.EventTarget {
        if (this.eventTarget === undefined) {
            this.eventTarget = new cc.EventTarget();
        }
        return this.eventTarget;
    }
}
