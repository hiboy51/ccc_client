import AudioMgr from "../../common/scripts/AudioMgr";
import Utils from "../../common/scripts/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AppStart extends cc.Component {
    public static isInit: boolean = false;
    onLoad() {
        if (AppStart.isInit) {
            return;
        }
        this.init();
        AppStart.isInit = true;
    }

    private init() {
        // 设置帧率
        cc.game.setFrameRate(40);
        if (!CC_DEV) {
            cc.debug.setDisplayStats(false);
        }
        if (CC_JSB) {
            jsb.Device.setKeepScreenOn(true);
        }
        // 音效初始化
        AudioMgr.init();

        //
        if (!CC_JSB) {
            this.registerWindowEvent();
            cc.loader.downloader.loadSubpackage = function(name, completeCallback) {
                var pac = cc.loader.downloader._subpackages[name];
                pac
                    ? pac.loaded
                        ? completeCallback && completeCallback()
                        : cc.loader.downloader.extMap["js"](
                              {
                                  url: pac.indexjs
                              },
                              function(err) {
                                  err || (pac.loaded = true);
                                  completeCallback && completeCallback(err);
                              }
                          )
                    : completeCallback &&
                      completeCallback(new Error("Can't find subpackage " + name));
            };
        }
    }

    private registerWindowEvent() {
        window.onresize = function() {
            Utils.resize();
        };

        window.onerror = function(message, source, lineno, colno, error) {
            if (!CC_DEV) {
                let exclude = `Cannot read property '_assembler' of null`;
                let str = "";
                if (error.stack && error.stack.indexOf(exclude) == -1) {
                    str = error.stack;
                } else if (error.message && error.message.indexOf(exclude) == -1) {
                    str = error.message;
                }
                if (str != "") {
                    let jsonStr = JSON.stringify({ data: str });
                    // Http.sendHttpRequest("POST", ProjectConfigs.LOG_URL + "/save_error", jsonStr);
                }
            }
        };
    }
}
