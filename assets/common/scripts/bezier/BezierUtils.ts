/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/bezier/BezierUtils.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Tuesday, August 6th 2019, 11:09:50 am
 * Author: kinnonzhang
 * 
 * Copyright (c) 2019 Your Company
 */

export type QuadraticBezier = [cc.Vec2, cc.Vec2, cc.Vec2];
export type CubicBezier = [cc.Vec2, cc.Vec2, cc.Vec2, cc.Vec2];

export default class BezierUtils {

    /**
     * 某一点的切线方向
     * @param bezier 
     * @param t 取值[0, 1]
     */
    public static bezierTangent(bezier: CubicBezier, t: number) {
        let [p0, p1, p2, p3] = bezier;
        
        const u = 1 - t;
        const uu = u * u;
        const tu = t * u;
        const tt = t * t;

        let p = cc.v2();
        p.x = p0.x * 3 * uu * (-1.0);
        p.y = p0.y * 3 * uu * (-1.0);

        p.x += p1.x * 3 * (uu - 2 * tu);
        p.y += p1.y * 3 * (uu - 2 * tu);

        p.x += p2.x * 3 * (2 * tu - tt);
        p.y += p2.y * 3 * (2 * tu - tt);

        p.x += p3.x * 3 * tt;
        p.y += p3.y * 3 * tt;

        return p.normalize();
    }

    /**
     * 
     * @param bezier 
     * @param t 取值[0, 1]
     */
    public static bezierPoint(bezier: CubicBezier, t: number) {
        let [p0, p1, p2, p3] = bezier;

        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        let p = cc.v2();
        p.x = uuu * p0.x;
        p.y = uuu * p0.y;

        p.x += 3 * uu * t * p1.x;
        p.y += 3 * uu * t * p1.y;
    
        p.x += 3 * u * tt * p2.x;
        p.y += 3 * u * tt * p2.y;
    
        p.x += ttt * p3.x;
        p.y += ttt * p3.y;

        return p;
    }
    
    /**
     *  获取一个贝塞尔曲线的近似长度
     *  采用切割线段求和的方式取得近似值，切割的片段越多越精确
     */
    public static approximateLength(bezier: CubicBezier, accuracy: number = 50, graphic?: cc.Graphics): number {
        let lastPoint = BezierUtils.bezierPoint(bezier, 0.0);
        let curPoint: cc.Vec2;
        let length = 0;

        for (let i = 1; i <= accuracy; ++i) {
            curPoint = BezierUtils.bezierPoint(bezier, i / accuracy);
            length += (curPoint.sub(lastPoint)).mag();
            lastPoint = curPoint;
        }
        return length;
    }

    /**
     * 二阶贝塞尔曲线转三阶贝塞尔曲线
     * @param bezier 
     */
    public static quadraticToCubic(bezier: QuadraticBezier) {
        let [start, ctrl, end] = bezier;
        let ctrl1 = cc.v2(), ctrl2 = cc.v2();
        ctrl1.x = start.x + 2.0 / 3.0 * (ctrl.x - start.x);
        ctrl1.y = start.y + 2.0 / 3.0 * (ctrl.y - start.y);

        ctrl2.x = end.x + 2.0 / 3.0 * (ctrl.x - end.x);
        ctrl2.y = end.y + 2.0 / 3.0 * (ctrl.y - end.y);

        return [start, ctrl1, ctrl2, end];
    }
}