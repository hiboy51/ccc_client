import SpriteLabel from "./SpriteLabel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockTimer extends cc.Component {
    @property(cc.Label)
    timerLabel: cc.Label = null;

    @property(cc.Node)
    spriteLabelNode: cc.Node = null;

    private remainTimes: number = 0;
    private callBack: Function = null;
    private frameCallBack: Function = null;
    private formatTwoNumber: boolean = true;

    onLoad() {
        this.updateLabel(this.remainTimes);
    }

    public startTimer(
        times: number,
        callBack: Function = null,
        formatTwoNumber: boolean = true,
        frameCallBack?: Function
    ) {
        this.stopTimer();
        this.remainTimes = times;
        this.callBack = callBack;
        this.formatTwoNumber = formatTwoNumber;
        this.frameCallBack = frameCallBack;
        this.updateLabel(this.remainTimes);
        this.schedule(this.updateCd.bind(this), 1, times - 1, 0);
    }

    public stopTimer() {
        this.unscheduleAllCallbacks();
    }

    private updateCd() {
        this.remainTimes = this.remainTimes - 1;
        if (this.remainTimes <= 0) {
            //this.unschedule(this.updateCd);
            this.updateLabel(0);
            if (this.callBack) {
                this.callBack();
            }
        } else {
            this.updateLabel(this.remainTimes);
            if (this.frameCallBack) {
                this.frameCallBack(this.remainTimes);
            }
        }
    }

    private updateLabel(times: number) {
        let str = this.formatTwoNumber ? this.getStr(times) : String(times);
        if (this.timerLabel) {
            this.timerLabel.string = str;
        }

        if (this.spriteLabelNode) {
            let spritelabel = this.spriteLabelNode.getComponent(SpriteLabel);
            if (spritelabel) {
                spritelabel.string = str;
            }
        }
    }

    private getStr(times: number) {
        let str = String(times);
        if (times < 10) {
            str = "0" + times;
        }
        return str;
    }
}
