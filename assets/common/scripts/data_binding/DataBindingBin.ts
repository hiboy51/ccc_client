/*
 * @Author: Kinnon.Z
 * @Date: 2020-08-12 14:54:18
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-08-13 11:58:32
 */

/* 用法参考
/* DataSource.ts
Class DataSource {
   /*
   /* 必须定义setter & getter
   /* 

  _field: number = 1;
   @binding /* 默认绑定，数据改变立即广播
   public set field(n: number) {this._field = n;}
   public get field() {return this._field;}

   _property: string = "abc";
   @binding(true) /* 延迟绑定。数据改变后在下一帧广播,适用于高频改变的数据。（需逐帧执行step方法）
   public set property(s: string) {this._property = s;}
   public get property() {return this._property;}
}

/* application.ts
class Context extends cc.Component {
    public dataSource: DataSource;

    @register /* 注册监听
    onLoad(){}

    @unRegister /* 注销监听
    onDestroy{}

    /* 标记绑定。Provider不能使用箭头函数
    @listen(function(){return this.dataSource;}, "field") 
    public onFieldVaries(newValue: number){
        /* field值改变时回调
    }

    @listen(function(){return this.dataSource;}, "property")
    public onPropertyVaries(newValue: string) {
        /* property值改变时回调
    }
}
*/

//! 要触发绑定，必须以显示赋值的方式(<bind>.a = value)
//! 即直接对对象操作的情况下无法正确工作，切记！切记！

// ? ===================================================================================
// ? decorators
// ? ===================================================================================

/**
 * 用于要绑定的成员变量
 * @param owner
 * @param fieldName
 * @param defer 是否延迟到下一帧执行。对于频繁变化的数据可以降低广播的频率
 */
export function binding(defer: boolean): Function;
export function binding(prototype: object, fieldName: string, desc: PropertyDescriptor): void;
export function binding(
    prototype: object | boolean,
    fieldName?: string,
    desc?: PropertyDescriptor
) {
    if (typeof prototype == "boolean") {
        return function (o: object, f: string, desc: PropertyDescriptor) {
            _binding(o, f, desc, prototype);
        };
    } else {
        _binding(prototype, fieldName, desc, false);
    }
}

function _binding(
    prototype: object,
    fieldName: string,
    descriptor: PropertyDescriptor,
    defer: boolean
) {
    let bin = DataBindingBin.get();
    let setter = descriptor.set;
    let privateName = `_${fieldName}`;
    descriptor.set = function (v) {
        let oldValue = this[fieldName];
        if (typeof v != "object" && oldValue == v) {
            return;
        }
        if (setter) {
            setter.call(this, v);
        } else {
            this[privateName] = v;
        }
        if (defer) {
            bin.defer(this, fieldName);
        } else {
            bin.notify(this, fieldName, v);
        }
    };
}

/**
 * 显式注册该对象下的所有绑定监听
 * ! 因为只有在方法运行时才能拿到真正的this对象。所以无法绕过在运行时显式调用注册
 * @param prototype
 * @param funcName
 * @param desc
 */
type RegisterProfile = {
    provider: any;
    fieldName: string;
    listenerName: string;
};
export function register(prototype: any, funcName: string, desc: PropertyDescriptor) {
    let originalFunc = desc.value;
    desc.value = function (...args: any[]) {
        let bin = DataBindingBin.get();
        let toRegisterList: RegisterProfile[] = prototype.db_listeners || [];
        toRegisterList.forEach((each) => {
            let { provider, fieldName, listenerName } = each;
            bin.bind(provider.bind(this).call(this), fieldName, this, this[listenerName]);
        });
        delete prototype.db_listeners;
        originalFunc.apply(this, args);
    };
}

/**
 * 用于标记一个绑定监听
 * ! 不能使用箭头函数, 因为箭头函数的this不能改变
 * @param ownerProvider 返回数据对象的闭包
 * @param setterName setter名字
 */
export function listen(ownerProvider: () => any, setterName: string) {
    return function (prototype: any, handlerName: string, desc: PropertyDescriptor) {
        prototype.db_listeners = prototype.db_listeners || [];
        let profile: RegisterProfile = {
            provider: ownerProvider,
            fieldName: setterName,
            listenerName: handlerName,
        };
        prototype.db_listeners.push(profile);
    };
}

/**
 * 用于解绑一个监听者上所有的监听
 * @param prototype
 * @param handlerName
 * @param desc
 */
export function unRegister(prototype: any, handlerName: string, desc: PropertyDescriptor) {
    let originalFunc = desc.value;
    //* override
    desc.value = function (...args: any[]) {
        let bin = DataBindingBin.get();
        bin.unBindAllForTarget(this);
        originalFunc.apply(this, args);
    };
}

// ? ===================================================================================
// ? Bin
// ? ===================================================================================

type BindingProfile = {
    invoker: any;
    handler: Function;
};

type DeferDescribe = { owner: any; fieldName: string };
type DataSource = any;
type FieldName = string;
export class DataBindingBin {
    private static _ins: DataBindingBin = new DataBindingBin();
    public static get() {
        return DataBindingBin._ins;
    }

    private _bindMap: Map<DataSource, Map<FieldName, BindingProfile[]>> = new Map();
    private _deferList: DeferDescribe[] = [];

    // ? ===================================================================================
    // ? step
    // ? ===================================================================================
    public step(dt: number) {
        let defers = this._deferList.splice(0);
        defers.forEach((each) => {
            let { owner, fieldName } = each;
            if (!owner) {
                return;
            }
            this.notify(owner, fieldName, owner[fieldName]);
        });
    }

    // ? ===================================================================================
    // ? public interfaces
    // ? ===================================================================================
    public defer(owner: any, fieldName: string) {
        let exist = this._deferList.find((each) => {
            let { owner: o, fieldName: n } = each;
            return o == owner && n == fieldName;
        });
        if (!exist) {
            this._deferList.push({ owner, fieldName });
        }
    }

    public unBindAllForTarget(target: any) {
        for (let [, value] of this._bindMap) {
            for (let [, profile] of value) {
                let len = profile.length;
                for (let i = len - 1; i >= 0; --i) {
                    let { invoker } = profile[i];
                    if (invoker == target) {
                        profile.splice(i, 1);
                    }
                }
            }
        }
    }

    public bind(dataOwner: any, fieldName: string, listener: any, handler: Function) {
        let map = this._bindMap.get(dataOwner);
        if (!map) {
            let genMap = new Map<FieldName, BindingProfile[]>();
            genMap.set(fieldName, [{ invoker: listener, handler }]);
            this._bindMap.set(dataOwner, genMap);
        } else {
            let profiles = map.get(fieldName);
            if (!profiles) {
                map.set(fieldName, [{ invoker: listener, handler }]);
            } else {
                //* 去重
                let find = profiles.find(
                    (each) => each.invoker == listener && each.handler == handler
                );
                if (!find) {
                    profiles.push({ invoker: listener, handler });
                }
            }
        }
    }

    public notify(dataOwner: any, fieldName: string, newValue: any) {
        let map = this._bindMap.get(dataOwner);
        if (!map) {
            return;
        }
        let profiles = map.get(fieldName);
        if (!profiles || profiles.length == 0) {
            return;
        }
        profiles.forEach((each) => {
            let { invoker, handler } = each;
            if (!invoker) {
                return handler(newValue);
            }
            let meta = [dataOwner, fieldName];
            handler.call(invoker, newValue, meta);
        });
    }
}
