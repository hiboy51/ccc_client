import TestBindingDataCenter from "./TestBindingDataCenter";
import { inject } from "../../common/scripts/DI/DI";
import {
    listen,
    unRegister,
    DataBindingBin,
    register,
} from "../../common/scripts/data_binding/DataBindingBin";

/*
 * @Author: Kinnon.Z
 * @Date: 2020-08-12 17:22:26
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-08-13 11:49:54
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class TestBindingDataDriver extends cc.Component {
    @inject(TestBindingDataCenter)
    private _dataCenter: TestBindingDataCenter;

    // ? ===================================================================================
    // ? life cycle
    // ? ===================================================================================
    @register
    onLoad() {}

    start() {
        this._dataCenter.deferValue = 11111;
        this._dataCenter.deferValue = 2222;
        this._dataCenter.setterValue = "kinnon.zhang";
        this._dataCenter.setterValue = "ismole";
        this._dataCenter.member = false;

        this._dataCenter.listValue = [3, 5, 7, 9];
        this._dataCenter.listValue.push(11);

        this.scheduleOnce(() => {
            cc.director.loadScene("data-binding-2");
        }, 5);
    }

    update(dt: number) {
        DataBindingBin.get().step(dt);
    }

    @unRegister
    onDestroy() {}

    // ? ===================================================================================
    // ? data binding
    // ? ===================================================================================

    @listen(function () {
        return this._dataCenter;
    }, "setterValue")
    public onSetterValueVaries(newValue: string) {
        cc.log(`setter value changed to ${newValue}`);
    }

    @listen(function () {
        return this._dataCenter;
    }, "member")
    public onMemberVaries(newValue: boolean) {
        cc.log(`member value changed to ${newValue}`);
    }

    @listen(function () {
        return this._dataCenter;
    }, "deferValue")
    public onDeferValueVaries(newValue: number) {
        cc.log(`defer value changed to ${newValue}; log from Driver`);
    }

    @listen(function () {
        return this._dataCenter;
    }, "listValue")
    public onListValueVaries(newValue: number[]) {
        cc.log(`list value changed to ${newValue}`);
    }
}
