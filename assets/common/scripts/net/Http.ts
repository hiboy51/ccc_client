
export default class Http {
    public static sendHttpRequest(method: string, url: string, data?: string, callBack?: Function) {
        if (url == "") {
            return;
        }
        
        let xhr = new XMLHttpRequest();
        xhr.responseType = "text";
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                if (callBack) {
                    let response = xhr.responseText;
                    callBack(response);
                }
            }
        }
        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/json");
        if (method == "GET") {
            xhr.send();
        } else {
            xhr.send(data);
        }
    }
}
