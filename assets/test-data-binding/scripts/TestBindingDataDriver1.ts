import { register, unRegister, listen } from "../../common/scripts/data_binding/DataBindingBin";
import { inject } from "../../common/scripts/DI/DI";
import TestBindingDataCenter from "./TestBindingDataCenter";

/*
 * @Author: Kinnon.Z
 * @Date: 2020-08-13 11:45:00
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-08-28 11:00:23
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class TestBindingDataDriver1 extends cc.Component {
    @inject
    private _data: TestBindingDataCenter;
    // ? ===================================================================================
    // ? life cycle
    // ? ===================================================================================
    @register
    onLoad() {}

    @unRegister
    onDestroy() {}

    start() {}

    // ? ===================================================================================
    // ? listeners
    // ? ===================================================================================
    @listen(function () {
        return this._data;
    }, "deferValue")
    onDeferValueVaries(newValue: string) {
        cc.log(`defer value changed to ${newValue}; log from Driver1`);
    }
}
