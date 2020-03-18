const { ccclass, property } = cc._decorator;

@ccclass
export default class GestureRecognizer extends cc.Component {
    @property({
        displayName: "双击的判定间隔"
    })
    doubleClickCheckInterval: number = 0.5;

    @property({
        displayName: "拖拽判定的阈值"
    })
    dragMinDistanceCheck: number = 10;

    @property({
        displayName: "长按时间判定"
    })
    longTapCheckInterval: number = 1;

    @property({
        displayName: "单击事件处理",
        type: cc.Component.EventHandler
    })
    onClick: cc.Component.EventHandler = null;

    @property({
        displayName: "双击事件处理",
        type: cc.Component.EventHandler
    })
    onDoubleClick: cc.Component.EventHandler = null;

    @property({
        displayName: "拖动事件处理",
        type: cc.Component.EventHandler
    })
    onDragging: cc.Component.EventHandler = null;

    @property({
        displayName: "拖动结束处理",
        type: cc.Component.EventHandler
    })
    onDragEnd: cc.Component.EventHandler = null;

    @property({
        displayName: "长按处理",
        type: cc.Component.EventHandler
    })
    onLongTap: cc.Component.EventHandler = null;

    private _scheduleCopy: Function = null;
    private _isMoving: boolean = false;
    private _checkDbClick: boolean = false;

    private _longTapCheckHandler: number = NaN;
    // //////////////////////////////////////////////////////////////////////////////////////////////
    // life cycle
    // //////////////////////////////////////////////////////////////////////////////////////////////

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    onDestroy() {
        this.node.targetOff(this);
    }

    // //////////////////////////////////////////////////////////////////////////////////////////////
    // private interface
    // //////////////////////////////////////////////////////////////////////////////////////////////

    private _onTouchBegin(event: cc.Touch) {
        this._isMoving = false;

        let clickPos = event.getLocation();
        this._longTapCheckHandler = setTimeout(() => {
            this._longTapCheckHandler = NaN;
            this.onLongTap && this.onLongTap.emit([this.node, clickPos]);
        }, this.longTapCheckInterval * 1000);
        event["stopPropagation"]();
    }

    private _onTouchMove(event: cc.Touch) {
        let delta = event.getDelta();
        let mag = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
        if (mag < this.dragMinDistanceCheck) {
            return;
        }

        if (!Number.isNaN(this._longTapCheckHandler)) {
            clearTimeout(this._longTapCheckHandler);
            this._longTapCheckHandler = NaN;
        }

        this._isMoving = true;
        if (this.onDragging) {
            this.onDragging.emit([this.node, event.getStartLocation(), event.getLocation(), delta]);
        }
    }

    private _onTouchEnd(event: cc.Touch) {
        if (!Number.isNaN(this._longTapCheckHandler)) {
            clearTimeout(this._longTapCheckHandler);
            this._longTapCheckHandler = NaN;
        }

        // 处理拖动结束
        let clickPos = event.getLocation();
        let startPos = event.getStartLocation();

        if (this._isMoving) {
            this._isMoving = false;
            if (this.onDragEnd) {
                this.onDragEnd.emit([this.node, startPos, clickPos]);
            }
            return;
        }

        // 判断是触发双击还是单击事件
        this.unschedule(this._scheduleCopy);
        let onDoubleClickCheckEnd = () => {
            this._checkDbClick = false;
            if (this.onClick) {
                this.onClick.emit([this.node, clickPos]);
            }
        };

        if (this._checkDbClick) {
            this._checkDbClick = false;
            if (this.onDoubleClick) {
                this.onDoubleClick.emit([this.node, clickPos]);
            }
            return;
        }

        this._checkDbClick = true;
        this.scheduleOnce(onDoubleClickCheckEnd, this.doubleClickCheckInterval);
        this._scheduleCopy = onDoubleClickCheckEnd;
    }
}
