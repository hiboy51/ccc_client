import PopupBase, { IUIAnimation, UIAnimationStyle } from "./PopupBase";

/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/WaitingPopup.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Tuesday, July 16th 2019, 3:02:20 pm
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */
const { ccclass, property } = cc._decorator;

class WaitingPopupAnimation implements IUIAnimation {
    public style: UIAnimationStyle = UIAnimationStyle.Custom;

    public runAnimationIn(popup: cc.Component) {
        let pp = popup as WaitingPopup;
        pp.nd_circle.angle = 0;
        pp.nd_circle.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
        return Promise.resolve();
    }

    public runAnimationOut(popup: cc.Component) {
        let pp = popup as WaitingPopup;
        pp.nd_circle.stopAllActions();
        return Promise.resolve();
    }
}

@ccclass
export default class WaitingPopup extends PopupBase {
    @property(cc.Node)
    nd_circle: cc.Node = null;

    @property(cc.Label)
    lbl_tips: cc.Label = null;

    private _txt: string;
    private _timeout: number;
    private _forbiddenTouch: boolean = true;
    // ====================================================================================
    // override from PopupBase
    // ====================================================================================
    public setData(txt: string = "", timeout: number = 10, forbiddenTouch: boolean = true) {
        this._txt = txt;
        this._timeout = timeout;
        this._forbiddenTouch = forbiddenTouch;
        super.setData(txt, timeout);
    }

    protected _initView() {
        let btn = this.node.getChildByName("forbid").getComponent(cc.Button);
        btn.enabled = this._forbiddenTouch;
        this.execAni();
    }

    public getCustomAnim() {
        return new WaitingPopupAnimation();
    }

    // ====================================================================================
    // life cycle
    // ====================================================================================

    onDisable() {
        this.unscheduleAllCallbacks();
    }

    // ====================================================================================
    // private interfaces
    // ====================================================================================

    private execAni() {
        this.unscheduleAllCallbacks();

        let count = 1;
        const max = 4;
        this.lbl_tips.string = this._txt;
        this.lbl_tips.node.active = this._txt !== "";
        if (this.lbl_tips.node.active) {
            this.schedule(() => {
                let suffix = (dots: number) => {
                    if (dots == 0) {
                        return [];
                    }
                    return ["."].concat(suffix(dots - 1)).join("");
                };

                this.lbl_tips.string = `${this._txt}${suffix(count)}`;
                count = (count + 1) % max;
            }, 0.5);
        }

        this.scheduleOnce(() => this.dispose(), this._timeout);
    }
}
