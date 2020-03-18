
const {ccclass, property} = cc._decorator;

@ccclass
export default class Circle extends cc.Component {
    private sprite: cc.Sprite;
    private material: any;

    start() {
        this.sprite = this.node.getComponent(cc.Sprite);
        this.material = this.sprite.getMaterial(0);   //获取材质 
    }

    update(dt) {
        let frame = this.sprite.spriteFrame as any;
        if (!frame) {
            return;
        }
        let l = 0,r = 0,b = 1,t = 1;
        l = frame.uv[0];
        t = frame.uv[5];
        r = frame.uv[6];
        b = frame.uv[3];
        let u_UVoffset = new cc.Vec4(l,t,r,b);
        let u_rotated = frame.isRotated() ? 1.0 : 0.0;
        this.material.setProperty("u_UVoffset",u_UVoffset);
        this.material.setProperty("u_rotated",u_rotated);
    }
    
}
