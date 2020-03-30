/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/effects/Wave.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Monday, August 26th 2019, 4:29:38 pm
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */
const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class WaveEffect extends cc.Component {
    @property
    use: boolean = true;

    private _startTime: number = 0;
    private _render: cc.Sprite;
    private _material: cc.Material;
    // ====================================================================================
    // life cycle
    // ====================================================================================
    start() {
        this._render = this.node.getComponent(cc.Sprite);
        this._material = this._render.getMaterial(0);
        if (this.use) {
            this._startTime = new Date().getTime();
        } else {
            let m = cc.MaterialVariant.createWithBuiltin("2d-sprite", this._render);
            this._render.setMaterial(0, m);
        }
    }

    update(dt: number) {
        if (this.use) {
            let elapse = (new Date().getTime() - this._startTime) / 1000;
            let m = cc.MaterialVariant.create(this._material, this._render);
            m.setProperty("f4_elapse", elapse);
            m.setProperty("v2_winsize", cc.v2(this.node.width, this.node.height));
            this._render.setMaterial(0, m);
        }
    }
}
