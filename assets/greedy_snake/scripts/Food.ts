/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-03 17:58:14
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-03 19:26:41
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class Food extends cc.Component {
    @property(cc.Camera)
    camera_food: cc.Camera = null;

    @property(cc.Node)
    nd_mask: cc.Node = null;

    @property(cc.Node)
    nd_mesh: cc.Node = null;

    @property(cc.Node)
    nd_foodSpr: cc.Node = null;

    @property(cc.Node)
    nd_arrow: cc.Node = null;

    // ? ===================================================================================
    // ? public interfaces
    // ? ===================================================================================
    public showViceView(show: boolean) {
        this.camera_food.enabled = show;
        this.nd_mask.active = show;
        this.nd_mesh.active = show;
        this.nd_arrow.active = show;
    }

    public placeArrow(aimPos: cc.Vec3) {
        this.nd_arrow.active = true;

        let dir = this.node.convertToWorldSpaceAR(cc.v2()).sub(cc.v2(aimPos));
        let degree = cc.misc.radiansToDegrees(cc.v2(1, 0).signAngle(dir));
        this.nd_arrow.angle = degree;
    }
}
