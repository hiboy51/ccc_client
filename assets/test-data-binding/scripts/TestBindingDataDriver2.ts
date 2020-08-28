import TestBindingDataCenter from "./TestBindingDataCenter";
import { inject } from "../../common/scripts/DI/DI";

/*
 * @Author: Kinnon.Z
 * @Date: 2020-08-12 17:31:17
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-08-28 11:00:10
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class TestBindingDataDriver2 extends cc.Component {
    @inject
    private _dataCenter: TestBindingDataCenter;
    // ? ===================================================================================
    // ? life cycle
    // ? ===================================================================================
    start() {
        this._dataCenter.deferValue = 22222;
        this._dataCenter.member = true;
        this._dataCenter.setterValue = "zhang san";
    }
}
