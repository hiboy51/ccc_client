export default class DataBing {
    public bindMap: Map<any, Array<Map<any, Function>>> = undefined;

    public bindParam(dest: any, target: any, callfunc: Function) {
        if (this.bindMap === undefined) {
            this.bindMap = new Map<any, Array<Map<any, Function>>>();
        }
        let list = this.bindMap.get(dest);
        if (list === undefined) {
            list = new Array<Map<any, Function>>();
            this.bindMap.set(dest, list);
        }
        for (let i = 0; i < list.length; i++) {
            let pmap = list[i];
            if (pmap.get(target) != undefined) {
                return;
            }
        }
        list.push(new Map<any, Function>().set(target, callfunc));
        // this.bindMap.set(dest,new Map<any,Function>().set(target,callfunc));
    }

    public unbindParam(target: any) {
        if (this.bindMap === undefined) {
            return;
        }
        this.bindMap.forEach((v, k) => {
            if (v) {
                for (let i = 0; i < v.length; i++) {
                    let dest = v[i];
                    if (dest) {
                        dest.forEach((v, k) => {
                            if (k == target) {
                                dest.delete(k);
                            }
                        });
                    }
                }
            }
        });
    }

    public unbindAll() {
        // if (this.bindMap === undefined) {
        //     return;
        // }
        // this.bindMap.forEach((v,k)=>{
        //     if (v) {
        //         v.forEach((v1,k1)=>{
        //             v.delete(k1);
        //         })
        //     }
        // })
        this.bindMap = undefined;
    }

    protected noticeBind(key: string, value: any) {
        if (this.bindMap !== undefined) {
            let destlist = this.bindMap.get(key);
            if (destlist) {
                for (let i = 0; i < destlist.length; i++) {
                    let dest = destlist[i];
                    dest.forEach((v, k) => {
                        v(value);
                    });
                }
            }
        }
    }
}
