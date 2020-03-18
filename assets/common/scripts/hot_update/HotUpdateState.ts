import { MachineState, MACHINE_STATE_CHANGE_CALLBACK } from "../StateMachine";
import HotUpdateManager, { HotUpdateStateEnum } from "./HotUpdateManager";

/*
 * Filename: /Users/kinnonzhang/SY02/assets/common/scripts/hot_update/HotUpdateState.ts
 * Path: /Users/kinnonzhang/SY02
 * Created Date: Wednesday, October 23rd 2019, 6:03:18 pm
 * Author: kinnonzhang
 * 
 * Copyright (c) 2019 Your Company
 */

export abstract class HotUpdateState implements MachineState {
    protected _machine: HotUpdateManager;
    protected _flag: HotUpdateStateEnum = null;
    public get flag() {return this._flag;}

    constructor(ma: HotUpdateManager) {
        this._machine = ma;
    }

    onEnterState(pre: MachineState): void {
    }

    onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        succ(true);
    }
    equal(another: MachineState): boolean {
        if (!another) {
            return false;
        }
        if (another instanceof HotUpdateState) {
            return this.flag === another.flag;
        }
        return false;
    }
}

// ====================================================================================
// HotUpdateStateUninit
// ====================================================================================
export class HotUpdateStateUninit extends HotUpdateState {
    constructor(ma: HotUpdateManager) {
        super(ma);
        this._flag = HotUpdateStateEnum.UNINIT;
    }
}

// ====================================================================================
//  HotUpdateStateError
// ====================================================================================
export class HotUpdateStateError extends HotUpdateState {
    private _code: number;
    private _msg: string;

    public get code() {return this._code;}
    public get msg() {return this._msg;}

    constructor(ma: HotUpdateManager, code: number, msg: string = "") {
        super(ma);
        this._flag = HotUpdateStateEnum.ERROR;
        this._code = code;
        this._msg = msg;
    }

    // ====================================================================================
    // implementation
    // ====================================================================================
    equal(another: MachineState): boolean {
        return false;
    }
}

// ====================================================================================
// HotUpdateStatePrepared
// ====================================================================================
export enum HotUpdateCheckResultEnum {
    ALREADY_UP_TO_DATE,
    NEED_UPDATE,
    ERROR
}
export class HotUpdateStatePrepared extends HotUpdateState {
    private _needUpdate: boolean = false;
    public get needUpdate() {return this._needUpdate;}

    private _checkAsync: Function = null;
    constructor(ma: HotUpdateManager) {
        super(ma);
        this._flag = HotUpdateStateEnum.PREPARED;
    }

    // ====================================================================================
    // implementation
    // ====================================================================================
    onEnterState(pre: MachineState): void {
        cc.log("Enter State HotUpdateStatePrepared");
        this._checkAsync = null;
        let am = this._machine.am;
        am.setEventCallback(this._checkListener.bind(this));
    }

    onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        // this._checkAsync = null;
        let am = this._machine.am;
        am.setEventCallback(null);
        succ(true);
    }

    // ====================================================================================
    // public interfaces
    // ====================================================================================
    public check() {
        if (this._checkAsync) {
            return Promise.reject("last check not finished");
        }

        let am = this._machine.am;
        return new Promise(resolve => {
            this._checkAsync = resolve;
            am.checkUpdate();
        });
    }

    // ====================================================================================
    // private interfaces
    // ====================================================================================
    private _checkListener(event: jsb.EventAssetsManager) {
        let code = event.getEventCode();
        let msg: string = "";
        cc.log(`checkListener event code = ${code}`);
        switch (code)
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                msg = "No local manifest file found.";
                this._machine.changeState(new HotUpdateStateError(this._machine, code, msg));
                this._checkAsync && this._checkAsync(HotUpdateCheckResultEnum.ERROR);
                this._checkAsync = null;
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                msg = "Fail to download manifest file.";
                this._machine.changeState(new HotUpdateStateError(this._machine, code, msg));
                this._checkAsync && this._checkAsync(HotUpdateCheckResultEnum.ERROR);
                this._checkAsync = null;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log("Already up to date with the latest remote version.");
                this._checkAsync && this._checkAsync(HotUpdateCheckResultEnum.ALREADY_UP_TO_DATE);
                this._checkAsync = null;
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                cc.log('New version found, please try to update.');
                this._checkAsync && this._checkAsync(HotUpdateCheckResultEnum.NEED_UPDATE);
                this._checkAsync = null;
                this._needUpdate = true;
                break;
            default:
                return;
        }
    }
}

