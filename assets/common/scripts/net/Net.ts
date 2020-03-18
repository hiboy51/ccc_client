import { SY } from "../ByteArray";
export default class Net {
    public static sn: number = 0;
    private m_websocket;
    private rmsgbyte: SY.ByteArray;
    private totalNum: number;
    private isconnect: boolean;
    private tmsgbyte: SY.ByteArray;
    public openFunc: Function;
    public closeFunc: Function;
    public errorFunc: Function;
    public msgFunc: Function;
    public Url: string;
    public Port: number;
    private key: string;
    private reconnectCount: number;
    private _connectTimeoutHandler: number = NaN;

    public static mspac: number = 12;

    constructor(
        key: string,
        url: string,
        port: number,
        closefunc?: Function,
        openfunc?: Function,
        errofunc?: Function,
        msgfunc?: Function
    ) {
        this.openFunc = openfunc;
        this.closeFunc = closefunc;
        this.errorFunc = errofunc;
        this.msgFunc = msgfunc;
        this.key = key;
        this.Url = url;
        this.Port = port;
        this.reconnectCount = 0;
    }

    private onSocketClose(event: EventListener): void {
        cc.log("WebClose");
        if (!Number.isNaN(this._connectTimeoutHandler)) {
            clearTimeout(this._connectTimeoutHandler);
            this._connectTimeoutHandler = NaN;
        }

        let ts = this;
        ts.isconnect = false;
        if (ts.closeFunc) {
            ts.closeFunc(this.key);
        }
    }
    private onSocketOpen(event: EventListener): void {
        cc.log("WebOpen");

        if (!Number.isNaN(this._connectTimeoutHandler)) {
            clearTimeout(this._connectTimeoutHandler);
            this._connectTimeoutHandler = NaN;
        }

        let ts = this;
        ts.isconnect = true;
        ts.rmsgbyte = new SY.ByteArray();
        ts.tmsgbyte = new SY.ByteArray();

        if (ts.openFunc) {
            ts.openFunc(this.key);
        }
    }
    private onSocketError(event: EventListener): void {
        cc.log("WebError");
        if (!Number.isNaN(this._connectTimeoutHandler)) {
            clearTimeout(this._connectTimeoutHandler);
            this._connectTimeoutHandler = NaN;
        }

        let ts = this;
        ts.isconnect = false;

        if (ts.errorFunc != undefined) {
            ts.errorFunc(this.key);
        }
        ts.reconnectCount = 0;

        // if(ts.reconnectCount > 3) {
        // 	if (ts.errorFunc != undefined) {
        // 		ts.errorFunc(this.key);
        // 	}
        // 	ts.reconnectCount = 0;
        // 	cc.log("WebError");
        // } else {
        // 	cc.log("WebReconnect "+ts.reconnectCount);
        // 	this.connect();
        // }
    }
    private onSocketMessage(msg: MessageEvent): void {
        // cc.log(`recieve point time: ${new Date().getTime()}`);
        let ts = this;
        let tb = ts.rmsgbyte;
        ts.totalNum += msg.data.length;
        // 利用fileread将blob转换玮arraybuffer，再将arraybuffer生成uint8array，再生成bytearray，再利用bytearray的readbytes将字节流读给tb，再去解析tb
        if (CC_JSB) {
            let readbuffer = new SY.ByteArray(new Uint8Array(msg.data as ArrayBuffer));
            readbuffer.readBytes(tb, tb.length);

            while (tb.length >= Net.mspac) {
                tb.position = 0;
                // 解析分发
                let tl = ts.decode();
                if (0 != tl) {
                    if (0 >= tb.length) {
                        tb.clear();
                        break;
                    }
                    ts.tmsgbyte.writeBytes(tb, tl);
                    ts.tmsgbyte.position = 0;
                    tb.clear();
                    tb.writeBytes(ts.tmsgbyte);
                    tb.position = 0;
                    ts.tmsgbyte.clear();
                } else {
                    tb.position = 0;
                    break;
                }
            }
        } else {
            let filereader = new FileReader();
            filereader.onload = function() {
                let readbuffer = new SY.ByteArray(new Uint8Array(filereader.result as ArrayBuffer));
                readbuffer.readBytes(tb, tb.length);

                while (tb.length >= Net.mspac) {
                    tb.position = 0;
                    // 解析分发
                    let tl = ts.decode();
                    if (0 != tl) {
                        if (0 >= tb.length) {
                            tb.clear();
                            break;
                        }
                        ts.tmsgbyte.writeBytes(tb, tl);
                        ts.tmsgbyte.position = 0;
                        tb.clear();
                        tb.writeBytes(ts.tmsgbyte);
                        tb.position = 0;
                        ts.tmsgbyte.clear();
                    } else {
                        tb.position = 0;
                        break;
                    }
                }
            };
            filereader.readAsArrayBuffer(msg.data);
        }
    }

