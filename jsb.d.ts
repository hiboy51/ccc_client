/**
 * 原生交互
 */
declare namespace jsb {
    export interface IKV {
        [index: string]: any;
    }

    export interface ManifestAsset {
        md5: string;
        path: string;
        compressed: boolean;
        size: number;

        /** @see：jsb.Manifest.DownloadState */
        downloadState: 0 | 1 | 2 | 3;
    }

    /** 反射调用 */
    export module reflection {
        /**
         * 调用 iOS 原生方法
         * @param className iOS 类型
         * @param methodName 方法名
         * @param args 参数
         * https://docs.cocos.com/creator/manual/zh/advanced-topics/oc-reflection.html
         */
        function callStaticMethod(className: string, methodName: string, ...args: any[]);

        /**
         * 调用 android 原生方法
         * @param className Java 包路径的完整类名
         * @param methodName 方法名
         * @param methodSignature 方法签名
         * @param args 参数
         *
         * https://docs.cocos.com/creator/manual/zh/advanced-topics/java-reflection.html
         */
        function callStaticMethod(
            className: string,
            methodName: string,
            methodSignature: string,
            ...args: any[]
        );
    }

    /**
     * 文件、文件夹工具
     *
     * 可查看绑定文件：
     * cocos2d_js_bindings.xcodeproj -> auto -> jsb_cocos2dx_auto.cpp -> js_regsiter_cocos2dx_FileUtils
     */
    export module fileUtils {
        /**
         * 清空文件路径缓存
         */
        function purgeCachedEntries(): void;

        /**
         * Gets string from a file.
         * @param filename
         */
        function getStringFromFile(filename: string): string;

        /**
         * Creates binary data from a file.
         * @param filename
         */
        function getDataFromFile(filename: string): Uint8Array;

        /**
         * Removes a file.
         * @param filepath filepath The full path of the file, it must be an absolute path.
         * @returns True if the file have been removed successfully, false if not.
         */
        function removeFile(filepath: string): boolean;

        /**
         * Checks whether the path is an absolute path.
         * @note On Android, if the parameter passed in is relative to "assets/", this method will treat it as an absolute path.
         *        Also on Blackberry, path starts with "app/native/Resources/" is treated as an absolute path.
         * @param path The path that needs to be checked.
         * @returns True if it's an absolute path, false if not.
         */
        function isAbsolutePath(path: string): boolean;

        /**
         * Checks whether the path is a directory.
         * @param path  The path of the directory, it could be a relative or an absolute path.
         * @returns True if the directory exists, false if not.
         */
        function isDirectoryExist(path: string): boolean;

        /**
         * List all files in a directory.
         * @param dirPath The path of the directory, it could be a relative or an absolute path.
         */
        function listFiles(dirPath: string): string[];

        /**
         * List all files recursively in a directory.
         * @param dirPath The path of the directory, it could be a relative or an absolute path.
         * @param files
         */
        function listFilesRecursively(dirPath: string, files: string[]): void;

        /**
         * Creates a directory.
         * @param dirPath  The path of the directory, it must be an absolute path.
         * @returns True if the directory have been created successfully, false if not.
         */
        function createDirectory(dirPath: string): boolean;

        /**
         * Removes a directory.
         * @param dirPath The full path of the directory, it must be an absolute path.
         * @returns True if the directory have been removed successfully, false if not.
         */
        function removeDirectory(dirPath: string): boolean;

        /**
         * Renames a file under the given directory.
         * @param dirPath  The parent directory path of the file, it must be an absolute path.
         * @param oldname The current name of the file.
         * @param name The new name of the file.
         * @returns True if the file have been renamed successfully, false if not.
         */
        function renameFile(dirPath: string, oldname: string, name: string): boolean;

        /**
         * Renames a file under the given directory.
         * @param oldfullpath The current fullpath of the file. Includes path and name.
         * @param newfullpath The new fullpath of the file. Includes path and name.
         * @returns True if the file have been renamed successfully, false if not.
         */
        function renameFile(oldfullpath: string, newfullpath: string): boolean;

        /**
         * Retrieve the file size.
         * If a relative path was passed in, it will be inserted a default root path at the beginning.
         * @param filepath The path of the file, it could be a relative or absolute path.
         * @returns The file size.
         */
        function getFileSize(filepath: string): number;

