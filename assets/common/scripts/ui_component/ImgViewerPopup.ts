import PopupBase from "../PopupBase";
import PM from "../PopupManager";

/*
 * File: ImgViwerPopup.ts
 * File Created: Thursday, 27th February 2020 6:33:26 pm
 * Author: Kinnon.Z
 * Summary:
 *
 * -----
 * Last Modified: Thursday, 27th February 2020 6:33:36 pm
 * Modified By: Kinnon.Z
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class ImgViewerPopup extends PopupBase {
    @property(cc.Sprite)
    sp_img: cc.Sprite = null;

    private _imgUrl: string;
    // ====================================================================================
    // override
    // ====================================================================================
    public setData(imgUrl: string) {
        this._imgUrl = imgUrl;
        super.setData(imgUrl);
    }

    protected _initView() {
        cc.loader.load(this._imgUrl, (err, texture) => {
            if (!this && !this.node && !this.node.parent) {
                return;
            }
            if (err) {
                PM.Tips("加载图片失败");
                this.dispose();
                return;
            }
            let spf = new cc.SpriteFrame(texture);
            this.sp_img.spriteFrame = spf;
            let { width: imgWidth, height: imgHeight } = spf.getRect();
            let { width: winWidth, height: winHeight } = cc.winSize;

            cc.log(`img size => ${imgWidth}:${imgHeight}`);
            cc.log(`texture property => rotate: ${spf.isRotated}`);
            cc.log(`window size => ${winWidth}: ${winHeight}`);
            let displayWidth = 0,
                displayHeight = 0;
            if (imgWidth < winWidth && imgHeight < winHeight) {
                displayWidth = imgWidth;
                displayHeight = imgHeight;
            } else {
                let wRatio = winWidth / imgWidth;
                let hRatio = winHeight / imgHeight;
                let ratio = Math.min(wRatio, hRatio);
                displayWidth = imgWidth * ratio;
                displayHeight = imgHeight * ratio;
            }
            this.sp_img.node.width = displayWidth;
            this.sp_img.node.height = displayHeight;
        });
    }
}
