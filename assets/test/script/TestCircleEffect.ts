import Circle from "../../common/scripts/effects/Circle";

const { ccclass, property } = cc._decorator;
@ccclass
export default class TestCircleEffect extends cc.Component {
    @property(cc.Node)
    nd_target: cc.Node = null;
    @property(cc.Slider)
    slider_radius: cc.Slider = null;

    private _radiusRange: number[] = [0, 0];
    private _currentRadius = 0;
    private _lastRadius = -1;
    // ? ====================================================================================
    // ? life cycle
    // ? ====================================================================================
    start() {
        let { width, height } = this.nd_target;
        this._radiusRange[1] = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));

        this._currentRadius = Math.min(width / 2, height / 2);
        this.slider_radius.progress = this._currentRadius / this._radiusRange[1];
    }

    update() {
        if (this._lastRadius != this._currentRadius) {
            let circle = this.nd_target.getComponent(Circle);
            if (!circle) {
                return;
            }
            circle.radius = this._currentRadius;
            this._lastRadius = this._currentRadius;
        }
    }
    // ? ====================================================================================
    // ? public interfaces
    // ? ====================================================================================
    public applyRadius() {}

    // ? ====================================================================================
    // ? on ui event
    // ? ====================================================================================
    public onSlider(slider: cc.Slider) {
        let progress = slider.progress;
        this._currentRadius = this._radiusRange[1] * progress + this._radiusRange[0];
    }
}
