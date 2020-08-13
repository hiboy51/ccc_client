/*
 * @Author: Kinnon.Z
 * @Date: 2020-08-12 16:53:13
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-08-13 15:17:05
 */

import { injectable } from "../../common/scripts/DI/DI";
import { bind } from "../../common/scripts/data_binding/DataBindingBin";

@injectable({
    factory: () => TestBindingDataCenter.get(),
})
export default class TestBindingDataCenter {
    private static _ins = new TestBindingDataCenter();
    public static get() {
        return TestBindingDataCenter._ins;
    }
    private _setterValue: string = "";

    @bind
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
    @bind
    public set member(b: boolean) {
        this._member = b;
    }

    _deferValue = 100;
    @bind(true)
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
    @bind
    public get listValue() {
        return this._listValue;
    }
}