        /**
         * Returns the fullpath for a given filename.
         * 
         * First it will try to get a new filename from the "filenameLookup" dictionary.
         * If a new filename can't be found on the dictionary, it will use the original filename.
         * Then it will try to obtain the full path of the filename using the FileUtils search rules: resolutions, and search paths.
         * The file search is based on the array element order of search paths and resolution directories.

         * For instance:

         * We set two elements("/mnt/sdcard/", "internal_dir/") to search paths vector by setSearchPaths,
         * and set three elements("resources-ipadhd/", "resources-ipad/", "resources-iphonehd")
         * to resolutions vector by setSearchResolutionsOrder. The "internal_dir" is relative to "Resources/".

         * If we have a file named 'sprite.png', the mapping in fileLookup dictionary contains `key: sprite.png -> value: sprite.pvr.gz`.
         * Firstly, it will replace 'sprite.png' with 'sprite.pvr.gz', then searching the file sprite.pvr.gz as follows:

         *    /mnt/sdcard/resources-ipadhd/sprite.pvr.gz      (if not found, search next)
         *    /mnt/sdcard/resources-ipad/sprite.pvr.gz        (if not found, search next)
         *    /mnt/sdcard/resources-iphonehd/sprite.pvr.gz    (if not found, search next)
         *    /mnt/sdcard/sprite.pvr.gz                       (if not found, search next)
         *    internal_dir/resources-ipadhd/sprite.pvr.gz     (if not found, search next)
         *   internal_dir/resources-ipad/sprite.pvr.gz       (if not found, search next)
         *   internal_dir/resources-iphonehd/sprite.pvr.gz   (if not found, search next)
         *    internal_dir/sprite.pvr.gz                      (if not found, return "sprite.png")

         * If the filename contains relative path like "gamescene/uilayer/sprite.png",
         * and the mapping in fileLookup dictionary contains `key: gamescene/uilayer/sprite.png -> value: gamescene/uilayer/sprite.pvr.gz`.
         * The file search order will be:

         *    /mnt/sdcard/gamescene/uilayer/resources-ipadhd/sprite.pvr.gz      (if not found, search next)
         *    /mnt/sdcard/gamescene/uilayer/resources-ipad/sprite.pvr.gz        (if not found, search next)
         *    /mnt/sdcard/gamescene/uilayer/resources-iphonehd/sprite.pvr.gz    (if not found, search next)
         *    /mnt/sdcard/gamescene/uilayer/sprite.pvr.gz                       (if not found, search next)
         *    internal_dir/gamescene/uilayer/resources-ipadhd/sprite.pvr.gz     (if not found, search next)
         *    internal_dir/gamescene/uilayer/resources-ipad/sprite.pvr.gz       (if not found, search next)
         *    internal_dir/gamescene/uilayer/resources-iphonehd/sprite.pvr.gz   (if not found, search next)
         *    internal_dir/gamescene/uilayer/sprite.pvr.gz                      (if not found, return "gamescene/uilayer/sprite.png")

         * If the new file can't be found on the file system, it will return the parameter filename directly.

         * This method was added to simplify multiplatform support. Whether you are using cocos2d-js or any cross-compilation toolchain like StellaSDK or Apportable,
         * you might need to load different resources for a given file in the different platforms.
         * @param filename 
         */
        function fullPathForFilename(filename: string): string;

        /**
         * Loads the filenameLookup dictionary from the contents of a filename.
         *
         * * @note The plist file name should follow the format below:
         *
         * @code
         * <?xml version="1.0" encoding="UTF-8"?>
         * <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
         * <plist version="1.0">
         * <dict>
         *     <key>filenames</key>
         *     <dict>
         *         <key>sounds/click.wav</key>
         *         <string>sounds/click.caf</string>
         *         <key>sounds/endgame.wav</key>
         *         <string>sounds/endgame.caf</string>
         *         <key>sounds/gem-0.wav</key>
         *         <string>sounds/gem-0.caf</string>
         *     </dict>
         *     <key>metadata</key>
         *     <dict>
         *         <key>version</key>
         *         <integer>1</integer>
         *     </dict>
         * </dict>
         * </plist>
         * @endcode
         * @param filename The plist file name.
         */
        function loadFilenameLookup(filename: string);

        /**
         * Gets full path from a file name and the path of the relative file.
         * @param filename The file name.
         * @param relativeFile The path of the relative file.
         * @returns The full path.
         *          e.g. filename: hello.png, pszRelativeFile: /User/path1/path2/hello.plist
         *               Return: /User/path1/path2/hello.pvr (If there a a key(hello.png)-value(hello.pvr) in FilenameLookup dictionary. )
         */
        function fullPathFromRelativeFile(filename: string, relativeFile: string): string;

