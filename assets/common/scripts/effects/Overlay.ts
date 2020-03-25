const { ccclass, property } = cc._decorator;

@ccclass
export default class Overlay extends cc.Component {
    @property(cc.Sprite)
    sp_base: cc.Sprite = null;

    @property(cc.Sprite)
    sp_plus: cc.Sprite = null;

    private _mat4_temp: cc.Mat4 = new cc.Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    private _curMaterial: any;
    // ====================================================================================
    // life cycle
    // ====================================================================================
    start() {
        this._curMaterial = this.sp_plus.getMaterial(0) as any;
        this._curMaterial = cc.MaterialVariant.create(this._curMaterial, this.sp_plus);
        this._curMaterial.setProperty(
            "base_ax",
            this.sp_base.node.getContentSize().width * this.sp_base.node.anchorX
        );
        this._curMaterial.setProperty(
            "base_ay",
            this.sp_base.node.getContentSize().height * this.sp_base.node.anchorY
        );
    }

    update() {
        if (this.sp_base.spriteFrame.textureLoaded()) {
            this._commitTextureBase();
        } else {
            this.sp_base.spriteFrame.once("load", () => {
                !!this.node && !!this.node.parent && this._commitTextureBase();
            });
            this.sp_base.spriteFrame.ensureLoadTexture();
        }

        this._updateMatrix();
    }

    // ====================================================================================
    // private interfaces
    // ====================================================================================

    private _commitTextureBase() {
        let base_tex = this.sp_base.spriteFrame.getTexture();
        let rotated = this.sp_base.spriteFrame.isRotated();
        let uv = this.sp_base.spriteFrame["uv"];
        this._curMaterial.setProperty("base_tex", base_tex);
        this._curMaterial.setProperty("base_rotated", rotated ? 1.0 : -1.0);
        this._curMaterial.setProperty("base_uv_a", cc.v2(uv[0], uv[1]));
        this._curMaterial.setProperty("base_uv_b", cc.v2(uv[2], uv[3]));
        this._curMaterial.setProperty("base_uv_c", cc.v2(uv[4], uv[5]));
        this._curMaterial.setProperty("base_uv_d", cc.v2(uv[6], uv[7]));

        let ts = cc.v2(base_tex.width, base_tex.height);
        this._curMaterial.setProperty("base_tex_size", ts);
    }

    private _updateMatrix() {
        this.sp_base.node["_updateWorldMatrix"]();
        this.sp_plus.node["_updateWorldMatrix"]();

        // 下层node的世界变换的invert矩阵
        this.sp_base.node.getWorldMatrix(this._mat4_temp);
        this._mat4_temp.invert(this._mat4_temp);
        this._curMaterial.setProperty("base_matWorldInv", this._mat4ToArray(this._mat4_temp));
    }

    private _mat4ToArray(m: any) {
        let out = new Float32Array(16);
        out[0] = m.m00;
        out[1] = m.m01;
        out[2] = m.m02;
        out[3] = m.m03;
        out[4] = m.m04;
        out[5] = m.m05;
        out[6] = m.m06;
        out[7] = m.m07;
        out[8] = m.m08;
        out[9] = m.m09;
        out[10] = m.m10;
        out[11] = m.m11;
        out[12] = m.m12;
        out[13] = m.m13;
        out[14] = m.m14;
        out[15] = m.m15;
        return out;
    }
}
