/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-03 12:09:09
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-07 20:59:43
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class FocusCamera extends cc.Component {
    @property(cc.Node)
    nd_fixArea: cc.Node = null;

    private _half_fix_w: number;
    private _half_fix_h: number;
    private _trans_v: cc.Vec2 = cc.v2();
    private _cornorV: cc.Vec2[] = [];
    // ? ===================================================================================
    // ? life cycle
    // ? ===================================================================================
    onLoad() {
        let { width, height } = this.nd_fixArea.getBoundingBox();
        this._half_fix_w = width / 2;
        this._half_fix_h = height / 2;

        this._cornorV = [
            //* 右上
            cc.v2(this._half_fix_w, this._half_fix_h),
            //* 左上
            cc.v2(-this._half_fix_w, this._half_fix_h),
            //* 左下
            cc.v2(-this._half_fix_w, -this._half_fix_h),
            //* 右下
            cc.v2(this._half_fix_w, -this._half_fix_h)
        ];
    }

    // ? ===================================================================================
    // ? public interfaces
    // ? ===================================================================================
    public follow(posWorld: cc.Vec2, dir: cc.Vec2) {
        let fixBox = this.nd_fixArea.getBoundingBoxToWorld();
        if (fixBox.contains(posWorld)) {
            return;
        }

        let originPosWorld = this.node.convertToWorldSpaceAR(cc.v2());
        posWorld.sub(originPosWorld, this._trans_v);

        //* 判断相交的边
        if (
            this._trans_v.signAngle(this._cornorV[0]) < 0 &&
            this._trans_v.signAngle(this._cornorV[1]) >= 0
        ) {
            //* 上边
            cc.log("上边界到了");
            let absY = Math.abs(this._trans_v.y);
            let ratio = 1 - this._half_fix_h / absY;
            dir.mul(ratio, this._trans_v);
        } else if (
            this._trans_v.signAngle(this._cornorV[1]) < 0 &&
            this._trans_v.signAngle(this._cornorV[2]) >= 0
        ) {
            //* 左边
            cc.log("左边界到了");
            let absX = Math.abs(this._trans_v.x);
            let ratio = 1 - this._half_fix_w / absX;
            dir.mul(ratio, this._trans_v);
        } else if (
            this._trans_v.signAngle(this._cornorV[2]) < 0 &&
            this._trans_v.signAngle(this._cornorV[3]) >= 0
        ) {
            //* 下边
            cc.log("下边界到了");
            let absY = Math.abs(this._trans_v.y);
            let ratio = 1 - this._half_fix_h / absY;
            dir.mul(ratio, this._trans_v);
        } else if (
            this._trans_v.signAngle(this._cornorV[3]) < 0 &&
            this._trans_v.signAngle(this._cornorV[0]) >= 0
        ) {
            //* 右边
            cc.log("右边界到了");
            let absX = Math.abs(this._trans_v.x);
            let ratio = 1 - this._half_fix_w / absX;
            dir.mul(ratio, this._trans_v);
        }

        cc.log(this._trans_v.x, this._trans_v.y);
        this.node.x += this._trans_v.x;
        this.node.y += this._trans_v.y;
    }

    public reset() {
        this.node.position = cc.v3();
    }
}