        /**
         *  Sets the array that contains the search order of the resources.
         * @param searchResolutionsOrder The source array that contains the search order of the resources.
         */
        function setSearchResolutionsOrder(searchResolutionsOrder: string[]): void;

        /**
         * Append search order of the resources.
         * @param order
         * @param front
         */
        function addSearchResolutionsOrder(order: string, front = false): void;

        /**
         * Gets the array that contains the search order of the resources.
         */
        function getSearchResolutionsOrder(): string[];

        /**
         * Sets the array of search paths.
         *
         *  You can use this array to modify the search path of the resources.
         *  If you want to use "themes" or search resources in the "cache", you can do it easily by adding new entries in this array.
         *
         *  @note This method could access relative path and absolute path.
         *        If the relative path was passed to the vector, FileUtils will add the default resource directory before the relative path.
         *        For instance:
         *            On Android, the default resource root path is "assets/".
         *            If "/mnt/sdcard/" and "resources-large" were set to the search paths vector,
         *            "resources-large" will be converted to "assets/resources-large" since it was a relative path.
         *
         *  @param searchPaths The array contains search paths.
         */
        function setSearchPaths(searchPaths: string[]);

        /**
         * Set default resource root path.
         * @param path
         */
        function setDefaultResourceRootPath(path: string);

        /**
         * Add search path.
         * @param path
         * @param front
         */
        function addSearchPath(path: string, front = false): void;

        /**
         * Gets the array of search paths.
         */
        function getSearchPaths(): string[];

        /**
         * Gets the writable path.
         * @returns  The path that can be write/read a file in
         */
        function getWritablePath(): string;

        /**
         * Sets writable path.
         * @param writablePath
         */
        function setWritablePath(writablePath: string): void;

        /**
         * Sets whether to pop-up a message box when failed to load an image.
         * @param notify
         */
        function setPopupNotify(notify: boolean): void;

        /**
         *  Checks whether to pop up a message box when failed to load an image.
         *  @return True if pop up a message box when failed to load an image, false if not.
         */
        function isPopupNotify(): boolean;

        /**
         *  Converts the contents of a file to a ValueMap.
         *  @param filename The filename of the file to gets content.
         *  @return ValueMap of the file contents.
         *  @note This method is used internally.
         */
        function getValueMapFromFile(filename: string): IKV;

        /**
         * Converts the contents of a file to a ValueMap.
         *  This method is used internally.
         */
        function getValueMapFromData(): IKV;

        /**
         *  write a ValueMap into a plist file
         *
         * @param dict the ValueMap want to save
         * @param fullPath The full path to the file you want to save a string
         * @returns bool
         */
        function writeToFile(dict: IKV, fullPath: string): boolean;

        /**
         *  write a string into a file
         *
         * @param dataStr the string want to save
         * @param fullPath The full path to the file you want to save a string
         * @returns bool True if write success
         */
        function writeStringToFile(str: string, fullPath: string): boolean;

        /**
         * write Data into a file
         * @param data the data want to save
         * @param fullPath The full path to the file you want to save a string
         */
        function writeDataToFile(
            data:
                | Uint8Array
                | Uint8ClampedArray
                | Uint16Array
                | Uint32Array
                | Int8Array
                | Int16Array
                | Int32Array
                | Float32Array
                | Float64Array,
            fullPath: string
        ): boolean;

        /**
         * write ValueMap into a plist file
         *
         * @param dict the ValueMap want to save
         * @param fullPath The full path to the file you want to save a string
         */
        function writeValueMapToFile(dict: IKV, fullPath: string): boolean;

        /**
         * write ValueVector into a plist file
         *
         * @param vecData the ValueVector want to save
         * @param fullPath The full path to the file you want to save a string
         */
        function writeValueVectorToFile(vecData: any[], fullPath: string): boolean;

        /**
         * Windows fopen can't support UTF-8 filename
         * Need convert all parameters fopen and other 3rd-party libs
         *
         * @param filenameUtf8 std::string name file for conversion from utf-8
         * @returns std::string ansi filename in current locale
         */
        function getSuitableFOpen(filenameUtf8: string): string;

        /**
         * Converts the contents of a file to a ValueVector.
         * This method is used internally.
         * @param filename
         */
        function getValueVectorFromFile(filename: string): any[];

        /**
         *  Checks whether a file exists.
         *
         *  @note If a relative path was passed in, it will be inserted a default root path at the beginning.
         *  @param filename The path of the file, it could be a relative or absolute path.
         *  @returns True if the file exists, false if not.
         */
        function isFileExist(filename: string): boolean;

