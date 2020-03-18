
const {ccclass, property} = cc._decorator;

export enum TableViewDirection {
    HORIZONTAL = 0,
    VERTICAL = 1,
}

export interface TableViewDataSource {
    updateCell: Function,
    tableCellSizeForIndex: Function,
    numberOfCellsInTableView: Function,
    // cellSizeForTable: Function,
    // tableCellAtIndex: Function,
}

export class TableViewCell extends cc.Node {
    private _idx: number = -1;

    public setIdx(index: number) {
        this._idx = index;
    }

    public getIdx() {
        return this._idx;
    }

    public reset() {
        this._idx = -1;
    }
}

@ccclass
export class TableView extends cc.Component {
    @property({"type":cc.Enum(TableViewDirection)})
    direction: TableViewDirection = TableViewDirection.VERTICAL;

    private _scrollView: cc.ScrollView;
    private _cellsUsed: TableViewCell[] = [];
    private _cellsFreed: TableViewCell[] = [];
    private _dataSource: TableViewDataSource;
    private _vCellsPositions: number[] = [];
    onLoad () {
        this._scrollView = this.node.getComponent(cc.ScrollView);

        let scrollViewEventHandler = new cc.Component.EventHandler();
        scrollViewEventHandler.target = this.node;
        scrollViewEventHandler.component = "TableView";// 这个是代码文件名
        scrollViewEventHandler.handler = "scrollEvent";
        this._scrollView.scrollEvents.push(scrollViewEventHandler);

        if (this._dataSource) {
            this.init(this._dataSource);
        }
        // this.scrollToTop();
        // this._didScroll();
    }

    public init(source: TableViewDataSource) {
        this._dataSource = source;
        if (!this._scrollView) {
            return;
        }

        for (let i = this._cellsUsed.length - 1; i >= 0; --i) {
            let cell = this._cellsUsed[0];
            this._moveCellOutOfSight(cell);
        }

        this._updateCellPositions();
        this._updateContentSize();
        this._didScroll(true);
        
        // if (this._scrollView) {
        //     this.scrollToTop();
        //     this._didScroll(true);
        // }
    }

    public scrollToOffset(offset: cc.Vec2) {
        this._scrollView.stopAutoScroll();
        this._scrollView.scrollToOffset(offset);
        this._didScroll();
    }

    public scrollToTop() {
        if (!this._scrollView) {
            return;
        }
        this._scrollView.scrollToTop();
        this._didScroll();
    }

    public scrollToBottom() {
        this._scrollView.scrollToBottom();
        this._didScroll();
    }

    public scrollToBottomIfNecessary() {
        let height = this._scrollView.content.height;
        if (height < this._scrollView.node.height) {
            this.scrollToTop();
        } else {
            this.scrollToBottom();
        }
    }

    public cellAtIndex(index: number) {
        for (let i = 0; i < this._cellsUsed.length; ++i) {
            let cell = this._cellsUsed[i];
            if (cell.getIdx() == index) {
                return cell;
            }
        }
    }

    public dequeueCell() {
        let cell: TableViewCell;
        if (this._cellsFreed.length > 0) {
            cell = this._cellsFreed.pop();
        }
        return cell;
    }

    private _addCell(index: number) {
        let cellSize = this._dataSource.tableCellSizeForIndex(index);
        let cell = new TableViewCell();
        if (this.direction == TableViewDirection.HORIZONTAL) {
            cell.anchorX = 0;
            cell.anchorY = 0.5;
        } else {
            cell.anchorX = 0;
            cell.anchorY = 0;
        } 
        cell.setContentSize(cellSize);
        return cell;
    }

    private _updateContentSize() {
        let size = cc.size(0, 0);
        let cellsCount = this._dataSource.numberOfCellsInTableView();

        if (cellsCount > 0) {
            let maxPosition = this._vCellsPositions[cellsCount];

            if (this.direction == TableViewDirection.HORIZONTAL) {
                size = cc.size(maxPosition, this.node.height);
            } else {
                size = cc.size(this.node.width, maxPosition);
            }
        }

        this.node.getComponent(cc.ScrollView).content.setContentSize(size);
        //this.node.setContentSize(size);
    }

    private _offsetFromIndex(index: number) {
        let offset = this.__offsetFromIndex(index);
        // todo 反向
        return offset;
    }

    private __offsetFromIndex(index: number) {
        let offset: cc.Vec2;
        if (this.direction == TableViewDirection.HORIZONTAL) {
            offset = cc.v2(0-this._vCellsPositions[index], 0);
        } else {
            offset = cc.v2(0, 0-this._vCellsPositions[index]);
        }
        return offset;
    }

