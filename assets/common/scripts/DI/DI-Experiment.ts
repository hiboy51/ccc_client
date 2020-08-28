/*
 * @Author: Kinnon.Z
 * @Date: 2020-08-28 10:43:50
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-08-28 19:47:15
 */

import "reflect-metadata";
import { Injector, inject } from "./DI";

function decClass<T extends { new (...args: any[]): {} }>(ctor: T) {
    let params = Reflect.getMetadata("design:paramtypes", ctor);
    console.log(params.map((each) => each.name).join(","));
    return class extends ctor {
        constructor(...args: any[]) {
            super(...args);
        }
    };
}

class Logger {
    warn(...args: any[]) {}

    error(...args: any[]) {}

    log(...args: any[]) {}

    info(...args: any[]) {}
}

Injector.get().registerService(Logger, {
    factory: () => {
        return (console as unknown) as Logger;
    },
});

function decMem(proto: any, propName: string) {
    let type = Reflect.getMetadata("design:type", proto, propName) || [];
    console.log("===============");
    console.log(Object.keys(type));
}

@decClass
class TestReflect {
    constructor(private _a: string, public b: number, protected c?: boolean) {}
    @inject
    public mem: Logger;
}

// @decClass
class TestReflect1 {}

let inst = new TestReflect("", 1);
inst.mem.warn("~~~~~~");
