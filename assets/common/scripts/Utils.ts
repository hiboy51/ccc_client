import { GlobalDataCenter } from "./GlobalDataCenter";
import ProjectConfigs from "./ProjectConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class Utils {
    private static dr: cc.Size;
    private static transMatrix: cc.Mat4 = cc.mat4();

    public static resize() {
        let canvas = cc.find("Canvas").getComponent(cc.Canvas);
        if (!this.dr) {
            this.dr = canvas.designResolution;
        }
        let size = cc.view.getFrameSize();
        let frameWidth = size.width;
        let frameHeight = size.height;
        let drWidth = this.dr.width;
        let drHeight = this.dr.height;

        let scaleX = frameWidth / drWidth || 0;
        let scaleY = frameHeight / drHeight || 0;

        if (scaleX > scaleY) {
            drWidth = Math.round(frameWidth / scaleY);
        } else {
            drHeight = Math.round(frameHeight / scaleX);
        }
        canvas.designResolution = cc.size(drWidth, drHeight);
        canvas.node.width = drWidth;
        canvas.node.height = drHeight;
        canvas.node.emit("resize");
    }

    public static resizeBg(bg: cc.Node) {
        let canvas = cc.find("Canvas");
        let size = cc.size(1334, 750);
        let scaleX = canvas.width / size.width;
        let scaleY = canvas.height / size.height;
        let scale = Math.max(scaleX, scaleY);
        // let bg = cc.find('Canvas/root/bg');
        bg.scale = scale;
    }

    /**
     * 加载场景
     * @param sceneName 场景名，如果是子包则子包名和场景名需要相同
     * @param sub 是否是子包
     */
    public static async loadScene(sceneName, sub = false) {
        await new Promise((resolve, reject) => {
            if (CC_JSB || CC_DEV || !sub) {
                cc.director.loadScene(sceneName, () => {
                    resolve();
                });
            } else {
                cc.loader.downloader.loadSubpackage(sceneName, function(err) {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    cc.log("loadSubpackage: " + sceneName);
                    cc.director.loadScene(sceneName, () => {
                        resolve();
                        console.log("---------------------loadScene---------------------");
                        let data = { id: GlobalDataCenter.Instance.playerId, scene: sceneName };
                        Utils.saveLog();
                        console.log("=====================loadScene=====================");
                    });
                });
            }
        });
    }

    public static getUrlPara(): any {
        let href = window.location.href;
        //获取问号
        var args = href.split("?");
        //无传入参数
        if (args[0] == href) {
            return "";
        }
        //对？后的参数进行处理
        var arr = args[1].split("&");
        var obj = {};
        for (var i = 0; i < arr.length; i++) {
            var arg = arr[i].split("=");
            obj[arg[0]] = arg[1];
        }
        return obj;
    }

    public static gray(nd: cc.Node, g: boolean) {
        if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
            return;
        }

        let comp_sprite = nd.getComponent(cc.Sprite);
        if (comp_sprite) {
            let material = g ? "2d-gray-sprite" : "2d-sprite";
            let m = cc.MaterialVariant.createWithBuiltin(material, comp_sprite);
            comp_sprite.setMaterial(0, m);
        }
        nd.children.forEach(each => Utils.gray(each, g));
    }

    public static random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    public static tranNumberDotToStringForSpritLable(num: number | string): string {
        let nstr = String(num);
        let newstr = nstr.replace(".", "d");
        return newstr;
    }

    public static toDecimal(x) {
        let f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x * 100) / 100;
        return f;
    }

    public static setIconImage(iconSp: cc.Sprite, url: string) {
        if (isNaN(Number(url))) {
            cc.loader.load(url, function(err, texture) {
                if (err) {
                    return cc.error(`load player icon failed with url: ${url}`);
                }
                if (iconSp && iconSp.node) {
                    let { width, height } = iconSp.node;
                    iconSp.spriteFrame = new cc.SpriteFrame(texture);
                    iconSp.node.width = width;
                    iconSp.node.height = height;
                }
            });
        } else {
            const sheet = ProjectConfigs.HEAD_SHEET;
            cc.loader.loadRes(sheet, cc.SpriteAtlas, (err, atlas) => {
                if (err) {
                    return cc.error(`load player icon failed with url: ${url}`);
                }
                if (iconSp && iconSp.node) {
                    let { width, height } = iconSp.node;
                    let sf = atlas.getSpriteFrame(`head_${url}`) || atlas.getSpriteFrame("head_0");
                    iconSp.spriteFrame = sf;
                    iconSp.node.width = width;
                    iconSp.node.height = height;
                }
            });
        }
    }

    /** 向量反射 */
    public static vectorReflect(inv: cc.Vec2, normal: cc.Vec2) {
        inv = inv.normalize();
        normal = normal.normalize();
        return inv.sub(normal.mul(inv.dot(normal) * 2));
    }

    /** 时间延迟 */
    public static delayTime(delay: number) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    public static safeDelay(target: cc.Node, delay: number) {
        return new Promise(resolve => {
            target.runAction(cc.sequence(cc.delayTime(delay / 1000), cc.callFunc(resolve)));
        });
    }

    /** 混合对象 */
    public static mix(src: any, dest: any) {
        for (let k in src) {
            dest[k] = src[k];
        }
    }

    public static saveLog() {
        //Http.sendHttpRequest("POST", ProjectConfigs.LOG_URL + "/save_log", data);
    }

    /** 计算网络延迟 */
    public static ping(url: string = "https://www.baidu.com") {
        return new Promise(resolve => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            let st = new Date().getTime();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    let rt = new Date().getTime();
                    resolve(rt - st);
                } else {
                    resolve(1000);
                }
            };
            xhr.send();
        });
    }

    public static addClickEvent(
        btn: cc.Button,
        handlerTarget: cc.Node,
        handlerComp: string,
        hnadler: string,
        eventData: string
    ) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = handlerTarget;
        clickEventHandler.component = handlerComp;
        clickEventHandler.handler = hnadler;
        clickEventHandler.customEventData = eventData;
        if (!btn.clickEvents) {
            btn.clickEvents = [];
        }
        btn.clickEvents.push(clickEventHandler);
    }

    public static setClickEventData(node: cc.Node, data: any) {
        let btn = node.getComponent(cc.Button);
        if (btn.clickEvents && btn.clickEvents[0]) {
            btn.clickEvents[0].customEventData = data;
        }
    }

    public static createFullPopup(parentNode: cc.Node, prefab: cc.Prefab) {
        if (!parentNode) {
            return;
        }

        let size = cc.view.getDesignResolutionSize();
        let maskNode = new cc.Node("fullmask");
        maskNode.setContentSize(size);
        maskNode.addComponent(cc.BlockInputEvents);

        let node = cc.instantiate(prefab);
        node.parent = maskNode;

        parentNode.addChild(maskNode);

        return node;
    }

    public static removeFullPopup(node: cc.Node) {
        if (node.parent && node.parent.name == "fullmask") {
            node = node.parent;
        }
        node.destroy();
    }

    public static getStringLength(str: string) {
        let len = 0;
        if (str.length > 0) {
            for (let i = 0; i < str.length; ++i) {
                if (str.charCodeAt(i) > 255) {
                    len += 2;
                } else {
                    len++;
                }
            }
        }
        return len;
    }

    public static getUrlParam(obj) {
        let i = 0;
        let str = "";
        for (let k in obj) {
            if (i == 0) {
                str = `${k}=${obj[k]}`;
            } else {
                str += `&${k}=${obj[k]}`;
            }
            ++i;
        }
        return str;
        // return encodeURIComponent(AESDecrypt(param, deskey));
    }

    public static tranNumber(num, point) {
        let numStr = num.toString();
        // 十万以内直接返回
        if (numStr.length < 6) {
            return numStr;
        }
        //大于8位数是亿
        else if (numStr.length > 8) {
            let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point);
            return parseFloat(parseInt(String(num / 100000000)) + "." + decimal) + "亿";
        }
        //大于6位数是十万 (以10W分割 10W以下全部显示)
        else if (numStr.length > 5) {
            let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point);
            return parseFloat(parseInt(String(num / 10000)) + "." + decimal) + "万";
        }
    }

    public static formatDate(time) {
        let d = new Date(time);
        let year = d.getFullYear();
        let month = d.getMonth() + 1;

        let date = d.getDate();
        let hour = d.getHours();
        let minute = d.getMinutes();

        let monthStr = month < 10 ? "0" + month : String(month);
        let dayStr = date < 10 ? "0" + date : String(date);
        let hourStr = hour < 10 ? "0" + hour : String(hour);
        let muniteStr = minute < 10 ? "0" + minute : String(minute);
        let str = `${year}-${monthStr}-${dayStr} ${hourStr}:${muniteStr}`;
        return str;
    }

    public static stopAllActionsRecursevely(nd: cc.Node) {
        if (nd) {
            nd.stopAllActions();
            nd.children.forEach(child => {
                Utils.stopAllActionsRecursevely(child);
            });
        }
    }

    public static ifIntersect(nd1: cc.Node, nd2: cc.Node) {
        function isNodeRotated(nd: cc.Node) {
            let rotated = nd!.angle % 360 == 0;
            if (rotated) {
                return true;
            }
            const parent = nd.parent;
            if (!parent) {
                return false;
            }
            return isNodeRotated(parent);
        }
        let rotated1 = isNodeRotated(nd1);
        let rotated2 = isNodeRotated(nd2);
        //* 若双方都没有旋转，可以用rectRect来简化计算量
        if (!rotated1 && !rotated2) {
            const boxWorld1 = nd1.getBoundingBoxToWorld();
            const boxWorld2 = nd2.getBoundingBoxToWorld();
            return cc.Intersection.rectRect(boxWorld1, boxWorld2);
        }

        //* 世界坐标下的顶点坐标
        let verteces1 = [
            cc.v2(0, 0),
            cc.v2(nd1.width, 0),
            cc.v2(nd1.width, nd1.height),
            cc.v2(0, nd1.height)
        ];
        let anc1 = cc.v2(nd1.width * nd1.anchorX, nd1.height * nd1.anchorY);
        let verteces2 = [
            cc.v2(0, 0),
            cc.v2(nd2.width, 0),
            cc.v2(nd2.width, nd2.height),
            cc.v2(0, nd2.height)
        ];
        let anc2 = cc.v2(nd2.width * nd2.anchorX, nd2.height * nd2.anchorY);

        nd1.getWorldMatrix(Utils.transMatrix);
        verteces1 = verteces1
            .map(each => each.sub(anc1))
            .map(each => cc.Vec2.transformMat4(cc.v2(), each, Utils.transMatrix));

        nd2.getWorldMatrix(Utils.transMatrix);
        verteces2 = verteces2
            .map(each => each.sub(anc2))
            .map(each => cc.Vec2.transformMat4(cc.v2(), each, Utils.transMatrix));

        //* 使用polygonPolygon来计算相交
        let interset = cc.Intersection.polygonPolygon(verteces1, verteces2);
        return interset;
    }
}