        /**
         *  Gets filename extension is a suffix (separated from the base filename by a dot) in lower case.
         *  Examples of filename extensions are .png, .jpeg, .exe, .dmg and .txt.
         *  @param filePath The path of the file, it could be a relative or absolute path.
         *  @returns suffix for filename in lower case or empty if a dot not found.
         */
        function getFileExtension(filePath: string): string;
    }

    /**
     * jsb.AssetsManager is the native AssetsManager for your game resources or scripts.
     */
    export class AssetsManager {
        static State = {
            UNINITED: 0,
            UNCHECKED: 1,
            PREDOWNLOAD_VERSION: 2,
            DOWNLOADING_VERSION: 3,
            VERSION_LOADED: 4,
            PREDOWNLOAD_MANIFEST: 5,
            DOWNLOADING_MANIFEST: 6,
            MANIFEST_LOADED: 7,
            NEED_UPDATE: 8,
            READY_TO_UPDATE: 9,
            UPDATING: 10,
            UNZIPPING: 11,
            UP_TO_DATE: 12,
            FAIL_TO_UPDATE: 13
        };

        /**
         * Create function for creating a new AssetsManagerEx
         * @param manifestUrl   The url for the local manifest file
         * @param storagePath   The storage path for downloaded assets
         * @warning   The cached manifest in your storage path have higher priority and will be searched first,
                only if it doesn't exist, AssetsManagerEx will use the given manifestUrl.
         */
        static create(manifestUrl: string, storagePath: string): AssetsManager;

        constructor(manifestUrl: string, storagePath: string);

        constructor(
            manifestUrl: string,
            storagePath: string,
            handle: (versionA: string, versionB: string) => number
        );

        /**
         *  Gets the current downloaded files count of the update, this will only be available after READY_TO_UPDATE state, under unknown states it will return 0 by default.
         */
        getDownloadedFiles(): number;

        /**
         * Gets the current update state.
         * @see jsb.AssetsManager.State
         */
        getState(): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

        /**
         * Function for retrieving the max concurrent task count
         */
        getMaxConcurrentTask(): number;

        /**
         * Gets the total files count to be downloaded of the update, this will only be available after READY_TO_UPDATE state, under unknown states it will return 0 by default.
         */
        getTotalFiles(): number;

        /**
         *  Load a custom remote manifest object, the manifest must be loaded already.
         * You can only manually load remote manifest when the update state is UNCHECKED and local manifest is already inited, it will fail once the update process is began.
         * @param remoteManifest  The remote manifest object to be set
         */
        loadRemoteManifest(remoteManifest: jsb.Manifest): boolean;

        /**
         * Check out if there is a new version of manifest.
         * You may use this method before updating, then let user determine whether
         * he wants to update resources.
         */
        checkUpdate(): void;

        /**
         * Gets the total byte size to be downloaded of the update, this will only be available after READY_TO_UPDATE state, under unknown states it will return 0 by default.
         */
        getTotalBytes(): number;

        /**
         * Set the verification function for checking whether downloaded asset is correct, e.g. using md5 verification
         * @param callback The verify callback function
         */
        setVerifyCallback(callback: (path: string, asset: ManifestAsset) => boolean): void;

        /**
         * Gets storage path.
         */
        getStoragePath(): string;

        /**
         * Update with the current local manifest.
         */
        update(): void;

        /**
         * Set the handle function for comparing manifests versions
         * @param handle The compare function
         */
        setVersionCompareHandle(handle: (versionA: string, versionB: string) => -1 | 0 | 1): void;

        /**
         * Function for setting the max concurrent task count
         * @param max
         */
        setMaxConcurrentTask(max: number): void;

        /**
         * Gets the current downloaded byte size of the update, this will only be available after READY_TO_UPDATE state, under unknown states it will return 0 by default.
         */
        getDownloadedBytes(): number;

        /**
         * Function for retrieving the local manifest object
         */
        getLocalManifest(): jsb.Manifest;

        /**
         * Load a custom local manifest object, the local manifest must be loaded already.
         * You can only manually load local manifest when the update state is UNCHECKED, it will fail once the update process is began.
         * This API will do the following things:
         * 1. Reset storage path
         * 2. Set local storage
         * 3. Search for cached manifest and compare with the local manifest
         * 4. Init temporary manifest and remote manifest
         * If successfully load the given local manifest and inited other manifests, it will return true, otherwise it will return false
         * @param localManifest    The local manifest object to be set
         * @param storagePath    The local storage path
         */
        loadLocalManifest(localManifest: Manifest, storagePath: string): boolean;

