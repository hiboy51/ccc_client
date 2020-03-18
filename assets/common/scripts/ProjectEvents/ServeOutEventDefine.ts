import { roundtrip } from "../ProtocolConfig";

export class ServeOutEventDefine {
    @roundtrip
    public static SEO_HALL_AUTHOR = "2|1"; //大厅授权
    @roundtrip
    public static SEO_HALL_GETHALLDATA = "2|3"; //获取大厅数据
    public static SEO_HALL_UPDATETOKEN = "2|2"; //更新token
    @roundtrip
    public static SEO_HALL_MATCHGAME = "2|4"; //匹配游戏
    public static SEO_HEART = "1|1"; //心跳
    @roundtrip
    public static SEO_GETSUOLUEINFO = "2|6"; //获取缩略信息的借口
    public static SEO_CHANGE_HEADICON = "2|7"; //修改头像

    public static SEO_SAVEBOX_EXCHANGE = "2|9"; //保险箱兑换
    public static SEO_PERSONCENTER_GETPHONEBINDINFO = "2|12"; //查询绑定信息
    public static SEO_PERSONCENTER_BINDCASHINFO = "2|10"; //查询绑定信息
    public static SEO_PERSONCENTER_GETCASHBINDINFO = "2|11"; //查询绑定信息
    public static SEO_MESSAGE_GETMSGLIST = "2|15"; //邮箱获取列表
    // 进入游戏房间
    public static SEO_ENTERROOM = "3|1";
    // 退出游戏房间
    @roundtrip
    public static SEO_QUITROOM = "3|2";

    // ====================================================================================
    // 扎金花
    // ====================================================================================

    // 操作
    public static SEO_JINHUA_OPERATE = "10|2";
    // 比牌
    public static SEO_JINHUA_OPERATE_BIPAI = "10|3";
    // 看牌
    public static SEO_JINHUA_OPERATE_KANPAI = "10|1";
    // 亮牌
    public static SEO_JINHUA_SHOWCARDS = "10|4";

    // ====================================================================================
    // 斗地主
    // ====================================================================================
    // 叫地主
    public static SEO_DDZ_JIAOPAI = "11|1";
    // 加倍
    public static SEO_DDZ_JIABEI = "11|2";
    // 出牌
    public static SEO_DDZ_CHUPAI = "11|3";
    // 托管
    public static SEO_DDZ_GUOGUAN = "11|4";

    // ====================================================================================
    // 红黑
    // ====================================================================================
    public static SEO_RB_XIAZHU = "12|1";

    public static SEO_RB_SHANGXIAZHUANG = "12|2";
    public static SEO_RB_GETREQUESTZHUANGLIST = "12|3";
    public static SEO_RB_GETONLINE_PLAYERLIST = "12|4";

    // ====================================================================================
    // 抢庄牛牛
    // ====================================================================================
    // 抢庄
    public static SEO_QZNN_QIANGZHUANG = "13|1";
    // 投注
    public static SEO_QZNN_TOUZHU = "13|2";

    // ====================================================================================
    // 盲注牛牛
    // ====================================================================================
    // 抢庄
    public static SEO_MZNN_QIANGZHUANG = "15|1";
    // 投注
    public static SEO_MZNN_TOUZHU = "15|2";

    // ====================================================================================
    // 龙虎
    // ====================================================================================
    public static SEO_LH_XIAZHU = "14|1";

    public static SEO_LH_SHANGXIAZHUANG = "14|2";
    public static SEO_LH_GETREQUESTZHUANGLIST = "14|3";
    public static SEO_LH_GETONLINE_PLAYERLIST = "14|4";

    // ====================================================================================
    // 百人牛牛
    // ====================================================================================
    public static SEO_BRNN_XIAZHU = "19|1";

    public static SEO_BRNN_SHANGXIAZHUANG = "19|2";
    public static SEO_BRNN_GETREQUESTZHUANGLIST = "19|3";
    public static SEO_BRNN_GETONLINE_PLAYERLIST = "19|4";

    // ====================================================================================
    // 百家乐
    // ====================================================================================
    public static SEO_BJL_XIAZHU = "18|1";

    public static SEO_BJL_SHANGXIAZHUANG = "18|2";
    public static SEO_BJL_GETREQUESTZHUANGLIST = "18|3";
    public static SEO_BJL_GETONLINE_PLAYERLIST = "18|4";