    public send(msg: string, data?: any): void {
        data = data || {};
        let ts = this;
        if (ts.isconnect) {
            this._snSelfIncrement();
            let tb = ts.encodeAny(msg, data, Net.sn);
            // cc.log(`send (${msg}) point time: ${new Date().getTime()}`);
            ts.m_websocket.send(tb.bytes.slice(0, tb.length));
        } else {
        }
    }

    private _snSelfIncrement() {
        let increment = Net.sn + 1;
        Net.sn = increment == 32767 ? 1 : increment;
    }

    public close() {
        let ts = this;
        if (ts.isconnect) {
            ts.m_websocket.close();
            ts.isconnect = false;
            ts.m_websocket = undefined;
            ts.reconnectCount = 0;
        }
    }

    public connect() {
        let _url = this.Url;
        if (this.Port != undefined) {
            _url = this.Url + ":" + this.Port;
        }
        if (this.m_websocket) {
            this.m_websocket.onclose = null;
            this.m_websocket.onopen = null;
            this.m_websocket.onerror = null;
            this.m_websocket.onmessage = null;
            this.m_websocket.close();
        }

        if (CC_JSB) {
            let pemUrl = cc.url.raw("resources/cacert.pem");
            this.m_websocket = new WebSocket(_url, null, pemUrl);
        } else {
            this.m_websocket = new WebSocket(_url);
        }
        this.m_websocket.onclose = this.onSocketClose.bind(this);
        this.m_websocket.onopen = this.onSocketOpen.bind(this);
        this.m_websocket.onerror = this.onSocketError.bind(this);
        this.m_websocket.onmessage = this.onSocketMessage.bind(this);
        this.reconnectCount += 1;
        const timeout = 10000;
        if (!Number.isNaN(this._connectTimeoutHandler)) {
            clearTimeout(this._connectTimeoutHandler);
            this._connectTimeoutHandler = NaN;
        }
        this._connectTimeoutHandler = setTimeout(() => {
            cc.log(`timeout to connect to ${this.Url}:${this.Port}`);

            this._connectTimeoutHandler = NaN;
            if (this.m_websocket) {
                this.m_websocket.close();
                this.isconnect = false;
                this.m_websocket = undefined;
                this.reconnectCount = 0;
            }
        }, timeout);
    }

    private encodeAny(key: string, data: any, tn: number): SY.ByteArray {
        let ta = Net.resolveKeyWord(key);
        let tstr = JSON.stringify(data);
        let tsb = new SY.ByteArray();
        tsb.writeUTFBytes(tstr);
        let st = 0;
        let tl = tsb.length;
        let tb = new SY.ByteArray();
        tb.writeUnsignedShort(0); // 0
        tb.writeUnsignedShort(tl + 8); // len
        tb.writeByte(0); // version
        tb.writeByte(0); // format
        tb.writeUnsignedShort(st); // state
        tb.writeUnsignedShort(tn); // sn
        tb.writeByte(+ta[0]); // module
        tb.writeByte(+ta[1]); // commands
        tb.writeBytes(tsb);
        tb.position = 0;
        return tb;
    }

    private decode(): number {
        let ts = this;
        let tb = ts.rmsgbyte;
        let th = tb.readUnsignedShort();
        let tl = tb.readUnsignedShort();
        if (tl > tb.length) {
            return 0;
        }
        let tv = tb.readByte(); // version
        let tf = tb.readByte(); // format
        let tt = tb.readUnsignedShort(); // state
        let tn = tb.readUnsignedShort(); // sn
        let tm = tb.readByte(); // module
        let tc = tb.readByte(); // commond
        if (8 == tl) {
            return Net.mspac;
        }
        let td = "";
        td = tb.readUTFBytes(tl - 8);
        let ti = JSON.parse(td);
        let tk = Net.mergeKeyWord(tm, tc);
        // 抛出回调
        if (this.msgFunc != undefined) {
            try {
                this.msgFunc(this.key, tk, ti, tn);
            } catch (error) {
                console.error(error);
            }
        }
        return tl + 4;
    }

    public static mergeKeyWord(_m: number, _c: number): string {
        return _m + "|" + _c;
    }

    public static resolveKeyWord(_k: string): string[] {
        return _k.split("|");
    }
}
