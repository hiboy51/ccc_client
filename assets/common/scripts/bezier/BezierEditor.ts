import BezierPoint, { PointType } from "./BezierPoint";
import BezierUtils, { CubicBezier } from "./BezierUtils";

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass("BezierSerialize")
export class BezierSerialize {
    @property(cc.Vec2)
    start: cc.Vec2 = cc.v2(0, 0);

    @property(cc.Vec2)
    end: cc.Vec2 = cc.v2(0, 0);

    @property([cc.Vec2])
    ctrls: cc.Vec2[] = [];

    @property()
    curveLength: number = 0;

    public calculateLength() {
        if (this.ctrls.length == 0) {
            return this.end.sub(this.start).mag();
        }

        let bezier: cc.Vec2[];
        if (this.ctrls.length == 1) {
            bezier = BezierUtils.quadraticToCubic([this.start, this.ctrls[0], this.end]);
        }
        else {
            bezier = [this.start, this.ctrls[0], this.ctrls[1], this.end];
        }

        return BezierUtils.approximateLength(bezier as CubicBezier);
    }

    public toArray() {
        let result = [this.start, this.end];
        result.splice(1, 0, ...this.ctrls);
        return result;
    }
}

export class BezierNode {
    public point: BezierPoint = null;
    public ctrl: BezierPoint = null;
}

export type Bezier = [BezierNode, BezierNode];

@ccclass
@executeInEditMode
export default class BezierEditor extends cc.Component {
    @property(cc.Prefab)
    pref_point: cc.Prefab = null;

    @property(cc.Graphics)
    comp_graphic: cc.Graphics = null;

    @property([BezierSerialize])
    bezier_serialized: BezierSerialize[] = [];

    @property
    _showCtrlInfos: boolean = true;
    @property
    set showCtrlInfos(show: boolean) {
        this._showCtrlInfos = show;
        this._isDirty = true;
    }
    get showCtrlInfos() {return this._showCtrlInfos;}

    private _isDirty = true;
    private _paths: BezierPoint[] = [];
    private _bezierNodes: BezierNode[] = [];
    private _bezier_list: Bezier[] = [];

    // ==========================================================================================
    // life cycle
    // ==========================================================================================
    
    onLoad() {
        let childCount = this.node.childrenCount;
        for (let i = childCount - 1; i >= 0; --i) {
            let isPoint = this.node.children[i].getComponent(BezierPoint);
            if (isPoint) {
                this.node.children.splice(i, 1);
            }
        }
        CC_EDITOR && cc.log("clear bezier nodes");

        this._unserializeBezier();
        this._isDirty = true;
    }

    start() {
        if (CC_EDITOR) {
            this.node.on(cc.Node.EventType.CHILD_REMOVED, (child: cc.Node) => {
                let comp_point = child.getComponent(BezierPoint);
                if (comp_point) {
                    this._pointRemoved(comp_point);
                }
            });

            this.node.on(cc.Node.EventType.CHILD_ADDED, (child: cc.Node) => {
                let comp_point = child.getComponent(BezierPoint);
                comp_point.editor = this;
                if (comp_point.pointType == PointType.Path) {
                    if (this._paths.some(each => each == comp_point)) {
                        return;
                    }
                    cc.log("add vertex");
                    this._appendBezierNode(comp_point);
                    this._paths.push(comp_point);
                    cc.log(`paths count = ${this._paths.length}`);
                }
                else {
                    cc.log("add ctrl");
                    this._attachToBezierNode(comp_point);
                }
                this._isDirty = true;
            });
        }
    }

    onDestroy() {
        cc.log(`remove event listeners`);
        this.node.off(cc.Node.EventType.CHILD_REMOVED);
        this.node.off(cc.Node.EventType.CHILD_ADDED);
    }

