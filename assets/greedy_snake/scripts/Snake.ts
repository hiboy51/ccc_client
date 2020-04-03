/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-02 15:39:48
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-03 18:42:33
 */

import Segment, { ISegment, IInflectionPoint } from "./Segment";

const { ccclass, property } = cc._decorator;
export enum Part {
    HEAD = 1,
    BODY
}

export default class Snake implements ISegment {
    private _segment: Segment;
    private _type: Part;

    private _next: Snake;
    constructor(headSeg: Segment, type: Part = Part.BODY) {
        this._segment = headSeg;
        this._type = type;
        this._next = null;
    }

    // ? ===================================================================================
    // ? implementation
    // ? ===================================================================================
    public get next() {
        return this._next;
    }

    public conduct(snapShot: IInflectionPoint) {}

    public appendTo(last: Snake) {
        last._next = this;

        //* chain all segments
        let lastTail = last._segment.tail;
        this._segment.appendTo(lastTail);
        this._adjust(lastTail.dir);

        return this;
    }

    // ? ===================================================================================
    // ? public interfaces
    // ? ===================================================================================
    public place(container: cc.Node, pos: cc.Vec2, direction: cc.Vec2) {
        if (this._type == Part.BODY) {
            cc.log("it's not a correct way to place a snake without head");
            return;
        }
        this._segment.node.parent = container;
        this._segment.node.position = cc.v3(pos);
        this._segment.dir = direction;
        this._adjust(direction);
    }

    public step(dt: number, dir?: cc.Vec2) {
        if (this._type == Part.BODY) {
            cc.log("should apply on a snake head");
            return;
        }
        if (!dir) {
            //* 方向没变，按惯性移动
            this._segment.step(dt);
        } else {
            //* 通知下一个节点前方有拐点
            this._segment.dir = dir;
            this._segment.conduct(this._segment.snapshot());
            this._segment.step(dt);
        }
    }

    public getHeadWorldPos() {
        return this._segment.node.convertToWorldSpaceAR(cc.v2());
    }

    public getHeadDir() {
        return this._segment.dir;
    }

    public hitTest(nd: cc.Node) {
        let ndbox = nd.getBoundingBox();
        return this._segment.hitTest(ndbox);
    }

    // ? ===================================================================================
    // ? private interfaces
    // ? ===================================================================================
    private _adjust(forward: cc.Vec2 = cc.v2(1, 0)) {
        let container = this._segment.node.parent;
        if (!container) {
            return;
        }
        let last = this._segment;
        last.dir = forward;
        let curr = last.next;
        let toV3 = cc.v3(forward).normalize();
        while (curr) {
            let step = last.node.getBoundingBox().width + 2;
            curr.node.parent = container;
            curr.node.position = last.node.position.add(toV3.mul(-step));
            curr.dir = last.dir;
            last = curr;
            curr = last.next;
        }
    }
}
