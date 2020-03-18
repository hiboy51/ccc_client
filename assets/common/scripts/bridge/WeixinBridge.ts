// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class WeixinBridge {
    public static readonly Instance: WeixinBridge = new WeixinBridge();

    private loginListener: Function;
    // update (dt) {}

    public registerWx() {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/SYWXAdapter",
                "registerWX",
                "()V"
            );
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("WXAdapter", "registerWX");
        }
    }

    public authWx() {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SYWXAdapter", "authWX", "()V");
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("WXAdapter", "authWX");
        }
    }

    public registWxLoginListener(func: Function) {
        this.loginListener = func;
    }

    public static onAuthWxCallback(code: string) {
        WeixinBridge.Instance.loginListener(code);
    }
}

cc["WeixinBridge"] = WeixinBridge;
