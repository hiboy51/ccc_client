import ListViewItem from "./ListViewItem";

/*
 * Filename: /Users/kinnonzhang/SY01/assets/common/scripts/ListView.ts
 * Path: /Users/kinnonzhang/SY01
 * Created Date: Wednesday, June 19th 2019, 4:23:17 pm
 * Author: kinnonzhang
 *
 * Copyright (c) 2019 Your Company
 */
const { ccclass, property } = cc._decorator;

export interface IListItemDataDelegate {
    refreshListItem: (item: ListViewItem) => any;
    countOfList: () => number;
}

@ccclass
export default class ListView extends cc.Component {
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(ListViewItem)
    tmpl_item: ListViewItem = null;

    @property({
        displayName: "滚动方向上离边界的间隔"
    })
    gap: number = 0;

    @property({
        displayName: "item的间距"
    })
    interval: number = 0;

    _itemsPool: ListViewItem[] = [];
    _actualCount: number = 0;

    private _offsetCache = 0;
    private _frequency = 0.05;
    private _elapse = 0;

    private _dataDelegate: IListItemDataDelegate = null;

    public get capacity() {
        return this._itemsPool.length;
    }

    // ====================================================================================
    // life cycle
    // ====================================================================================
    onLoad() {
        this.tmpl_item.node.active = false;
        let capacity = this._calInitCapacity();
        for (let i = 0; i < capacity; ++i) {
            let item = cc.instantiate(this.tmpl_item.node);
            item.active = true;
            this._itemsPool.push(item.getComponent(ListViewItem));
        }

        this.scrollView.content.position = cc.v3(0, 0, 0);
        this.scrollView.content.setContentSize(this.scrollView.node.getContentSize());
    }

    update(dt) {
        let { x: curOffX, y: curOffY } = this.scrollView.getScrollOffset();
        let curOff = this.scrollView.horizontal ? curOffX : curOffY;
        if (curOff == this._offsetCache) {
            return;
        }
        this._elapse += dt;
        if (this._elapse < this._frequency) {
            return;
        }
        this._elapse = 0;
        this._offsetCache = curOff;

        this.updateList();
    }

    // ====================================================================================
    // public interfaces
    // ====================================================================================
    public get pool() {
        return this._itemsPool;
    }

    public set dataDelegate(del: IListItemDataDelegate) {
        this._dataDelegate = del;
    }

    public get dataDelegate() {
        return this._dataDelegate;
    }

    public reload() {
        if (!this.dataDelegate) {
            return;
        }
        this.clear();
        let count = this.dataDelegate.countOfList();
        if (count == 0) {
            this.scrollView.content.setContentSize(this.scrollView.node.getContentSize());
            this.scrollView.scrollToOffset(cc.v2(0, 0));
            return;
        }

        for (let i = 0; i < count; ++i) {
            this.addItem();
        }
        this.scrollView.scrollToOffset(cc.v2(0, 0));
    }

    public reloadAndKeepPosition() {
        if (!this.dataDelegate) {
            return;
        }

        this.clear();
        let count = this.dataDelegate.countOfList();
        if (count == 0) {
            this.scrollView.content.setContentSize(this.scrollView.node.getContentSize());
            this.scrollView.scrollToOffset(cc.v2(0, 0));
            return;
        }

        for (let i = 0; i < count; ++i) {
            this.addItem();
        }

        let { width: item_w, height: item_h } = this.tmpl_item.node.getContentSize();
        let { width: view_w, height: view_h } = this.scrollView.content.parent.getContentSize();
        let { width: con_w, height: con_h } = this.scrollView.content.getContentSize();
        let dir = this.scrollView.horizontal;
        if (dir) {
            if (view_w - this._offsetCache > con_w) {
                this.scrollView.scrollToRight();
            } else {
                this.scrollView.scrollToOffset(cc.v2(this._offsetCache, 0));
            }
        } else {
            if (view_h + this._offsetCache > con_h) {
                this.scrollView.scrollToBottom();
            } else {
                this.scrollView.scrollToOffset(cc.v2(0, this._offsetCache));
            }
        }
        this.updateList();
    }

    public clear() {
        this._actualCount = 0;
        this._offsetCache = 0;
        this._itemsPool.forEach(each => {
            each.node.parent = null;
            each.inUse = false;
            each.actualIdx = -1;
        });
    }

    public addItem() {
        this._actualCount += 1;
        let curOffset = this.scrollView.getScrollOffset();
        this._updateContentSize();
        this.scrollView.scrollToOffset(curOffset);
        if (this._itemInSight(this._actualCount - 1)) {
            let item = this._getSpareItem();
            if (!item) {
                return;
            }
            item.inUse = true;
            item.actualIdx = this._actualCount - 1;
            this._placeItem(item);
            this._onItemComeInSight(item);
        }
    }