    update() {

        if (!this._isDirty) {
            return;
        }
        this._isDirty = false;

        // this._paths.forEach(each => each.node.active = this.showCtrlInfos);

        const c_red = cc.color(250, 42, 24);
        const c_yellow = cc.color(183, 240, 37);
        this.comp_graphic.clear();
        this._bezier_list.forEach(each => {
            let [start, end] = each;
            start.point.node.active = this.showCtrlInfos;
            start.ctrl && (start.ctrl.node.active = this.showCtrlInfos);
            end.point.node.active = this.showCtrlInfos;
            end.ctrl && (end.ctrl.node.active = this.showCtrlInfos);

            let [c1, c2] = each.map(e => e.ctrl);

            // let [end, start] = each;
            // let [c2, c1] = each.map(e => e.ctrl);

            let startPos = this._nodePosToGraphicPos(start.point.node.position);
            let endPos = this._nodePosToGraphicPos(end.point.node.position);

            this.comp_graphic.moveTo(startPos.x, startPos.y);
            if (c1 && c2) {
                let c1Pos = this._nodePosToGraphicPos(c1.node.position);
                let c2Pos = this._nodePosToGraphicPos(c2.node.position);
                
                this.comp_graphic.strokeColor = c_yellow;
                this.comp_graphic.bezierCurveTo(
                    c1Pos.x, c1Pos.y,
                    c2Pos.x, c2Pos.y, 
                    endPos.x, endPos.y
                );
                this.comp_graphic.stroke();

                if (this.showCtrlInfos) {
                    this.comp_graphic.strokeColor = c_red;
                    this.comp_graphic.moveTo(startPos.x, startPos.y);
                    this.comp_graphic.lineTo(c1Pos.x, c1Pos.y);
                    this.comp_graphic.stroke();
    
                    this.comp_graphic.strokeColor = c_red;
                    this.comp_graphic.moveTo(endPos.x, endPos.y);
                    this.comp_graphic.lineTo(c2Pos.x, c2Pos.y);
                    this.comp_graphic.stroke();
                }
            }
            else if (c1 || c2) {
                let c = c1 ? c1 : c2;
                let cPos = this.comp_graphic.node.convertToWorldSpaceAR(c.node.position);
                
                this.comp_graphic.strokeColor = c_yellow;
                this.comp_graphic.quadraticCurveTo(
                    cPos.x, cPos.y,
                    endPos.x, endPos.y
                );
                this.comp_graphic.stroke();

                if (this.showCtrlInfos) {
                    this.comp_graphic.strokeColor = c_red;
                    this.comp_graphic.moveTo(startPos.x, startPos.y);
                    this.comp_graphic.lineTo(cPos.x, cPos.y);
                    this.comp_graphic.lineTo(endPos.x, endPos.y);
                    this.comp_graphic.stroke();
                }
            }
            else {
                this.comp_graphic.strokeColor = c_yellow;
                this.comp_graphic.lineTo(endPos.x, endPos.y);
                this.comp_graphic.stroke();
            }
        });
    }

    // ==========================================================================================
    // public interfaces
    // ==========================================================================================
    
    public onPathPointDragging(point: BezierPoint, curPos: cc.Vec2) {
        point.node.position = this.node.convertToNodeSpaceAR(curPos);
        this._isDirty = true;
    }
    
    public onPathPointDragEnd(point: BezierPoint, endPos: cc.Vec2) {
        point.node.position = this.node.convertToNodeSpaceAR(endPos);
        this._serializeBezier();
        this._isDirty = true;
    }

    public onPathPointRemove(point: BezierPoint) {
        point.node.parent = null;
        this._pointRemoved(point);
    }

    public onPointMovedInEdit(p: BezierPoint) {
        this._isDirty = true;
        this._serializeBezier();
    }

    // ==========================================================================================
    // hooks of GestureRecognizer
    // ==========================================================================================
    
    public onDoubleClick(target: cc.Node, clickPos: cc.Vec2) {
        let pos = this.node.convertToNodeSpaceAR(clickPos);
        let comp_point = this._instantiatePoint(PointType.Path, pos);
        comp_point.node.parent = this.node;

        this._appendBezierNode(comp_point);
        this._paths.push(comp_point);
        this._isDirty = true;
    }

    public onLongTap(target: cc.Node, tapPos: cc.Vec2) {
        let pos = this.node.convertToNodeSpaceAR(tapPos);
        let comp_point = this._instantiatePoint(PointType.Control, pos);
        comp_point.node.parent = this.node;

        this._attachToBezierNode(comp_point);
        this._isDirty = true;
    }
    
