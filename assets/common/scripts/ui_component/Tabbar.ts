import Utils from "../Utils";

const { ccclass, property } = cc._decorator;

export interface ITabbarValidate {
    validate(selected: number): boolean;
    validateFail?(sel: number): void;
}

@ccclass
export default class Tabbar extends cc.Component {
    @property(cc.Integer)
    initIndex: number = 0;

    @property(cc.Component.EventHandler)
    selectHandler: cc.Component.EventHandler = null;

    public validateDelegate: ITabbarValidate = null;

    private selectIndex: number = 0;

    onLoad() {
        for (let i = 0; i < this.node.childrenCount; ++i) {
            let baritem = this.node.children[i];
            let normal = baritem.getChildByName("normal");
            let btn = normal.addComponent(cc.Button);
            Utils.addClickEvent(btn, this.node, "Tabbar", "onClickItem", String(i));
        }

        this.selectTab(this.initIndex);
    }

    selectTab(index) {
        if (this.validateDelegate && !this.validateDelegate.validate(index)) {
            this.validateDelegate.validateFail && this.validateDelegate.validateFail(index);
            return;
        }

        this.selectIndex = index;

        for (let i = 0; i < this.node.childrenCount; ++i) {
            let baritem = this.node.children[i];
            let normal = baritem.getChildByName("normal");
            let selected = baritem.getChildByName("selected");

            normal.active = i != index;
            selected.active = i == index;
        }
        this.selectHandler && this.selectHandler.emit([index]);
    }

    onClickItem(event, eventData) {
        this.selectTab(Number(eventData));
    }
}
