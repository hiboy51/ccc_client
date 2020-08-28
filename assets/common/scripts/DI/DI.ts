/*
 * File: DI.ts
 * File Created: Tuesday, 10th December 2019 2:00:24 pm
 * Author: Kinnon.Z
 * Summary:
 *    A very simple implementation of [Dependency Inject] system.
 * -----
 * Last Modified: Tuesday, 10th December 2019 3:46:04 pm
 * Modified By: Kinnon.Z
 */

import "reflect-metadata";

const BaseType = [Object, String, Number, Array];

// ====================================================================================
// extra function name
// ====================================================================================
export function funcName(f: Function) {
    return f.prototype.name || f.toString().match(/function\s*([^(]*)\(/)[1];
}

// ====================================================================================
// decorators
// ====================================================================================
export function inject(proto: Object, propName: string): void {
    let ctor = Reflect.getMetadata("design:type", proto, propName);
    if (BaseType.find((each) => each == ctor)) {
        return;
    }
    let service = Injector.get().getAvailableService(ctor);
    if (service) {
        proto[propName] = service;
    } else {
        throw new Error(`service ${funcName(ctor)} not registered`);
    }
}
interface Injectable<T> {
    factory?: () => T;
    share?: boolean;
}

interface Constructor<T> {
    new (...args: any[]): T;
}

export function injectable<T>(ctor: Constructor<T>): void;
export function injectable<T>(conf: Injectable<T>): (ctor: Constructor<T>) => void;
export function injectable<T>(share: boolean): (ctor: Constructor<T>) => void;
export function injectable<T>(arg: boolean | Constructor<T> | Injectable<T>) {
    if (typeof arg == "boolean") {
        return function (ctor: Constructor<T>) {
            Injector.get().registerService(ctor, { share: arg });
        };
    } else if (typeof arg == "object") {
        return function (ctor: Constructor<T>) {
            arg.share = arg.share || true;
            Injector.get().registerService(ctor, arg);
        };
    } else {
        cc.log(arg.name);
        let params = Reflect.getMetadata("design:paramtypes", arg);
        cc.log(params);
        Injector.get().registerService(arg, { share: true });
    }
}

// ====================================================================================
// injector
// ====================================================================================
export class Injector {
    private static inst: Injector = new Injector();
    private _cache = new Map();
    private _injectable = new Map();

    public static get(): Injector {
        return Injector.inst;
    }

    public registerService<T>(ctor: Constructor<T>, conf: Injectable<T>) {
        conf.share = !!conf.share;
        conf.factory =
            conf.factory ||
            (() => {
                let params = Reflect.getMetadata("design:paramtypes", ctor) || [];
                params = params.map((each) => {
                    this.getAvailableService(each);
                });
                return new ctor(...params);
            });
        this._injectable.set(ctor, conf);
    }

    public getAvailableService<T>(cons: Constructor<T>): T {
        let conf = this._injectable.get(cons);
        if (!conf) {
            return;
        }
        let share = conf.share;
        if (!share) {
            return conf.factory();
        }
        let inst = this._cache.get(cons);
        if (!inst) {
            inst = conf.factory();
            this._cache.set(cons, inst);
        }
        return inst;
    }

    public unregisterService<T>(cons: Constructor<T>): void;
    public unregisterService<T>(cons: Constructor<T>[]): void;
    public unregisterService<T>(cons: Constructor<T> | Constructor<T>[]) {
        if (Array.isArray(cons)) {
            cons = cons.filter((each, index, arr) => index == arr.indexOf(each));
            cons.forEach((each) => {
                this._cache.delete(each);
                this._injectable.delete(each);
            });
        } else {
            this._injectable.delete(cons);
            this._cache.delete(cons);
        }
    }
}