        loadLocalManifest(localManifest: string): boolean;

        /**
         * getRemoteManifest
         */
        getRemoteManifest(): jsb.Manifest;

        /**
         * Prepare the update process, this will cleanup download process flags, fill up download units with temporary manifest or remote manifest
         */
        prepareUpdate(): void;

        /**
         * Reupdate all failed assets under the current AssetsManagerEx context
         */
        downloadFailedAssets(): void;

        /**
         * Gets whether the current download is resuming previous unfinished job, this will only be available after READY_TO_UPDATE state, under unknown states it will return false by default.
         */
        isResuming(): boolean;

        /** @brief Set the event callback for receiving update process events
         * @param callback  The event callback function
         */
        setEventCallback(callback: (event: EventAssetsManager) => void): void;
    }

    export class Manifest {
        static DownloadState = {
            UNSTARTED: 0,
            DOWNLOADING: 1,
            SUCCESSED: 2,
            UNMARKED: 3
        };

        /**
         *  Constructor for Manifest class, create manifest by parsing a json file
         * @param manifestUrl Url of the local manifest
         */
        constructor(manifestUrl: string = "");

        /**
         *  Constructor for Manifest class, create manifest by parsing a json string
         * @param content Json string content
         * @param manifestRoot The root path of the manifest file (It should be local path, so that we can find assets path relative to the root path)
         */
        constructor(content: string, manifestRoot: string);

        /**
         * Get the manifest root path, normally it should also be the local storage path.
         */
        getManifestRoot(): string;

        /**
         * Set whether the manifest is being updating
         * @param updating Updating or not
         */
        setUpdating(updating: boolean): void;

        /**
         * Gets remote manifest file url.
         */
        getManifestFileUrl(): string;

        /**
         * Check whether the version informations have been fully loaded
         */
        isVersionLoaded(): boolean;

        /**
         * Parse the manifest file information into this manifest
         * @param manifestUrl Url of the local manifest
         */
        parseFile(manifestUrl: string): void;

        /**
         * Check whether the manifest have been fully loaded
         */
        isLoaded(): boolean;

        /**
         * Gets remote package url.
         */
        getPackageUrl(): string;

        /**
         * Get whether the manifest is being updating
         * @returns Updating or not
         */
        isUpdating(): boolean;

        /**
         * Gets manifest version.
         */
        getVersion(): string;

        /**
         * Parse the manifest from json string into this manifest
         * @param content Json string content
         * @param manifestRoot The root path of the manifest file (It should be local path, so that we can find assets path relative to the root path)
         */
        parseJSONString(content: string, manifestRoot: string): void;

        /**
         * Gets remote version file url.
         */
        getVersionFileUrl(): string;

        /**
         * Get the search paths list related to the Manifest.
         */
        getSearchPaths(): string[];
    }

    export class EventAssetsManager {
        static ERROR_NO_LOCAL_MANIFEST = 0;
        static ERROR_DOWNLOAD_MANIFEST = 1;
        static ERROR_PARSE_MANIFEST = 2;
        static NEW_VERSION_FOUND = 3;
        static ALREADY_UP_TO_DATE = 4;
        static UPDATE_PROGRESSION = 5;
        static ASSET_UPDATED = 6;
        static ERROR_UPDATING = 7;
        static UPDATE_FINISHED = 8;
        static UPDATE_FAILED = 9;
        static ERROR_DECOMPRESS = 10;

        constructor(
            eventName: string,
            manager: AssetsManager,
            code: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
        );
        getAssetsManagerEx(): AssetsManager;
        getDownloadedFiles(): number;
        getTotalFiles(): number;
        getAssetId(): string;
        getTotalBytes(): number;
        getCURLECode(): number;
        getMessage(): string;
        getCURLMCode(): number;
        getDownloadedBytes(): number;
        getPercentByFile(): number;
        getEventCode(): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
        getPercent(): number;
        isResuming(): boolean;
    }

    export class EventListenerAssetsManager {
        static create(): EventListenerAssetsManager;

        constructor(
            assetManager: AssetsManager,
            callback: (eventManager: EventAssetsManager) => void
        );
        init(
            assetManager: AssetsManager,
            callback: (eventManager: EventAssetsManager) => void
        ): void;
    }

    export module Device {
        function setKeepScreenOn(on: Boolean): void;
    }
}
