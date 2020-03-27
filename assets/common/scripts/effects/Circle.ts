const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class Circle extends cc.Component {
    private sprite: cc.Sprite;
    private material: cc.MaterialVariant;
    private _shaderPrepared: boolean = false;
    public set radius(r: number) {
        if (!this.material) {
            return;
        }
        this.material.setProperty("f4_radius", r);
    }

    start() {
        this._shaderPrepared = false;
        this.sprite = this.node.getComponent(cc.Sprite);
        this.material = this.sprite.getMaterial(0); //获取材质
    }

    update(dt) {
        let sprf = this.sprite.spriteFrame;
        if (!sprf) {
            return;
        }
        if (!this._shaderPrepared) {
            this._shaderPrepared = true;
            let uv = sprf.uv;
            let isRotated = this.sprite.spriteFrame.isRotated();
            let l: number, r: number, t: number, b: number;
            if (isRotated) {
                l = uv[0];
                r = uv[4];
                t = uv[1];
                b = uv[3];
            } else {
                l = uv[0];
                r = uv[2];
                t = uv[5];
                b = uv[1];
            }
            let txW = sprf.getTexture().width;
            let txH = sprf.getTexture().height;
            let defaultRadius = Math.min(this.node.width / 2, this.node.height / 2);
            this.material.setProperty("f4_borders", [l, r, t, b]);
            this.material.setProperty("f4_widthInPixel", txW);
            this.material.setProperty("f4_heightInPixel", txH);
            this.radius = defaultRadius;
        }
    }
}
