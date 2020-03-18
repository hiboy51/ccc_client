export class CustomEventDefine {
    public static CE_NETWORK_CONNECTING = "CE_NETWORK_CONNECTING"; // 网络开始连接
    public static CE_NETWORK_ERROR = "CE_NETWORK_ERROR";//网络错误
    public static CE_NETWORK_CLOSED = "CE_NETWORK_CLOSED"; // 网络被动断开
    public static CE_NETWORK_OPEN = "CE_NETWORK_OPEN";//网络建立连接成功
    public static CE_NETWORK_REDIRECTION = "CE_NETWORK_REDIRECTION"; // 网络开始重定向
    public static CE_NETWORK_RECONNECT = "CE_NETWORK_RECONNECT"; // 网络自动断线重连
    public static CE_NETWORK_CLOSING = "CE_NETWORK_CLOSING"; // 网络尝试主动断开
    public static CE_SERVER_ERROR = "CE_SERVER_ERROR"; // 服务器返回错误信息
    public static CE_SERVER_TOKEN_OUTDATED = "ce_server_token_outdated"; // token过期

    // ====================================================================================
    // 捕鱼
    // ====================================================================================
    public static CE_FISH_QUIT_CONTINOUS_SHOOT = "CE_FISH_STOP_CONTINOUS_SHOOT"; // 非正常退出自动开火模式时通知
}
