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

// ====================================================================================
// extra function name
// ====================================================================================
export function funcName(f: Function) {
    return f.prototype.name || f.toString().match(/function\s*([^(]*)\(/)[1];
}

// ====================================================================================
// decorators
// ====================================================================================
export function inject<T extends { new (): {} }>(constructor: T) {
    return (obj: any, propName: string) => {
        let prop = obj[propName];
        if (prop) {
            return;
        }
        let service = Injector.get().getAvailableService(constructor);
        if (service) {
            obj[propName] = service;
        } else {
            throw new Error(`service ${funcName(constructor)} not registered`);
        }
    };
}

interface Injectable {
    factory: () => Object;
}
export function injectable(meta: Injectable): Function;
export function injectable<T extends { new (): {} }>(constructor: T): void;
export function injectable<T extends { new (): {} }>(args: T | Injectable) {
    if (typeof args == "function") {
        Injector.get().registerService(args);
    } else {
        return (constructor: T) => {
            Injector.get().registerService(constructor, args.factory);
        };
    }
}

// ====================================================================================
// injector
// ====================================================================================
export class Injector {
    private static inst: Injector = new Injector();
    private _cache: Map<Function, object> = new Map<Function, object>();

    public static get(): Injector {
        return Injector.inst;
    }

    public registerService<T extends { new (): {} }>(cons: T, factory?: () => any) {
        let inst = this._cache.get(cons);
        if (inst) {
            return;
        }
        if (factory) {
            inst = factory();
            inst && this._cache.set(cons, inst);
        } else {
            inst = new cons();
            this._cache.set(cons, inst);
        }
    }

    public getAvailableService<T extends { new (): {} }>(cons: T) {
        let inst = this._cache.get(cons);
        return inst;
    }

    public unregisterService<T extends { new (): {} }>(cons: T): void;
    public unregisterService<T extends { new (): {} }>(cons: T[]): void;
    public unregisterService<T extends { new (): {} }>(cons: T | T[]) {
        if (Array.isArray(cons)) {
            cons = cons.filter((each, index, arr) => index == arr.indexOf(each));
            cons.forEach((each) => this._cache.delete(each));
        } else {
            this._cache.delete(cons);
        }
    }
}
