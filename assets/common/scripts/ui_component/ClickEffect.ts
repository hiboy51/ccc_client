import AudioMgr from "../audio_manager/AudioMgr";

/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/ClickEffect.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Tuesday, July 16th 2019, 5:05:13 pm
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class ClickEffect extends cc.Component {
    @property
    sound_url: string = "common/Click";

    // ====================================================================================
    // life cycle
    // ====================================================================================
    onLoad() {
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "ClickEffect";
        handler.handler = "onButtonClick";

        let btnComp = this.node.getComponent(cc.Button);
        btnComp.clickEvents.push(handler);
    }

    // ====================================================================================
    // public interfaces
    // ====================================================================================
    public onButtonClick() {
        AudioMgr.playEffect(this.sound_url);
    }
}
