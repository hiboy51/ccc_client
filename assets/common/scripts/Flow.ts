export async function performWhile(doThings: ()=>any, cond: boolean | (()=>boolean)) {
    await new Promise(resolve => {
        let handler = setInterval(() => {
            if ((typeof (cond) == "function" && cond()) || (typeof (cond) == "boolean" && cond)) {
                resolve();
                clearInterval(handler);
            }
        }, 100);
    });
    return doThings();
}

export function performSomething(doThings: ()=>any, cond:()=>boolean, callback: ()=>any, timeout: number = 10000) {

}

/**
 * 用于处理异步过程中的异常
 * @example
 *      let pe = performAsyncWithErrorCatch(doSomethingAync); 
 *      let [err, result] = pe(...);
 *      if (err) { ... } else {...}
 * @param asyncFunc 异步执行的
 */
export function performAsyncWithErrorCatch(asyncFunc: Function) {
    return async function(...args) {
        try{
            return [null, await asyncFunc.apply(this, args)];
        } catch (e) {
            return [e, null];
        }
    }
}