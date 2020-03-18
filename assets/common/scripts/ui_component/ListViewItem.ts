/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/ListViewItem.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Wednesday, June 19th 2019, 4:40:42 pm
 * Author: kinnonzhang
 * 
 * Copyright (c) 2019 Your Company
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class ListViewItem extends cc.Component {
    public inUse: boolean = false;
    public actualIdx: number = 0;
}