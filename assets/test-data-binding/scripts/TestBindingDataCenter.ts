/*
 * @Author: Kinnon.Z
 * @Date: 2020-08-12 16:53:13
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-08-13 11:13:18
 */

import { injectable } from "../../common/scripts/DI/DI";
import { binding } from "../../common/scripts/data_binding/DataBindingBin";

@injectable({
    factory: () => TestBindingDataCenter.get(),
})
export default class TestBindingDataCenter {
    private static _ins = new TestBindingDataCenter();
    public static get() {
        return TestBindingDataCenter._ins;
    }
    private _setterValue: string = "";

    @binding
    public set setterValue(v: string) {
        this._setterValue = v;
    }

    public get setterValue() {
        return this._setterValue;
    }

    _member = true;
    public get member() {
        return this._member;
    }
    @binding
    public set member(b: boolean) {
        this._member = b;
    }

    _deferValue = 100;
    @binding(true)
    public set deferValue(n: number) {
        this._deferValue = n;
    }
    public get deferValue() {
        return this._deferValue;
    }

    _listValue = [1, 2, 3, 4];
    public set listValue(l: number[]) {
        this._listValue = l;
    }
    @binding
    public get listValue() {
        return this._listValue;
    }
}
