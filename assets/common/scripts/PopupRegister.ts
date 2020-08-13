import { PopupManager } from "./popup_manager/PopupManager";
import PopupBase from "./popup_manager/PopupBase";

//! 所有动态定义的弹窗在此处声明
//! 此文件属于项目范畴,可以在项目的任意位置定义

declare module "./popup_manager/PopupManager" {
    namespace PopupManager {
        //* Tips Popup
        function Tips(...args: any[]): PopupBase;
        function $Tips(): void;

        //* Waiting Popup
        function Waiting(...args: any[]): PopupBase;
        function $Waiting(): void;

        //* MsgBox Popup
        function MsgBox(...args: any[]): PopupBase;
        function $MsgBox(): void;
    }
}
