import PopupBase, { IUIAnimation, UIAnimationStyle } from "../popup_manager/PopupBase";

/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/TipsPopup.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Monday, July 1st 2019, 5:56:14 pm
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */
const { ccclass, property } = cc._decorator;

class TipsPopupAnimation implements IUIAnimation {
    public style: UIAnimationStyle = UIAnimationStyle.Custom;

    public runAnimationIn(popup: cc.Component) {
        let pp = popup as TipsPopup;

        pp.nd_lblboard.scaleY = 0.01;
        pp.nd_lblboard.runAction(cc.spawn(cc.scaleTo(0.1, 1, 1), cc.fadeIn(0.1)));
        pp.lbl_tips.node.runAction(
            cc.sequence(cc.hide(), cc.delayTime(0.1), cc.show(), cc.fadeIn(0.2))
        );
        return Promise.resolve();
    }

    public runAnimationOut(popup: cc.Component) {
        let pp = popup as TipsPopup;
        return new Promise(resolve => {
            pp.lbl_tips.node.runAction(cc.fadeOut(0.1));
            pp.nd_lblboard.runAction(
                cc.sequence(
                    cc.spawn(cc.scaleTo(0.1, 1, 0.01), cc.fadeOut(0.1)),
                    cc.callFunc(resolve)
                )
            );
        });
    }
}

@ccclass
export default class TipsPopup extends PopupBase {
    @property(cc.Label)
    lbl_tips: cc.Label = null;

    @property(cc.Node)
    nd_lblboard: cc.Node = null;

    private _initiate: boolean = false;
    private _cachedData: string = null;
    private _lasts: number = -1;
    private _forbidTouch: boolean = false;

    // ====================================================================================
    // life cycle
    // ====================================================================================
    start() {
        if (!this._initiate) {
            this._initiate = true;
            this._init();
        }
    }

    async onEnable() {
        await super.onEnable();
        if (this._lasts > 0) {
            this.scheduleOnce(() => {
                this.dispose();
            }, this._lasts);
        }
    }

    // ====================================================================================
    // public interfaces
    // ====================================================================================
    public setData(txt: string, lasts: number = 3, forbidTouch: boolean = false) {
        this._cachedData = txt;
        this._lasts = lasts;
        this._forbidTouch = forbidTouch;
        if (this._initiate) {
            this._init();
        }
    }
    // ====================================================================================
    // private interfaces
    // ====================================================================================
    private _init() {
        this.lbl_tips.string = this._cachedData;
        let btnForbid = this.nd_backlayer.getComponent(cc.Button);
        btnForbid.enabled = this._forbidTouch;
    }

    // ====================================================================================
    // virtual
    // ====================================================================================
    protected getCustomAnim(): IUIAnimation {
        return new TipsPopupAnimation();
    }
}
