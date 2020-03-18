import Utils from "../Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpriteLabel extends cc.Component {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Integer)
    spacingX: number = 0;

    @property(cc.String)
    spritePrefix: string = "";

    private _string: string = "";

    onLoad() {
        let layout = this.node.getComponent(cc.Layout);
        if (!layout) {
            layout = this.node.addComponent(cc.Layout);
            layout.type = cc.Layout.Type.HORIZONTAL;
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            layout.spacingX = this.spacingX;
        }
    }

    public get string() {
        return this._string;
    }

    public set string(value) {
        this._string = value;
        this.updateString();

        // dot
        for (let i = 0; i < this.node.childrenCount; ++i) {
            let n = this.node.children[i];
            if (n.name == "d") {
                n.y = -n.height;
            }
        }
        // let dot = this.node.getChildByName("d");
        // if (dot) {
        //     dot.y = -dot.height;
        // }
    }

    private updateString() {
        for (let i = 0; i < this.node.children.length; ++i) {
            this.node.children[i].active = false;
        }
        let tranStr = Utils.tranNumberDotToStringForSpritLable(this._string);
        for (let i = 0; i < tranStr.length; ++i) {
            let char = tranStr.charAt(i);
            let node = this.node.children[i];
            if (!node) {
                node = new cc.Node(char);
                node.addComponent(cc.Sprite);
                this.node.addChild(node);
            }
            node.name = char;
            node.y = 0;
            node.active = true;
            node.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(
                this.spritePrefix + char
            );
        }
    }
}
