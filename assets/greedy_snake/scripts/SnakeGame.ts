import Spawner from "./Spawner";
import Snake from "./Snake";
import FocusCamera from "./FocusCamera";
import FoodSpawner from "./FoodSpawner";
import Food from "./Food";
import Utils from "../../common/scripts/Utils";

/*
 * @Author: Kinnon.Z
 * @Date: 2020-04-02 20:33:33
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2020-04-07 17:55:23
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class SnakeGame extends cc.Component {
    @property(Spawner)
    comp_spawner: Spawner = null;

    @property
    startPos: cc.Vec2 = cc.v2(100, 200);

    @property
    startVelocity: cc.Vec2 = cc.v2(100, 0);

    @property(cc.Node)
    nd_snakeContainer: cc.Node = null;

    @property(FocusCamera)
    camera_focus: FocusCamera = null;

    @property(cc.Camera)
    camera_main: cc.Camera = null;

    @property(FoodSpawner)
    comp_foodSpawner: FoodSpawner = null;

    @property(cc.Node)
    nd_gameOver: cc.Node = null;

    private _currVelocity: cc.Vec2 = this.startVelocity;
    private _gameSnake: Snake;
    private _dirChanaged: boolean = false;
    private _speed: number;

    private _food: Food = null;
    private _gameEnd: boolean = false;
    // ? ===================================================================================
    // ? life cycle
    // ? ===================================================================================
    onLoad() {
        cc.dynamicAtlasManager.enabled = false;
        // cc.macro.CLEANUP_IMAGE_CACHE = false;
        // cc.dynamicAtlasManager.enabled = true;
        // cc.dynamicAtlasManager.showDebug(true);
        this._speed = this.startVelocity.mag();
    }
    start() {
        this.nd_gameOver.active = false;

        this._gameSnake = this.comp_spawner.assembHead();
        const startPosToWorld = this.nd_snakeContainer.convertToNodeSpaceAR(this.startPos);
        this._gameSnake.place(this.nd_snakeContainer, startPosToWorld, this.startVelocity);

        this._createFood();

        this.camera_focus.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
            let touchPos = e.getLocation();
            touchPos = this.camera_focus.node.convertToWorldSpaceAR(
                touchPos.sub(
                    cc.v2(
                        this.camera_focus.node.width * this.camera_focus.node.anchorX,
                        this.camera_focus.node.height * this.camera_focus.node.anchorY
                    )
                )
            );

            let snakePos = this._gameSnake.getHeadWorldPos();
            let newVelocity = touchPos
                .sub(snakePos)
                .normalize()
                .mul(this._speed);

            this._dirChanaged = true;
            this._currVelocity = newVelocity;
        });

        this._gameEnd = false;
    }

    update(dt: number) {
        if (this._gameEnd) {
            return;
        }

        if (this._dirChanaged) {
            this._dirChanaged = false;
            this._gameSnake.step(dt, this._currVelocity);
        } else {
            this._gameSnake.step(dt);
        }

        //* camera follow
        let snakePosWorld = this._gameSnake.getHeadWorldPos();
        this.camera_focus.follow(snakePosWorld, this._gameSnake.getHeadDir());

        //* check if snake hit a food
        if (Utils.ifIntersect(this._gameSnake.head.node, this._food.node)) {
            cc.log("Oh ye! Here you got a food and you've get grown up");
            //* replace food
            this._placeFood();

            //* append new tail
            const tail = this.comp_spawner.assembBody();
            tail.appendTo(this._gameSnake.tail);
        }

        //* check if snake hit his tail

        //* show food vice-window
        let foodPosInViewport = this._food.node.convertToWorldSpaceAR(cc.v2());
        let viewBox = this.camera_focus.node.getBoundingBoxToWorld();
        let inView = viewBox.contains(foodPosInViewport);
        this._food.showViceView(!inView);
        if (!inView) {
            this._food.placeArrow(cc.v3(snakePosWorld));
        }
    }

    // ? ===================================================================================
    // ? private interfaces
    // ? ===================================================================================
    private _createFood() {
        let food = this.comp_foodSpawner.assembFood();
        this._food = food.getComponent(Food);
        food.parent = this.nd_snakeContainer;
        this._placeFood();
        this._food.showViceView(false);
    }

    private _placeFood() {
        let genPos = cc.v3(this.comp_foodSpawner.genPositionWorld());
        genPos = this.nd_snakeContainer.convertToNodeSpaceAR(genPos);

        this._food!.node.position = genPos;
        if (this._gameSnake!.hitTest(this._food.node)) {
            this._placeFood();
        }
    }

    // ? ===================================================================================
    // ? on ui events
    // ? ===================================================================================
    public onBtnRetry() {
        this.nd_gameOver.active = false;

        //* replace snake
        const startPosToWorld = this.nd_snakeContainer.convertToNodeSpaceAR(this.startPos);
        this._gameSnake.place(this.nd_snakeContainer, startPosToWorld, this.startVelocity);

        //* replace food
        this._placeFood();

        this._gameEnd = false;
    }

    public onBtnExit() {
        cc.director.end();
    }
}
