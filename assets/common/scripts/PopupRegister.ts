import { PopupManager } from "./popup_manager/PopupManager";
import PopupBase from "./popup_manager/PopupBase";
import { MsgBoxOption } from "./ui_component/MsgBoxPopup";

//! 所有动态定义的弹窗在此处声明
//! 此文件属于项目范畴,可以在项目的任意位置

declare module "./popup_manager/PopupManager" {
    namespace PopupManager {
        //* Tips Popup
        function Tips(txt: string, lasts?: number, forbiddenTouch?: boolean): PopupBase;
        function $Tips(): void;

        //* Waiting Popup
        function Waiting(txt?: string, timeout?: number, forbiddenTouch?: boolean): PopupBase;
        function $Waiting(): void;

        //* MsgBox Popup
        function MsgBox(msg: string, option?: MsgBoxOption | MsgBoxOption[]): PopupBase;
        function $MsgBox(): void;
    }
}
