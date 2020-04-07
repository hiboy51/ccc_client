/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-02 16:23:52
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-07 20:16:29
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
    private _originW: number;
    //* 膨胀阶段（用于消除拐角误差）
    private _expanding: boolean;
    //* 膨胀步长
    private _expandStep: number;
    // ? ===================================================================================
    // ? life cycle
    // ? ===================================================================================
    onLoad() {
        this._originW = this.node.width;
    }
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
                //* 消除转角误差
                let v = this._velocity.mag();
                let containErr = this._velocity.mul(err / v);
                this.node.x += containErr.x;
                this.node.y += containErr.y;
                if (err > 0) {
                    this.node.width = Math.min(err / this.node.scaleX, this._originW);
                } else {
                    this.node.width = 0;
                }
                this._expanding = true;
                this._expandStep = v * sec;
            } else {
                //* 在到达拐点之前，继续按惯性移动
                this.node.x += deltaDir.x;
                this.node.y += deltaDir.y;

                //* 膨胀算法， 消除拐角误差
                if (this._expanding) {
                    let w = this.node.width + this._expandStep;
                    if (w >= this._originW) {
                        this.node.width = this._originW;
                        this._expanding = false;
                    } else {
                        this.node.width = w;
                    }
                }
            }
        } else {
            //* 按惯性移动
            this.node.x += deltaDir.x;
            this.node.y += deltaDir.y;

            //* 膨胀算法， 消除拐角误差
            if (this._expanding) {
                let w = this.node.width + this._expandStep;
                if (w >= this._originW) {
                    this.node.width = this._originW;
                    this._expanding = false;
                } else {
                    this.node.width = w;
                }
            }
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

    public hitTest(rect: cc.Rect, trans: boolean = true) {
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
