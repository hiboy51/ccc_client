/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/FitScreen.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Tuesday, June 18th 2019, 5:19:45 pm
 * Author: kinnonzhang
 * 
 * Copyright (c) 2019 Your Company
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FitScreen extends cc.Component {
    // ====================================================================================
    // life cycle
    // ====================================================================================
    onLoad() {
        this.node.setContentSize(cc.winSize);
    }
}