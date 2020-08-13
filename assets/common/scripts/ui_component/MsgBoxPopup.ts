import PopupBase from "../popup_manager/PopupBase";

/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/MsgBoxPopup.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Wednesday, July 3rd 2019, 2:50:05 pm
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */
const { ccclass, property } = cc._decorator;

export type MsgBoxOption = {
    optionCode: number; // 0 ok, 1 cancel
    onClick?: () => void; // 按钮事件
    name?: string; // 按钮文字
    hide?: boolean; // 是否隐藏
};

@ccclass
export default class MsgBoxPopup extends PopupBase {
    @property(cc.Label)
    lbl_ok: cc.Label = null;

    @property(cc.Node)
    nd_ok: cc.Node = null;

    @property(cc.Label)
    lbl_cancel: cc.Label = null;

    @property(cc.Node)
    nd_cancel: cc.Node = null;

    @property(cc.Label)
    lbl_content: cc.Label = null;

    private _msg: string = "";
    private _options: MsgBoxOption | MsgBoxOption[] = null;
    private _initiate: boolean = false;

    // ====================================================================================
    // life cycle
    // ====================================================================================
    start() {
        if (!this._initiate) {
            this._initiate = true;
            this._init();
        }
    }

    // ====================================================================================
    // private interfaces
    // ====================================================================================
    private _init() {
        this.lbl_content.string = this._msg;
        let optionOk = this._extractOption(0);
        if (optionOk) {
            this.nd_ok.active = !optionOk.hide;
            optionOk.name && (this.lbl_ok.string = optionOk.name);
        }

        let optionCancel = this._extractOption(1);
        if (optionCancel) {
            this.nd_cancel.active = !optionCancel.hide;
            optionCancel.name && (this.lbl_cancel.string = optionCancel.name);
        }
    }

    /**
     * 提取选项配置
     * @param optionCode 0 确认， 1 取消
     */
    private _extractOption(optionCode: number) {
        if (!this._options) {
            return null;
        }

        if (Array.isArray(this._options)) {
            return this._options.find((each) => each.optionCode == optionCode);
        }

        return this._options.optionCode == optionCode ? this._options : null;
    }

    // ====================================================================================
    // virtual
    // ====================================================================================
    public setData(msg: string, options?: MsgBoxOption | MsgBoxOption[]) {
        this._msg = msg;
        this._options = options;
        if (this._initiate) {
            this._init();
        }
    }

    // ====================================================================================
    // on button click
    // ====================================================================================
    public async onBtnOk() {
        await this.dispose();
        let option = this._extractOption(0);
        option && option.onClick && option.onClick();
    }

    public async onBtnCancel() {
        await this.dispose();
        let option = this._extractOption(1);
        option && option.onClick && option.onClick();
    }
}
