
const {ccclass, property} = cc._decorator;

@ccclass
export default class AudioMgr{
    public static musicState = true;
    public static effectState = true;
    public static musicInfo = null;
    public static init() {
        let state = cc.sys.localStorage.getItem("musicState");
        if (state == "false") {
            this.musicState = false;
        }
        this.setMusicState(this.musicState);

        state = cc.sys.localStorage.getItem("effectState");
        if (state == "false") {
            this.effectState = false;
        }
        this.setEffectState(this.effectState);

        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });
    }

    public static setMusicState(state: boolean) {
        this.musicState = state;
        if (state) {
            if (this.musicInfo) {
                this.playMusic(this.musicInfo.url, this.musicInfo.loop);
            }
        } else {
            cc.audioEngine.stopMusic();
        
        }
        cc.sys.localStorage.setItem("musicState", state);
    }

    public static setEffectState(state: boolean) {
        this.effectState = state;
        if (!state) {
            cc.audioEngine.stopAllEffects()
        }
        cc.sys.localStorage.setItem("effectState", state);
    }

    public static playMusic(url: string, loop: boolean = false) {
        this.stopMusic()
        this.musicInfo = {url: url, loop: loop};
        if (!this.musicState) {
            return;
        }
        url = "sounds/" + url;
        cc.loader.loadRes(url, cc.AudioClip, function (err, clip) {
            if (err) {
                console.log(err);
            } else {
                cc.audioEngine.playMusic(clip, loop);
            }
        });
    }

    public static stopMusic() {
        this.musicInfo = null;
        cc.audioEngine.stopMusic();
    }

    public static playEffect(url: string, loop: boolean = false) {
        if (!this.effectState) {
            return;
        }
        url = "sounds/" + url;
        cc.loader.loadRes(url, cc.AudioClip, function (err, clip) {
            if (err) {
                console.log(err);
            } else {
                let audioID = cc.audioEngine.playEffect(clip, loop);
            }
        });
    }
}
