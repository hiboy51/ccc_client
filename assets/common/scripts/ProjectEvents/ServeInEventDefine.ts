import { duplicated } from "../protocol_dispatch/ProtocolConfig";

export class ServeInEventDefine {
    public static SEI_HALL_AUTHOR = "2|1"; //大厅授权
    public static SEI_HALL_GETHALLDATA = "2|3"; //获取大厅数据
    public static SEI_HALL_UPDATETOKEN = "2|2"; //更新token

    public static SEI_HALL_MATCHGAME = "2|4"; //匹配游戏

    public static SEI_SAVEBOX_EXCHANGE = "2|9"; //保险箱兑换
    public static SEI_PERSONCENTER_GETPHONEBINDINFO = "2|12"; //查询绑定信息
    public static SEI_PERSONCENTER_BINDCASHINFO = "2|10"; //查询绑定信息
    public static SEI_PERSONCENTER_GETCASHBINDINFO = "2|11"; //查询绑定信息
    public static SEI_MESSAGE_GETMSGLIST = "2|15"; //邮箱获取列表

    public static SEI_HEART = "1|1"; //心跳
    public static SEI_GETSUOLUEINFO = "2|6"; //获取缩略信息的借口
    // 进入房间
    public static SEI_ENTERROOM = "3|1";
    // 退出游戏房间
    public static SEI_QUITROOM = "3|2";
    // 推送玩家进入房间
    public static SEI_PLAYER_ENTER = "3|-1";
    // 推送某玩家退出
    public static SEI_PLAYER_QUITROOM = "3|-2";
    // 同步玩家金币
    public static SEI_PLAYER_SYNC_COIN = "3|-3";

    // ====================================================================================
    // 扎金花
    // ====================================================================================

    // 游戏阶段改变
    public static SEI_JINHUA_PHASE_CHANGE = "10|-1";
    // 操作
    public static SEI_JINHUA_OPERATE_END = "10|2";
    // 比牌
    public static SEI_JINHUA_OPERATE_BIPAI = "10|3";
    // 比牌结果推送
    public static SEI_JINHUA_OPERATE_BIPAI_RESULT = "10|-6";
    // 看牌
    public static SEI_JINHUA_OPERATE_KANPAI = "10|1";
    // 操作可选项
    public static SEI_JINHUA_OPERATE_OPTION = "10|-4";
    // 推送操作结果
    public static SEI_JINHUA_OPERATE_RESULT = "10|-3";
    // 看牌结果
    public static SEI_JINHUA_OPERATE_KANPAI_RESULT = "10|-2";
    // 亮牌
    public static SEI_JINHUA_SHOWCARDS_RESULT = "10|-5";

    // ====================================================================================
    // 斗地主
    // ====================================================================================

    // 游戏阶段改变
    public static SEI_DDZ_PHASE_CHANGE = "11|-1";
    public static SEI_DDZ_JIAOPAI_INFO = "11|-2";
    public static SEI_DDZ_JIABEI_INFO = "11|-3";
    public static SEI_DDZ_CHUPAI_INFO = "11|-4";
    public static SEI_DDZ_TUOGUAN_INFO = "11|-5";
    // ====================================================================================
    // 红黑
    // ====================================================================================
    public static SEI_RB_GAMESTATE_PUSH = "12|-1";
    public static SEI_RB_GAMEXIAZHU_PUSH = "12|-2";
    public static SEI_RB_ZHUANGCHANGE_PUSH = "12|-3";
    public static SEI_RB_XIAZHU = "12|1";
    public static SEI_RB_SHANGXIAZHUANG = "12|2";
    public static SEI_RB_GETREQUESTZHUANGLIST = "12|3";
    public static SEI_RB_GETONLINE_PLAYERLIST = "12|4";

    // ====================================================================================
    // 抢庄牛牛
    // ====================================================================================
    public static SEI_QZNN_PHASE_CHANGE = "13|-1";
    public static SEI_QZNN_QIANGZHUANG_INFO = "13|-2";
    public static SEI_QZNN_TOUZHU_INFO = "13|-3";

    // ====================================================================================
    // 盲注牛牛
    // ====================================================================================
    public static SEI_MZNN_PHASE_CHANGE = "15|-1";
    public static SEI_MZNN_QIANGZHUANG_INFO = "15|-2";
    public static SEI_MZNN_TOUZHU_INFO = "15|-3";

    // ====================================================================================
    // 通比牛牛
    // ====================================================================================
    public static SEI_TBNN_PHASE_CHANGE = "16|-1";

