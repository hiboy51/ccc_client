import StateMachine from "../StateMachine";
import {
    HotUpdateStateUninit,
    HotUpdateStateError,
    HotUpdateState,
    HotUpdateStatePrepared,
    HotUpdateStateUpdating,
    HotUpdateResultEnum
} from "./HotUpdateState";

/*
 * Filename: /Users/kinnonzhang/SY02/assets/common/scripts/hot_update/HotUpdateManager.ts
 * Path: /Users/kinnonzhang/SY02
 * Created Date: Wednesday, October 23rd 2019, 5:01:45 pm
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */

export enum HotUpdateStateEnum {
    UNINIT,
    PREPARED,
    UPDATING,
    ERROR
}

export default class HotUpdateManager extends StateMachine {
    public verCompareHandler: (va: string, vb: string) => -1 | 0 | 1 = null;

    /**
     * @info byteProgress = event.getPercent();
     * @info fileProgress = event.getPercentByFile();
     * @info downloaded_count = event.getDownloadedFiles();
     * @info total_count = event.getTotalFiles();
     * @info downloaded_bytes = event.getDownloadedBytes();
     * @info total_bytes = event.getTotalBytes();
     * @info file_info = event.getMessage();
     */
    public progressHandler: (event: jsb.EventAssetsManager) => void = null;

    private _am: jsb.AssetsManager;
    public get am() {
        return this._am;
    }

    private _storagePath: string = null;
    public get storagePath() {
        if (!this._storagePath) {
            this._storagePath = `${
                jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/"
            }SY02-remote-assset`;
        }
        return this._storagePath;
    }

    constructor() {
        super();

        if (!CC_JSB) {
            return;
        }

        let versionCompare =
            this.verCompareHandler ||
            ((va: string, vb: string) => {
                cc.log(`HotUpdate version compared: version A is ${va}, version B is ${vb}`);
                let sa = va.split(".").map(each => parseInt(each));
                let sb = vb.split(".").map(each => parseInt(each));

                if (sa.length == sb.length) {
                    let pair = sa.map((each, idx) => each - sb[idx]);
                    let large = pair.find(each => each !== 0);
                    cc.log(`compare version result: ${large}`);
                    return large || 0;
                }

                if (sb.length > sa.length) {
                    return -1;
                }
                return 0;
            });
        this._am = new jsb.AssetsManager("", this.storagePath, versionCompare);
        this._am.setVerifyCallback((path, asset) => {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            let compressed = asset.compressed;
            // Retrieve the correct md5 value.
            let expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            let relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            let size = asset.size;
            if (compressed) {
                cc.log("Verification passed : " + relativePath);
            } else {
                cc.log("Verification passed : " + relativePath + " (" + expectedMD5 + ")");
            }
            return true;
        });

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
            cc.log("Max concurrent tasks count have been limited to 2");
        }

        this.changeState(new HotUpdateStateUninit(this));
    }

    // ====================================================================================
    // public interfaces
    // ====================================================================================

    public get prepared() {
        if (!this._curState) {
            return false;
        }
        return (this._curState as HotUpdateState).flag == HotUpdateStateEnum.PREPARED;
    }

    public prepare(localManifestUrl: string) {
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            this._am.loadLocalManifest(localManifestUrl);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.changeState(
                new HotUpdateStateError(this, 10000, "Failed to load local manifest ...")
            );
            return;
        }
        this.changeState(new HotUpdateStatePrepared(this));
    }

    public async checkUpdate() {
        if (!this.prepared) {
            throw new Error("hotupdate not prepared yet");
        }
        cc.log("start to checkUpdate ");
        let result = await (this._curState as HotUpdateStatePrepared).check();
        return result;
    }

    /**
     * @return 异步结果 HotUpdateResultEnum
     */
    public async updateAsync() {
        if (!this.prepared) {
            throw new Error("hotupdate not prepared yet");
        }
        let needUpdate = (this._curState as HotUpdateStatePrepared).needUpdate;
        if (!needUpdate) {
            cc.log("local version is already up to date");
            return HotUpdateResultEnum.NOTHING;
        }
        this.changeState(new HotUpdateStateUpdating(this));
        let result = await (this._curState as HotUpdateStateUpdating).update();
        return result;
    }

    /**
     * @return 异步结果 HotUpdateResultEnum
     */
    public async updateFailedAssetsAsync() {
        if (this.prepared) {
            throw new Error("hotupdate not prepared yet");
        }
        if (this._curState instanceof HotUpdateStateUpdating) {
            let result = await (this._curState as HotUpdateStateUpdating).reupdateFailedAssets();
            return result;
        } else {
            throw new Error("Wrong opportunity to use this interface");
        }
    }

    public get err() {
        if (this._curState && this._curState instanceof HotUpdateStateError) {
            return [this._curState.code, this._curState.msg];
        }
        return [-1, ""];
    }
}
