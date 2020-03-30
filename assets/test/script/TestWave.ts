/*
 * @Author: Kinnon.Z
 * @Date: 2020-03-30 11:03:26
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-03-30 11:05:25
 */

import WaveEffect from "../../common/scripts/effects/Wave";

const { ccclass, property } = cc._decorator;
@ccclass
export default class TestWave extends cc.Component {
    @property(WaveEffect)
    comp_wave: WaveEffect = null;

    // ? ===================================================================================
    // ? ui events
    // ? ===================================================================================
    public onBtnUseWave() {
        if (this.comp_wave) {
            this.comp_wave.use = !this.comp_wave.use;
        }
    }
}
