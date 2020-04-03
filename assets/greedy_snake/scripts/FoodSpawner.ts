/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-03 18:27:42
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-03 18:33:33
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class FoodSpawner extends cc.Component {
    @property(cc.Prefab)
    pref_food: cc.Prefab = null;

    @property(cc.Node)
    nd_viewport: cc.Node = null;

    // ? ===================================================================================
    // ? public interfaces
    // ? ===================================================================================
    public genPositionWorld() {
        let { width, height } = this.nd_viewport;
        let randX = Math.floor(Math.random() * 2 * width) - width;
        let randY = Math.floor(Math.random() * 2 * height) - height;
        return this.nd_viewport.convertToWorldSpaceAR(cc.v2(randX, randY));
    }

    public assembFood() {
        return cc.instantiate(this.pref_food);
    }
}