    // ====================================================================================
    //  龙虎
    // ====================================================================================
    public static SEI_LH_GAMESTATE_PUSH = "14|-1";
    public static SEI_LH_GAMEXIAZHU_PUSH = "14|-2";
    public static SEI_LH_ZHUANGCHANGE_PUSH = "14|-3";
    public static SEI_LH_XIAZHU = "14|1";
    public static SEI_LH_SHANGXIAZHUANG = "14|2";
    public static SEI_LH_GETREQUESTZHUANGLIST = "14|3";
    public static SEI_LH_GETONLINE_PLAYERLIST = "14|4";

    // ====================================================================================
    //  百家乐
    // ====================================================================================
    public static SEI_BJL_GAMESTATE_PUSH = "18|-1";
    public static SEI_BJL_GAMEXIAZHU_PUSH = "18|-2";
    public static SEI_BJL_ZHUANGCHANGE_PUSH = "18|-3";
    public static SEI_BJL_XIAZHU = "18|1";
    public static SEI_BJL_SHANGXIAZHUANG = "18|2";
    public static SEI_BJL_GETREQUESTZHUANGLIST = "18|3";
    public static SEI_BJL_GETONLINE_PLAYERLIST = "18|4";

    // ====================================================================================
    //  百人牛
    // ====================================================================================
    public static SEI_BRNN_GAMESTATE_PUSH = "19|-1";
    public static SEI_BRNN_GAMEXIAZHU_PUSH = "19|-2";
    public static SEI_BRNN_ZHUANGCHANGE_PUSH = "19|-3";
    public static SEI_BRNN_XIAZHU = "19|1";
    public static SEI_BRNN_SHANGXIAZHUANG = "19|2";
    public static SEI_BRNN_GETREQUESTZHUANGLIST = "19|3";
    public static SEI_BRNN_GETONLINE_PLAYERLIST = "19|4";

    // ====================================================================================
    // 西游记
    // ====================================================================================
    public static SEI_XYJ_BET_INFO = "20|-2";
    public static SEI_XYJ_SPIN_INFO = "20|-3";

    // ====================================================================================
    // 捕鱼
    // ====================================================================================
    public static SEI_FISH_PLAYER_ACTION = "21|-1";
    public static SEI_FISH_FISHBOOM = "21|-2";
    public static SEI_FISH_KINGBOOM = "21|-3";
    public static SEI_FISH_BASE_MODIFY = "21|-4";
    public static SEI_FISH_AI_SERVER = "21|-5";
    public static SEI_FISH_BOMBBOOM = "21|-6";

    // ====================================================================================
    // 跑得快
    // ====================================================================================
    public static SEI_PDK_PHASE = "22|-1";
    public static SEI_PDK_ACTION = "22|-2";
    public static SEI_PDK_AUTO = "22|-3";

    // ====================================================================================
    // 十三水
    // ====================================================================================
    public static SEI_SSS_PHASE = "23|-1";
    public static SEI_SSS_READY = "23|-2";
    public static SEI_SSS_AUTO = "23|-3";
    public static SEI_SSS_ACTION = "23|-4";

    // ====================================================================================
    // 德州扑克
    // ====================================================================================

    // 游戏阶段改变
    public static SEI_TEXAS_PHASE_CHANGE = "24|-1";
    // 玩家操作(跟注，加注，allIn，等)
    public static SEI_TEXAS_ACTION = "24|-2";
    // 亮牌
    public static SEI_TEXAS_EXPOSE = "24|-3";
    // 站起
    public static SEI_TEXAS_STANDUP = "24|-4";
    // 入座
    public static SEI_TEXAS_TAKESEAT = "24|-5";
    // 自动入座推送
    public static SEI_TEXAS_AUTOSIT = "24|-6";
    // 聊天推送
    public static SEI_TEXAS_CHAT_TEXT = "3|-5";
    // 打赏推送
    public static SEI_TEXAS_BESTOW = "24|-8";
    // 放弃推送
    public static SEI_TEXAS_GIVEUP = "24|-9";
    // 所有人allin后自动亮牌
    public static SEI_TEXAS_EXPOSE_ALL = "24|-10"; // {playsers: [{seatId:number, cards: [number]}]}
    // 房建内送礼推送
    public static SEI_TEXAS_ROOM_SEND_GIFT = "24|-5"; //* {senderId: number; senderName: number, receiverId: number, receiverName: number}
    // ====================================================================================
    // 德州扑克大厅
    // ====================================================================================
    public static SEI_TEXAS_GAME_INVITATION = "24|-7";
    // 充值成功后的推送
    public static SEI_TEXAS_PAYMENT_SUCCESS = "2|-3";
}