    /**
     *
     * @param forceRefresh 此参数用于强制刷新正在显示的ListItem
     */
    public updateList(forceRefresh: boolean = false) {
        let insightList = [];

        for (let i = 0; i < this._actualCount; ++i) {
            if (this._itemInSight(i)) {
                insightList.push(i);
            }
        }

        // 移除在视野外的item
        for (let item of this._itemsPool) {
            if (!item.inUse) {
                continue;
            }
            let actualIdx = item.actualIdx;
            if (insightList.every(each => each != actualIdx)) {
                this._onItemOutOfSight(item);
            }
        }

        // 添加新进入视野的item
        for (let idx of insightList) {
            let inUseItem = this._itemsPool.find(each => each.inUse && each.actualIdx == idx);
            if (inUseItem) {
                if (forceRefresh) {
                    this._onItemComeInSight(inUseItem);
                }
                continue;
            }
            let spareItem = this._getSpareItem();
            if (!spareItem) {
                continue;
            }
            spareItem.inUse = true;
            spareItem.actualIdx = idx;
            this._placeItem(spareItem);
            this._onItemComeInSight(spareItem);
        }
    }

    public findListItem(predicate: (item: ListViewItem) => boolean) {
        return this._itemsPool.find(each => {
            if (!each.inUse) {
                return false;
            }
            return predicate(each);
        });
    }

    // ====================================================================================
    // private interfaces
    // ====================================================================================

    private _placeItem(item: ListViewItem) {
        if (!item.inUse) {
            return;
        }
        let actualIdx = item.actualIdx;

        let { width: item_w, height: item_h } = this.tmpl_item.node.getContentSize();
        let { width: view_w, height: view_h } = this.scrollView.content.parent.getContentSize();
        let content = this.scrollView.content;
        let contentSize = content.getContentSize();
        let dir = this.scrollView.horizontal;
        let x = 0,
            y = 0;
        if (dir) {
            x = this.gap + actualIdx * (item_w + this.interval) + item_w * item.node.anchorX;
            y = (view_h - item_h) / 2 + item_h * item.node.anchorY;
            item.node.x = x - contentSize.width * content.anchorX;
            item.node.y = y - contentSize.height * content.anchorY;
        } else {
            x = (view_w - item_w) / 2 + item_w * item.node.anchorX;
            y = this.gap + actualIdx * (item_h + this.interval) + item_h * item.node.anchorY;
        }
        item.node.x = x - contentSize.width * content.anchorX;
        item.node.y = contentSize.height * (1 - content.anchorY) - y;
        item.node.parent = content;
    }

    private _getSpareItem() {
        return this._itemsPool.find(each => !each.inUse);
    }

    private _onItemComeInSight(item: ListViewItem) {
        if (this._dataDelegate) {
            this._dataDelegate.refreshListItem(item);
        }
    }

    private _onItemOutOfSight(item: ListViewItem) {
        item.node.parent = null;
        item.inUse = false;
        item.actualIdx = -1;
    }

    private _updateContentSize() {
        let { width: item_w, height: item_h } = this.tmpl_item.node.getContentSize();
        let { width: view_w, height: view_h } = this.scrollView.content.parent.getContentSize();
        let dir = this.scrollView.horizontal;
        let size = cc.size(0, 0);
        if (dir) {
            size.width =
                this._actualCount == 0
                    ? 0
                    : this.gap * 2 +
                      item_w * this._actualCount +
                      (this._actualCount - 1) * this.interval;
            size.width = Math.max(size.width, view_w);
            size.height = item_h;
        } else {
            size.width = item_w;
            size.height =
                this._actualCount == 0
                    ? 0
                    : this.gap * 2 +
                      item_h * this._actualCount +
                      (this._actualCount - 1) * this.interval;
            size.height = Math.max(size.height, view_h);
        }

        this.scrollView.content.setContentSize(size);
    }

    private _itemInSight(_actualIdx: number) {
        let dir = this.scrollView.horizontal;
        let { width: item_w, height: item_h } = this.tmpl_item.node.getContentSize();
        let { width: view_w, height: view_h } = this.scrollView.content.parent.getContentSize();
        let { x: offsetX, y: offsetY } = this.scrollView.getScrollOffset();
        if (dir) {
            let actualX = this.gap + _actualIdx * (item_w + this.interval);
            let front = actualX;
            let bottom = actualX + item_w;
            return !(bottom < -offsetX || front > view_w - offsetX);
        } else {
            let actualY = this.gap + _actualIdx * (item_h + this.interval);
            let front = actualY;
            let bottom = actualY + item_h;
            return !(bottom < offsetY || front > offsetY + view_h);
        }
    }

    private _calInitCapacity() {
        let { width: item_w, height: item_h } = this.tmpl_item.node.getContentSize();
        let dir = this.scrollView.horizontal;
        let poolCapacity = 0;
        if (dir) {
            let w = this.scrollView.content.parent.getContentSize().width;
            poolCapacity = Math.ceil((w - this.gap) / (item_w + this.interval)) + 1;
        } else {
            let h = this.scrollView.content.parent.getContentSize().height;
            poolCapacity = Math.ceil((h - this.gap) / (item_h + this.interval)) + 1;
        }
        return poolCapacity;
    }
}