    // ==========================================================================================
    // private interfaces
    // ==========================================================================================
    private _nodePosToGraphicPos(p: cc.Vec2) {
        return this.comp_graphic.node.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(p));
    }
    
    private _pointRemoved(p: BezierPoint) {
        if (p.pointType == PointType.Path) {
            let find = this._paths.indexOf(p);
            if (find >= 0) {
                this._paths.splice(find, 1);
                this._removeBezierNode(p);
                this._isDirty = true;
            }
        }
        else {
            let bezierNode = this._bezierNodes.find(each => each.ctrl == p);
            if (bezierNode) {
                bezierNode.ctrl = null;
                this._serializeBezier();
                this._isDirty = true;
            }
        }
    }

    private _attachToBezierNode(p: BezierPoint) {
        let tmp = this._bezierNodes
            .filter(each => !each.ctrl)
            .map(each => {
                let px = p.node.x;
                let distance = Math.abs(px - each.point.node.x);
                return {each, distance};
            })
            .sort((a, b) => a.distance - b.distance)
            .map(each => each.each);

        if (tmp) {
            let attach = tmp[0];
            attach.ctrl = p;
        }
    }

    private _updateBezierList() {
        let genBezier = (list: BezierNode[], result: Bezier[] = []) => {
            if (list.length < 2) {
                return;
            }
    
            let [start, second] = list;
            let bezier = [start, second] as Bezier;
            result.push(bezier);
            return genBezier(list.slice(2), result);
        }
        this._bezier_list = [];
        genBezier(this._bezierNodes, this._bezier_list);
        this._serializeBezier();
    }

    private _appendBezierNode(p: BezierPoint) {
        if (this._paths.length == 0) {
            return;
        }
        let start = new BezierNode();
        let end = new BezierNode();
        start.point = this._paths[this._paths.length - 1];
        end.point = p;
        this._bezierNodes = this._bezierNodes.concat([start, end]);
        this._updateBezierList();
    }

    private _removeBezierNode(point: BezierPoint) {
        if (this._bezierNodes.length == 0) {
            return;
        }

        let removeAttachedCtrl = (node: BezierNode) => {
            if (node.ctrl) {
                node.ctrl.node.parent = null;
            }
        };

        if (point.pointType == PointType.Path) {
            // head
            if (this._bezierNodes[0].point == point) {
                removeAttachedCtrl(this._bezierNodes[0]);
                removeAttachedCtrl(this._bezierNodes[1]);
                this._bezierNodes.splice(0, 2);
            }
            // tail
            else if (this._bezierNodes[this._bezierNodes.length - 1].point == point) {
                removeAttachedCtrl(this._bezierNodes.pop());
                removeAttachedCtrl(this._bezierNodes.pop());
            }
            // middle
            else {
                this._bezierNodes.forEach(each => {
                    if (each.point == point) {
                        removeAttachedCtrl(each);
                    }
                });
                this._bezierNodes = this._bezierNodes.filter(each => each.point != point);
            }
            this._updateBezierList();
        }
    }

    private _serializeBezier() {
        this.bezier_serialized = this._bezier_list.map(each => {
            let transWorld = cc.v2();
            let [start, end] = each;
            let serialize = new BezierSerialize();
            transWorld = this.node.convertToWorldSpaceAR(start.point.node.position);
            serialize.start = cc.v2(transWorld.x, transWorld.y);
            transWorld = this.node.convertToWorldSpaceAR(end.point.node.position);
            serialize.end =  cc.v2(transWorld.x, transWorld.y);
            serialize.ctrls = each.filter(ea => !!ea.ctrl).map(ea => {
                transWorld = this.node.convertToWorldSpaceAR(ea.ctrl.node.position);
                return cc.v2(transWorld.x, transWorld.y);
            });
            serialize.curveLength = serialize.calculateLength();
            return serialize;
        });
    }

    private _unserializeBezier() {
        this._paths = this.bezier_serialized
            .map(each => [each.start, each.end])
            .reduce((pre, cur) => pre.concat(cur), [])
            .reduce((pre, cur) =>{
                if (pre.find(e => e.x == cur.x && e.y == cur.y)) {
                    return pre;
                }
                return pre.concat([cur]);
            } , [])
            .map(each => {
                each = this.node.convertToNodeSpaceAR(each);
                return this._instantiatePoint(PointType.Path, each);
            });

        this._paths.forEach(each => each.node.parent = this.node);
        
        this._bezier_list = this.bezier_serialized.map(each => {
            let start = this._paths.find(e => e.node.position.equals(this.node.convertToNodeSpaceAR(each.start)));
            let end = this._paths.find(e => e.node.position.equals(this.node.convertToNodeSpaceAR(each.end)));

            let [startCtrl, endCtrl] = each.ctrls.map(e => {
                e = this.node.convertToNodeSpaceAR(e);
                let ctrlPoint = this._instantiatePoint(PointType.Control, e);
                ctrlPoint.node.parent = this.node;
                return ctrlPoint;
            });

            let startNode = new BezierNode();
            startNode.point = start;
            startNode.ctrl = startCtrl;
            
            let endNode = new BezierNode();
            endNode.point = end;
            endNode.ctrl = endCtrl;

            return [startNode, endNode];
        });
        this._bezierNodes = this._bezier_list.reduce((pre, cur) => pre.concat(cur), []);
    }

    private _instantiatePoint(type: PointType, pos: cc.Vec2) {
        const color = type == PointType.Path ? cc.Color.WHITE : cc.Color.GRAY;
        const size = type == PointType.Path ? cc.size(20, 20) : cc.size(15, 15);
        const name = type == PointType.Path ? "vertext" : "ctrl";

        let point = cc.instantiate(this.pref_point);
        point.name = name;
        point.position = pos;
        point.color = color;
        point.setContentSize(size);
        let comp_point = point.getComponent(BezierPoint);
        comp_point.editor = this;
        comp_point.pointType = type;
        return comp_point;
    }
}