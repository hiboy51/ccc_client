import DataBing from "./DataBinding";

export class GlobalDataCenter extends DataBing {
    public static readonly Instance: GlobalDataCenter = new GlobalDataCenter();
    static NEW_CLIENT = true;
    static COIN_EXCHANGE = 1;
    static BAIREN_COIN_LIMIT = 1000;

    // 用于全局传递数据
    public dataCache: any = null;

    protected _currentUrl: string = undefined;
    public set currentUrl(value: string) {
        this._currentUrl = value;
    }
    public get currentUrl() {
        return this._currentUrl;
    }

    // 图片上传地址
    protected _imgUploadAPI: string = null;
    public set imgUploadAPI(api: string) {
        this._imgUploadAPI = api;
    }

    public get imgUploadAPI() {
        return this._imgUploadAPI;
    }

    public agencyAccount: string = null;
    public agencyId: string = null;

    //游戏用户token
    protected _userToken: string = null;
    public set userToken(value: string) {
        this._userToken = value;
    }
    public get userToken() {
        return this._userToken;
    }
    //游戏用户id
    protected _playerId: number = null;
    public set playerId(value: number) {
        this._playerId = value;
        this.noticeBind("playerId", this._playerId);
    }
    public get playerId() {
        return this._playerId;
    }

    //游戏服务器标示
    protected _nodeId: string = null;
    public set nodeId(value: string) {
        this._nodeId = value;
    }
    public get nodeId() {
        return this._nodeId;
    }
    //重定向数据，结构体，包含url和新nodeid
    protected _redirect: any = null;
    public set redirect(value: any) {
        this._redirect = value;
    }
    public get redirect() {
        return this._redirect;
    }
    //玩家金币
    protected _coin: number = 0;
    public set coin(value: number) {
        let oldvalue = this._coin;
        this._coin = value;
        if (value != oldvalue) {
            // need notice change
            this.noticeBind("coin", this._coin);
        }
    }
    public get coin() {
        return this._coin;
    }

    //玩家钻石
    protected _diamond: number = 0;
    public set diamond(value: number) {
        let oldvalue = this._diamond;
        this._diamond = value;
        if (value != oldvalue) {
            // need notice change
            this.noticeBind("diamond", this._diamond);
        }
    }
    public get diamond() {
        return this._diamond;
    }

    // 喇叭
    protected _horn: number = 0;
    public set horn(value: number) {
        let oldvalue = this._horn;
        this._horn = value;
        if (value != oldvalue) {
            // need notice change
            this.noticeBind("horn", this._horn);
        }
    }
    public get horn() {
        return this._horn;
    }
    

    //玩家保险箱金额
    protected _coinInSavebox: number = 0;
    public set coinInSavebox(value: number) {
        let oldvalue = this._coinInSavebox;
        this._coinInSavebox = value;
        if (value != oldvalue) {
            // need notice change
            this.noticeBind("coinInSavebox", this._coinInSavebox);
        }
    }
    public get coinInSavebox() {
        return this._coinInSavebox;
    }

    // 玩家名字
    protected _playerName: string = "";
    public set playerName(name: string) {
        this._playerName = name;
        this.noticeBind("playerName", this._playerName);
    }
    public get playerName() {
        return this._playerName;
    }

    // 玩家图标
    protected _playerIcon: string = "0";
    public set playerIcon(icon: string) {
        this._playerIcon = icon;
        this.noticeBind("playerIcon", this._playerId);
    }
    public get playerIcon() {
        return this._playerIcon;
    }

    //当前匹配得到的房间id
    protected _currentRoomId: number = null;
    public set currentRoomId(value: number) {
        this._currentRoomId = value;
    }
    public get currentRoomId() {
        return this._currentRoomId;
    }
    //当前匹配得到的游戏类型
    protected _currentGameType: number = null;
    public set currentGameType(value: number) {
        this._currentGameType = value;
    }
    public get currentGameType() {
        return this._currentGameType;
    }

    protected _currentField: number = null;
    public set currentField(v: number) {
        this._currentField = v;
    }
    public get currentField() {
        return this._currentField;
    }


    protected _hasBindPhone: boolean = false;
    public set hasBindPhone(v: boolean) {
        this._hasBindPhone = v;
    }
    public get hasBindPhone() {
        return this._hasBindPhone;
    }

    protected _bindPhoneNum: string = null;
    public set bindPhoneNum(v: string) {
        this._bindPhoneNum = v;
    }
    public get bindPhoneNum() {
        return this._bindPhoneNum;
    }


    //银行阿里信息
    protected _hasBindCashInfo: boolean = false;
    public set hasBindCashInfo(v: boolean) {
        this._hasBindCashInfo = v;
    }
    public get hasBindCashInfo() {
        return this._hasBindCashInfo;
    }

    protected _bindCashAliRealName: string = null;
    public set bindCashAliRealName(v: string) {
        this._bindCashAliRealName = v;
    }
    public get bindCashAliRealName() {
        return this._bindCashAliRealName;
    }

    protected _bindCashAliAccount: string = null;
    public set bindCashAliAccount(v: string) {
        this._bindCashAliAccount = v;
    }
    public get bindCashAliAccount() {
        return this._bindCashAliAccount;
    }

    protected _bindCashBankUserRealName: string = null;
    public set bindCashBankUserRealName(v: string) {
        this._bindCashBankUserRealName = v;
    }
    public get bindCashBankUserRealName() {
        return this._bindCashBankUserRealName;
    }

    protected _bindCashBankAccount: string = null;
    public set bindCashBankAccount(v: string) {
        this._bindCashBankAccount = v;
    }
    public get bindCashBankAccount() {
        return this._bindCashBankAccount;
    }

    protected _bindCashBankTitle: string = null;
    public set bindCashBankTitle(v: string) {
        this._bindCashBankTitle = v;
    }
    public get bindCashBankTitle() {
        return this._bindCashBankTitle;
    }

    protected _bindCashBankPrivence: string = null;
    public set bindCashBankPrivence(v: string) {
        this._bindCashBankPrivence = v;
    }
    public get bindCashBankPrivence() {
        return this._bindCashBankPrivence;
    }

    protected _bindCashBankCity: string = null;
    public set bindCashBankCity(v: string) {
        this._bindCashBankCity = v;
    }
    public get bindCashBankCity() {
        return this._bindCashBankCity;
    }
    //开户行名称
    protected _bindCashBankSubTitle: string = null;
    public set bindCashBankSubTitle(v: string) {
        this._bindCashBankSubTitle = v;
    }
    public get bindCashBankSubTitle() {
        return this._bindCashBankSubTitle;
    }


    // updateType
    public _updateType: string = "LOGIN_UPDATE";
    public set updateType(t: string) {
        this._updateType = t;
    }
    public get updateType() {
        return this._updateType;
    }

    // 大厅排行榜数据
    public _rankMetaData: any = {
        wealthList: [],
        beautyList: [],
    };
    public set rankMetaData(t: any) {
        this._rankMetaData = t;
        this.noticeBind("rankMetaData", this._rankMetaData);
    }
    public get rankMetaData() {
        return this._rankMetaData;
    }
    

}
