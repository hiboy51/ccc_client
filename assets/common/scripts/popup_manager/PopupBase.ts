import PopupManager from "./PopupManager";

const {ccclass, property} = cc._decorator;

export enum UIAnimationStyle {
    None,
    UP_DOWN,
    ZOOM,
    Custom
}
export interface IUIAnimation {
    style: UIAnimationStyle;
    /** 进场动画 */
    runAnimationIn(popup: cc.Component): Promise<any>;
    /** 出场动画 */
    runAnimationOut(popup: cc.Component): Promise<any>;
}

class PopupUIAnimationNone implements IUIAnimation {
    public style: UIAnimationStyle = UIAnimationStyle.None;

    public runAnimationIn(popup: cc.Component) {
        return Promise.resolve();
    }

    public runAnimationOut(popup: cc.Component) {
        return Promise.resolve();
    }
}

class PopupUIAnimationUpDown implements IUIAnimation {
    public style: UIAnimationStyle = UIAnimationStyle.UP_DOWN;

    public runAnimationIn(popup: cc.Component) {
        let pp = popup as PopupBase;
        if (pp.nd_backlayer) {
            pp.nd_backlayer.opacity = 0;
            pp.nd_backlayer.runAction(cc.fadeTo(0.15, 150));
        }
        pp.nd_board.y = 500;
        pp.nd_board.runAction(cc.moveTo(1.5, cc.v2(0, 0)).easing(cc.easeElasticOut(0.5)));
        return Promise.resolve();
    }

    public runAnimationOut(popup: cc.Component) {
        let pp = popup as PopupBase;
        return new Promise(resolve => {
            if (pp.nd_backlayer) {
                pp.nd_backlayer.runAction(cc.sequence(cc.delayTime(0.3), cc.fadeOut(0.15)));
            }
            pp.nd_board.runAction(cc.sequence(
                cc.moveTo(0.6, cc.v2(0, 500)).easing(cc.easeBounceIn()),
                cc.callFunc(resolve)
            ));
        })
    }
}

class PopupUIAnimationZoom implements IUIAnimation {
    public style: UIAnimationStyle = UIAnimationStyle.ZOOM;

    public runAnimationIn(popup: cc.Component) {
        let pp = popup as PopupBase;
        if (pp.nd_backlayer) {
            pp.nd_backlayer.opacity = 0;
            pp.nd_backlayer.runAction(cc.fadeTo(0.15, 150));
        }
        pp.nd_board.scale = 0.9;
        pp.nd_board.opacity = 255;
        pp.nd_board.runAction(cc.scaleTo(0.5, 1).easing(cc.easeElasticOut(0.5)));
        return Promise.resolve();
    }

    public runAnimationOut(popup: cc.Component) {
        let pp = popup as PopupBase;
        return new Promise(resolve => {
            if (pp.nd_backlayer) {
                pp.nd_backlayer.runAction(cc.fadeOut(0.15));
            }
            pp.nd_board.runAction(cc.sequence(
                cc.spawn(cc.scaleTo(0.15, 0.1), cc.fadeOut(0.15)),
                cc.callFunc(resolve)
            ));
        })
    }
}

@ccclass
export default class PopupBase extends cc.Component {
    @property
    popupName:string = "";

    @property({
        type: cc.Node
    })
    nd_backlayer: cc.Node = null;

    @property({
        type: cc.Node
    })
    nd_board: cc.Node = null;

    @property({
        displayName: "是否缓存（关闭时不会销毁）"
    })
    cached: boolean = false;

    @property({
        type: cc.Enum(UIAnimationStyle)
    })
    enum_aniStyle: UIAnimationStyle = UIAnimationStyle.UP_DOWN;

    private _listUIAnim: IUIAnimation[] = [];
    protected _uiPrepared: boolean = false;
    // ==========================================================================================
    // public interfaces
    // ==========================================================================================

    /** virtual */
    public setData(...args) {
        if (this._uiPrepared) {
            this._initView();
        }
    }

    /** final */
    public async dispose() {
        await this.uiAnim.runAnimationOut(this);
        this.node.parent = null;
        PopupManager.instance && PopupManager.instance.remove(this);
    }

    public onBtnClose() {
        this.dispose();
    }

    // ==========================================================================================
    // life-cycle
    // ==========================================================================================
    onLoad() {
        this._listUIAnim = [
            new PopupUIAnimationNone(),
            new PopupUIAnimationUpDown(),
            new PopupUIAnimationZoom()
        ];
        cc.log(`new popup instance named ${this.popupName} has been created`);
    }
    
    async onEnable() {
        await this.uiAnim.runAnimationIn(this);
        if (!this._uiPrepared) {
            this._uiPrepared = true;
            this._initView();
        }
    }

    onDestroy() {
        cc.log(`popup instance named ${this.popupName} has been destroyed`);
        PopupManager.instance && PopupManager.instance.remove(this, true);
    }
    
    // ==========================================================================================
    // protected interfaces
    // ==========================================================================================
    
    /** 获取当前UI动画 */
    protected get uiAnim() {
        let find = this._listUIAnim.find(each => each.style == this.enum_aniStyle);
        return find || this.getCustomAnim();
    }

    protected getCustomAnim(): IUIAnimation {
        return new PopupUIAnimationNone();
    }

    protected _initView() {

    }
}