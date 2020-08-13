import PopupBase from "./PopupBase";

const { ccclass, property } = cc._decorator;
@ccclass
export class PopupManager extends cc.Component {
    @property({
        displayName: "模态弹窗预制体",
        type: [cc.Prefab],
    })
    prefab_array: cc.Prefab[] = [];

    @property({
        type: cc.Node,
    })
    nd_root: cc.Node = null;

    public static instance: PopupManager = null;
    private _popupPool: any = {};

    // ========================================================================================
    // life-cycle
    // ========================================================================================

    onLoad() {
        PopupManager.instance = this;

        this.initiate();
    }

    onDestroy() {
        for (let k in this._popupPool) {
            if (this._popupPool[k].node) {
                this._popupPool[k].node.destroy();
                delete this._popupPool[k];
            }
        }
        this._popupPool = {};

        PopupManager.instance = null;
    }

    // ==========================================================================================
    // public interfaces
    // ==========================================================================================
    public remove(popup: PopupBase, forceDel: boolean = false) {
        if (forceDel || !popup.cached) {
            for (let k in this._popupPool) {
                if (this._popupPool[k] == popup) {
                    this._popupPool[k].node.destroy();
                    delete this._popupPool[k];
                    break;
                }
            }
        }
    }

    // ========================================================================================
    // private interfaces
    // ========================================================================================

    private initiate() {
        console.assert(!!this.nd_root, "a node as nd_root must be specified for the 'PopupManager");

        this.prefab_array.forEach((each) => {
            let data = each.data;
            let compPopup = data.getComponent("PopupBase") as PopupBase;
            console.assert(!!compPopup, "Every popup must extend from 'Popup'");
            console.assert(
                compPopup.popupName != "",
                "Every popup must be specified a non-empty name"
            );

            let showFuncName = (compPopup.popupName as string)
                .split("")
                .map((each, idx) => (idx == 0 ? each.toUpperCase() : each))
                .join("");
            let closeFuncName = `$${showFuncName}`;

            this[showFuncName] = (...args: any[]) => {
                let comp: PopupBase = this._popupPool[showFuncName];
                let nd: cc.Node;
                if (comp) {
                    nd = comp.node;
                } else {
                    nd = cc.instantiate(each);
                    comp = nd.getComponent("PopupBase");
                    this._popupPool[showFuncName] = comp;
                }
                comp.setData.apply(comp, args);
                nd.parent = this.nd_root;
                return comp;
            };

            this[closeFuncName] = () => {
                let k = showFuncName;

                if (this._popupPool[k]) {
                    let comp = this._popupPool[k] as PopupBase;
                    if (comp.node.parent) {
                        comp.dispose();
                    }
                }
            };
        });
    }
}

function indexProxy(clazz: typeof PopupManager) {
    return new Proxy(clazz, {
        get: (target, name) => {
            let field = name in clazz ? target[name] : target.instance[name];
            return (
                field ||
                function () {
                    cc.log(`* Try to index a non-existed field: ${String(name)}; \
                * Maybe it has been deleted when PopupManager destroyed while scene changing \
                * Or no prefab named ${String(name)} registered on PopupManager`);
                }
            );
        },
    });
}

export default indexProxy(PopupManager);
