import { CustomEventDefine } from "./ProjectEvents/CustomEventDefine";
import { ServeInEventDefine } from "./ProjectEvents/ServeInEventDefine";
import { ServeOutEventDefine } from "./ProjectEvents/ServeOutEventDefine";

declare function require(moduleName: string): any;

/** 协议注册文件 */
const CONFIG_FILES = [ServeInEventDefine, CustomEventDefine];

const COMMANDS = (function() {
    let all = {
        protocols: {},
        customs: {}
    };
    CONFIG_FILES.forEach(clz => {
        for (let k in clz) {
            if (k.indexOf("SEI_") == 0) {
                all.protocols[k] = clz[k];
            } else if (k.indexOf("CE_") == 0) {
                all.customs[k] = clz[k];
            }
        }
    });
    return all;
})();

export const getProtocolIdByKey = function(key: string) {
    for (let k in COMMANDS.protocols) {
        let v = COMMANDS.protocols[k];
        if (key == k || key == v) {
            return v;
        }
        if (key == v) {
            return v;
        }
    }

    for (let k in COMMANDS.customs) {
        let v = COMMANDS.customs[k];
        if (key == k || key == v) {
            return v;
        }
    }

    return null;
};

let dic_duplicated = {};

/**
 * 为了兼容服务器不同游戏不同协议号，但逻辑和数据结构都相同或相似
 * 可以指定某些协议号以与其相似的协议号转发
 * @param key 重复的key
 */
export function duplicated(key: string) {
    return (_, name: string) => {
        dic_duplicated[key] = name;
    };
}

export function getReferedKeyRecursively(key: string) {
    let dup = dic_duplicated[key];
    if (!dup) {
        return key;
    }
    return getReferedKeyRecursively(dup);
}

let dic_paired = {};

function getSendCodeByKey(key: string) {
    return Object.keys(ServeOutEventDefine).find(each => ServeOutEventDefine[each] == key);
}

export function roundtrip(ctorOrSendkey: any, propName?: string): any {
    if (typeof ctorOrSendkey == "string") {
        let sendKey = ctorOrSendkey as string;
        return (_, pn: string) => {
            dic_paired[pn] = sendKey;
        };
    } else {
        dic_paired[propName] = propName;
    }
}

export function getRoundtrip(backKey: string) {
    for (let k in dic_paired) {
        let pairedKey = dic_paired[k];
        if (ServeOutEventDefine[pairedKey] == backKey) {
            return ServeOutEventDefine[pairedKey];
        }
        if (getProtocolIdByKey(pairedKey) == backKey) {
            return getSendCodeByKey(k);
        }
    }
    return null;
}

export function fetchable(sendCode: string) {
    return Object.keys(dic_paired).some(each => ServeOutEventDefine[each] == sendCode);
}
