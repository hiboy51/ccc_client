import Utils from "../../common/scripts/Utils";

const { ccclass, property } = cc._decorator;
@ccclass
export default class TestGraySprite extends cc.Component {
    @property(cc.Sprite)
    spTest: cc.Sprite = null;

    private mGray = false;

    // ====================================================================================
    // life cycle
    // ====================================================================================
    onEnable() {
        this.mGray = false;
        Utils.gray(this.spTest.node, false);
    }
    // ====================================================================================
    // public interfaces
    // ====================================================================================
    public set gray(b: boolean) {
        if (this.mGray == b) {
            return;
        }
        cc.log(`turn sprite ${b ? "gray" : "not gray"}`);
        this.mGray = b;
        Utils.gray(this.spTest.node, this.mGray);
    }

    public get gray() {
        return this.mGray;
    }
    // ====================================================================================
    // ui event handler
    // ====================================================================================
    public onBtnGray() {
        this.gray = !this.gray;
    }
}