    private _indexFromOffset(offset: cc.Vec2) {
        let index = 0;
        let maxIdx = this._dataSource.numberOfCellsInTableView();

        // todo 反向

        index = this.__indexFromOffset(offset);
        if (index != -1) {
            index = Math.max(0, index);
            if (index > maxIdx) {
                index = -1;
            }
        }
        return index;
    }

    private __indexFromOffset(offset: cc.Vec2) {
        let low = 0;
        let high = this._dataSource.numberOfCellsInTableView() - 1;
        let search;
        if (this.direction == TableViewDirection.HORIZONTAL) {
            search = offset.x;
        } else {
            search = offset.y;
        }
        while (high >= low) {
            let index = low + Math.floor((high - low) / 2);
            let cellStart = this._vCellsPositions[index];
            let cellEnd = this._vCellsPositions[index+1];

            if (search >= cellStart && search <= cellEnd) {
                return index;
            } else if (search < cellStart) {
                high = index - 1;
            } else {
                low = index + 1;
            }
        }
        if (low <= 0) {
            return 0;
        }
        return -1;
    }

    private _moveCellOutOfSight(cell: TableViewCell) {
        this._cellsFreed.push(cell);
        let pos = this._cellsUsed.indexOf(cell);
        this._cellsUsed.splice(pos, 1);
        cell.reset();
        cell.removeFromParent(false);
    }

    private _setIndexForCell(index: number, cell: TableViewCell) {
        cell.active = true;
        cell.setIdx(index);
        cell.setPosition(this._offsetFromIndex(index));
        this._scrollView.content.addChild(cell);
    }

    private _updateCellPositions() {
        let cellsCount = this._dataSource.numberOfCellsInTableView();
        this._vCellsPositions = [];

        if (cellsCount > 0) {
            let currentPos = 0;
            for (let i = 0; i < cellsCount; ++i) {
                this._vCellsPositions[i] = currentPos;
                let cellSize = this._dataSource.tableCellSizeForIndex(i);
                if (this.direction == TableViewDirection.HORIZONTAL) {
                    currentPos += cellSize.width;
                } else {
                    currentPos += cellSize.height;
                }
            }
            this._vCellsPositions[cellsCount] = currentPos;
        }
    }

    private scrollEvent(sender, event) {
        if (event == 4) {
            this._didScroll();
        }
    }

    private _didScroll(forceUpdate: boolean = false) {
        let countOfItems = this._dataSource.numberOfCellsInTableView();
        if (0 == countOfItems) {
            return;
        }

        let startIdx = 0, endIdx = 0, idx = 0, maxIdx = 0;
        maxIdx = Math.max(countOfItems-1, 0);

        let offset = this._scrollView.getScrollOffset();

        // todo 反向

        startIdx = this._indexFromOffset(offset);
        if (startIdx == -1) {
            startIdx = countOfItems - 1;
        }

        offset.y += this._scrollView.node.height;
        offset.x += this._scrollView.node.width;

        endIdx = this._indexFromOffset(offset);
        if (endIdx == -1) {
            endIdx = countOfItems - 1;
        }

        if (this._cellsUsed.length > 0) {
            let cell = this._cellsUsed[0];
            idx = cell.getIdx();

            while (idx < startIdx) {
                this._moveCellOutOfSight(cell);
                if (this._cellsUsed.length > 0) {
                    cell = this._cellsUsed[0];
                    idx = cell.getIdx();
                } else {
                    break;
                }
            }
        }

        if (this._cellsUsed.length > 0) {
            let cell = this._cellsUsed[this._cellsUsed.length-1];
            idx = cell.getIdx();

            while(idx <= maxIdx && idx > endIdx) {
                this._moveCellOutOfSight(cell);
                if (this._cellsUsed.length > 0) {
                    cell = this._cellsUsed[this._cellsUsed.length-1];
                    idx = cell.getIdx();
                } else {
                    break;
                }
            }
        }

        for (let i = startIdx; i <= endIdx; ++i) {
            let cell = this.cellAtIndex(i);
            if (!cell) {
                cell = this.dequeueCell();
                if (!cell) {
                    cell = this._addCell(i);
                }
                this._setIndexForCell(i, cell);
                if (this._cellsUsed.length > 0 && i > this._cellsUsed[this._cellsUsed.length-1].getIdx()) {
                    this._cellsUsed.push(cell);
                } else {
                    this._cellsUsed.splice(0, 0, cell);
                }
                this._dataSource.updateCell(cell);
            } else if (forceUpdate) {
                this._dataSource.updateCell(cell);
            }
        }
    }    
}
