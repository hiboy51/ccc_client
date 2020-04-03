/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-02 16:23:52
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-03 18:42:13
 */
const { ccclass, property } = cc._decorator;
export interface ISegment {
    next: ISegment;
    conduct(snapshot: IInflectionPoint): void;
    appendTo(last: ISegment): ISegment;
}

export interface IInflectionPoint {
    velocity: cc.Vec2;
    position: cc.Vec2;
}
@ccclass
export default class Segment extends cc.Component implements ISegment {
    private _next: Segment = null;
    private _velocity: cc.Vec2;
    private _reflectionPoint: IInflectionPoint[] = [];
    // ? ===================================================================================
    // ? implementaion
    // ? ===================================================================================
    public get next() {
        return this._next;
    }

    public conduct(snapShot: IInflectionPoint) {
        if (this._next) {
            this.next.pushInflectionPoint(snapShot);
        }
    }

    // ? ===================================================================================
    // ? public interfaces
    // ? ===================================================================================

    public pushInflectionPoint(p: IInflectionPoint) {
        this._reflectionPoint.push(p);
    }

    public set dir(d: cc.Vec2) {
        if (!d) {
            return;
        }
        this._velocity = d;
        let degree = cc.misc.radiansToDegrees(cc.v2(1, 0).signAngle(d));
        this.node.angle = degree;
    }

    public get dir() {
        return this._velocity;
    }

    public get tail() {
        let tail = this.next;
        let cur: Segment = this;
        while (tail) {
            cur = tail;
            tail = tail.next;
        }
        return cur;
    }

    public step(sec: number) {
        let deltaDir = this._velocity.mul(sec);
        let forcastPos = cc.v2(this.node.position).add(deltaDir);
        if (this._reflectionPoint.length != 0) {
            let rp = this._reflectionPoint[0];
            let position = rp.position;
            let p2f = forcastPos.sub(position);
            let err = p2f.mag();
            if (err == 0 || p2f.signAngle(this._velocity) == 0) {
                //* 判断是否到了拐点
                //* 若目标点到预测点的向量与速度同向，则判断为正确到达
                this.dir = rp.velocity;
                this.node.x = position.x;
                this.node.y = position.y;
                this._reflectionPoint.splice(0, 1);
                this.conduct(this.snapshot());
                let containErr = this._velocity.mul(err / this._velocity.mag());
                this.node.x += containErr.x;
                this.node.y += containErr.y;
            } else {
                //* 在到达拐点之前，继续按惯性移动
                this.node.x += deltaDir.x;
                this.node.y += deltaDir.y;
            }
        } else {
            //* 按惯性移动
            this.node.x += deltaDir.x;
            this.node.y += deltaDir.y;
        }
        if (this._next) {
            this._next.step(sec);
        }
    }

    public appendTo(seg: Segment) {
        seg._next = this;
        return this;
    }

    public snapshot(): IInflectionPoint {
        let velocity = this.dir;
        let position = cc.v2(this.node.position);
        return { position, velocity };
    }

    public hitTest(rect: cc.Rect) {
        let box = this.node.getBoundingBox();
        if (box.intersects(rect)) {
            return true;
        }
        if (this.next) {
            return this.next.hitTest(rect);
        }
        return false;
    }
}
