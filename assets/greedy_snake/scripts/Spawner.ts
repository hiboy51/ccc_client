import Segment from "./Segment";
import Snake, { Part } from "./Snake";

/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-02 17:45:02
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-02 18:41:41
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class Spawner extends cc.Component {
    @property([cc.Prefab])
    prefs_segments: cc.Prefab[] = [];

    // ? ===================================================================================
    // ? public interfaces
    // ? ===================================================================================
    public assembHead(): Snake {
        let order = [0, 1, 1];
        let headSeg = order.reduce((pre: Segment, cur) => {
            let seg = cc.instantiate(this.prefs_segments[cur]);
            let comp_seg = seg.getComponent(Segment);
            if (!pre) {
                return comp_seg;
            }
            let tail = pre.tail;
            comp_seg.appendTo(tail);
            return pre;
        }, null);

        let head = new Snake(headSeg, Part.HEAD);
        return head;
    }

    public assembBody() {
        let order = [1, 1, 1];
        let headSeg = order.reduce((pre: Segment, cur) => {
            let seg = cc.instantiate(this.prefs_segments[cur]);
            let comp_seg = seg.getComponent(Segment);
            if (!pre) {
                return comp_seg;
            }
            let tail = pre.tail;
            comp_seg.appendTo(tail);
            return pre;
        }, null);

        let body = new Snake(headSeg);
        return body;
    }
}