// ====================================================================================
// HotUpdateStateUpdating
// ====================================================================================
export enum HotUpdateResultEnum {
    NOTHING,
    SUCCESS,
    FAIL,
    ERROR
}

export class HotUpdateStateUpdating extends HotUpdateState {
    private _updateAsync: Function = null;

    constructor(ma: HotUpdateManager) {
        super(ma);
        this._flag = HotUpdateStateEnum.UPDATING;
    }

    // ====================================================================================
    // implementation
    // ====================================================================================
    onEnterState(pre: MachineState): void {
        this._updateAsync = null;
        let am = this._machine.am;
        am.setEventCallback(this._updateListener.bind(this));
    }

    onExitState(next: MachineState, succ: MACHINE_STATE_CHANGE_CALLBACK): void {
        // if (this._updateAsync) {
        //     cc.log("can not interrupt hotupdating");
        //     return succ(false);
        // }
        
        // this._updateAsync = null;
        let am = this._machine.am;
        am.setEventCallback(null);
        succ(true);
    }

    // ====================================================================================
    // public interfaces
    // ====================================================================================
    public update() {
        if (this._updateAsync) {
            return Promise.reject("updating not finish");
        }
        let am = this._machine.am;
        return new Promise(resolve => {
            this._updateAsync = resolve;
            am.update();
        });
    }

    public reupdateFailedAssets() {
        if (this._updateAsync) {
            return Promise.reject("updating not finish");
        }
        let am = this._machine.am;
        am.downloadFailedAssets();
        return new Promise(resolve => this._updateAsync = resolve);
    }

    // ====================================================================================
    // private interfaces
    // ====================================================================================
    private _updateListener(event: jsb.EventAssetsManager) {
        let code = event.getEventCode();
        cc.log(`updateListener event code = ${code}`);
        let msg = "";
        switch (code)
        {
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                let progressHandler = this._machine.progressHandler;
                progressHandler && progressHandler(event);
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                cc.log('Update finished. ' + event.getMessage());
                let searchPaths = jsb.fileUtils.getSearchPaths();
                let newPaths = this._machine.am.getLocalManifest().getSearchPaths();
                console.log(JSON.stringify(newPaths));
                Array.prototype.unshift.apply(searchPaths, newPaths);
                // This value will be retrieved and appended to the default search path during game startup,
                // please refer to samples/js-tests/main.js for detailed usage.
                // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
                cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
                jsb.fileUtils.setSearchPaths(searchPaths);
                this._machine.changeState(new HotUpdateStateUninit(this._machine));
                this._updateAsync && this._updateAsync(HotUpdateResultEnum.SUCCESS);
                this._updateAsync = null;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                cc.log('Update failed. ' + event.getMessage());
                this._updateAsync && this._updateAsync(HotUpdateResultEnum.FAIL);
                this._updateAsync = null;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                msg = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                this._machine.changeState(new HotUpdateStateError(this._machine, code, msg));
                this._updateAsync && this._updateAsync(HotUpdateResultEnum.ERROR);
                this._updateAsync = null;
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                msg = event.getMessage();
                this._machine.changeState(new HotUpdateStateError(this._machine, code, msg));
                this._updateAsync && this._updateAsync(HotUpdateResultEnum.ERROR);
                this._updateAsync = null;
                break;
            default:
                break;
        }        
    }
}
