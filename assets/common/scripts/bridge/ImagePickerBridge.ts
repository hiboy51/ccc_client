import { GlobalDataCenter } from "../GlobalDataCenter";

export enum IMG_PICK_SOURCE {
    CAMERA = 1,
    PhotoLibrary = 2
}

export interface IImagePickerDelegate {
    onPickImageEnd(uri: string, identifier?: string): void;
    onUploadImageEnd(uri: string, type: number): void;
}
export default class ImagePickerBridge {

    public static readonly Instance: ImagePickerBridge = new ImagePickerBridge();

    private cropListener: Function;

    private _delegate: IImagePickerDelegate = null;
    public get delegate() {
        return this._delegate;
    }

    public pick(source: IMG_PICK_SOURCE = IMG_PICK_SOURCE.CAMERA) {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utils", "photo", "()V");
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("Utils", "pickImage:", source);
        }
    }

    public registListener(del: IImagePickerDelegate) {
        this._delegate = del;

    }

    /**
     * 
     * @param uri 图片的url
     * @param identifier IOS表示图片的唯一标识
     */
    public static onCropImage(uri: string, identifier?: string) {
        let del = ImagePickerBridge.Instance.delegate;
        del && del.onPickImageEnd(uri, identifier);
    }

    public static onUploadImage(uri: string, uploadType: number) {
        let del = ImagePickerBridge.Instance.delegate;
        del && del.onUploadImageEnd(uri, uploadType);
    }

    public uploadImgToServer(imgURLorIdentifier: string, uploadType: number) {
        let api = GlobalDataCenter.Instance.imgUploadAPI;
        let token = GlobalDataCenter.Instance.userToken;
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Utils", "upload", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;I)V", api, token, imgURLorIdentifier, uploadType);
        }
        else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("Utils", "uploadImage:imgURL:withToken:uploadType:",
                api, imgURLorIdentifier, token, uploadType);
        }
    }
}

cc["ImagePickerBridge"] = ImagePickerBridge;