    // ====================================================================================
    // 捕鱼
    // ====================================================================================
    public static SEO_FISH_HITFISH = "21|1";
    public static SEO_FISH_HITKING = "21|2";
    public static SEO_FISH_PLAYER_ACTION = "21|3";
    public static SEO_FISH_BASE_MODIFY = "21|4";
    public static SEO_FISH_HITBOMB = "21|5";

    // ====================================================================================
    // 西游记
    // ====================================================================================
    public static SEO_XYJ_BET = "20|1";
    public static SEO_XYJ_SPIN = "20|2";

    // ====================================================================================
    // 跑得快
    // ====================================================================================
    public static SEO_PDK_ACTION = "22|1";
    public static SEO_PDK_AUTO = "22|2";

    // ====================================================================================
    // 十三水
    // ====================================================================================
    public static SEO_SSS_READY = "23|1";
    public static SEO_SSS_SPECIAL = "23|2";
    public static SEO_SSS_AUTO = "23|3";
    public static SEO_SSS_ACTION = "23|4";

    // ====================================================================================
    // 德州扑克
    // ====================================================================================
    public static SEO_TEXAS_ACTION = "24|1"; // {action: number, coin: number}
    public static SEO_TEXAS_EXPOSE = "24|2"; // {exposed: boolean}
    public static SEO_TEXAS_SIT = "24|4"; // 坐下
    public static SEO_TEXAS_STANDUP = "24|3"; // 站起
    public static SEO_TEXAS_AUTO_SEAT = "24|5"; // 自动坐下
    public static SEO_TEXAS_CHAT_TXT = "3|3"; // 聊天
    @roundtrip
    public static SEO_TEXAS_SET_CARRY = "24|10"; // 设置下一把的携带
    public static SEO_TEXAS_INVITE_FRIEND = "24|11"; // 邀请好友来游戏
    @roundtrip
    public static SEO_TEXAS_ROOM_SET_PASSWORD = "24|14"; // 房间内设置密码
    // @roundtrip
    // public static SEO_TEXAS_ROOM_CLEAR_PASSWORD = "24|17"; // 清除房间密码 {password}
    @roundtrip
    public static SEO_TEXAS_OWNER_GET_ROOM_PASSWORD = "24|18"; // 私人订制房主获取本房间密码
    public static SEO_TEXAS_BESTOW = "24|13"; // 打赏荷官
    @roundtrip
    public static SEO_TEXAS_GIVE_UP = "24|15";
    @roundtrip
    public static SEO_TEXAS_CHECK_PUBLIC_CARDS = "24|16"; // {cards: [number]}

    // ====================================================================================
    // 德州扑克大厅
    // ====================================================================================
    @roundtrip
    public static SEO_TEXAS_ROOMLIST = "24|6"; // 拉取公共房间列表
    @roundtrip
    public static SEO_TEXAS_ROOM_INFO = "24|7"; // 拉取房间信息
    @roundtrip
    public static SEO_TEXAS_CAN_ENTER_ROOM = "24|8"; // 验证是否能进房间
    @roundtrip
    public static SEO_TEXAS_PRIVATE_LIST = "24|9"; // 拉取私人房间列表
    @roundtrip
    public static SEO_TEXAS_REPORT = "24|12"; // 拉取房间战报
    @roundtrip
    public static SEO_TEXAS_FRIEND_LIST = "2|27"; // 拉取好友列表
    @roundtrip
    public static SEO_TEXAS_BUY_ITEM = "2|29"; // 购买商品
    @roundtrip
    public static SEO_TEXAS_GIFTS_RECORD = "2|51"; // 查看玩家的收礼信息
    @roundtrip
    public static SEO_TEXAS_SEND_GIFT = "2|44"; // 给玩家送礼
    @roundtrip
    public static SEO_TEXAS_BEAUTY_AUTH = "2|50"; // 美女认证
    @roundtrip
    public static SEO_TEXAS_BEAUTY_ALBUM = "2|52"; // 获取相册照片
    @roundtrip
    public static SEO_TEXAS_GET_LOGIN_BEAUTY_AWARD = "2|53"; // 领取登录美女认证奖励
}
