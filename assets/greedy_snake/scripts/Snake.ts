/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-02 15:39:48
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-07 22:20:40
 */

import Segment, { ISegment, IInflectionPoint } from "./Segment";
import Utils from "../../common/scripts/Utils";

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
        const w = this._segment.node.getBoundingBox().width + 2;
        this._segment.node.parent = lastTail.node.parent;
        this._segment.node.position = lastTail.node.position.add(
            cc.v3(lastTail.dir.normalize()).mul(-w)
        );
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

    public destroy() {
        let next = this._segment.next;
        this._segment.node.destroy();
        while (next) {
            next.node.destroy();
            next = next.next;
        }
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

    public get head() {
        if (this._type == Part.BODY) {
            return null;
        }
        return this._segment;
    }

    public get tail() {
        if (!this._next) {
            return this;
        }
        return this._next.tail;
    }

    public getHeadDir() {
        return this._segment.dir;
    }

    public hitTest(nd: cc.Node) {
        let ndbox = nd.getBoundingBox();
        return this._segment.hitTest(ndbox);
    }

    public hitBody() {
        let cur = this._segment;
        if (!this.next) {
            return false;
        }
        let next = this.next._segment;
        while (next) {
            if (Utils.ifIntersect(cur.node, next.node)) {
                return true;
            }
            next = next.next;
        }
        return false;
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
