'use strict';
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x; //положение объекта в строке массива строк
        this.y = y; //положение строки с объектом в массиве строк
    }
    //Изменение положения объекта в зависимости от вектора движения
    plus (vector) {
        if (!(vector instanceof Vector)) {
            throw Error('Можно прибавлять к вектору только вектор типа Vector.');
        } else {
            const x = this.x + vector.x, y = this.y + vector.y;
            return new Vector(x,y);
        }
    }
    //Множитель вектора движения "время"
    times (mult) {
        return new Vector(this.x*mult, this.y*mult);
    }
}

class Actor {
    constructor(pos = new Vector(), size = new Vector(1,1), speed = new Vector()) {
        if (!(pos instanceof Vector)) {
            throw Error('Переменная pos должна быть класса Vector.');
        }
        if (!(size instanceof Vector)) {
            throw Error('Переменная size должна быть класса Vector.');
        }
        if (!(speed instanceof Vector)) {
            throw Error('Переменная speed должна быть класса Vector.');
        }
        this.pos = pos; // массив с координатами верхней левой точки экземпляра
        this.size = size; //массив с рамерами экемпляра
        this.speed = speed; // массив с вектором движения по x и y
    }
    act() {};
    //получение размеров объекта
    get left() {
        return this.pos.x;
    }
    get right() {
        return this.pos.x + this.size.x;
    }
    get top() {
        return this.pos.y;
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }
    //определение типа объекта
    get type() {
        return 'actor';
    }
    //проверка эклемпляра класса на пересечение с препятсвиями
    isIntersect (checkObject) {
        if (!checkObject || !(checkObject instanceof Actor) ) {
            throw Error('Необходимо передать непустую переменную класса Actor.');
        }
        if (checkObject === this) {
            return false;
        }
        //Проверка пересекаются ли объекты.( попадает один из объектов в границы другого)
        return this.left < checkObject.right && this.right > checkObject.left && this.top < checkObject.bottom && this.bottom > checkObject.top;
    }
}

class Level {
    constructor(grid = [], actor = []) {
        this.grid = grid;
        this.actors = actor;
        this.status = null;
        this.finishDelay = 1;
        if (actor instanceof Array) {
            this.player = actor.find(element => element.type === 'player');
        } else {
            this.player = undefined;
        }
        //рассчет максимальных границ карты
        if (grid instanceof Array) {
            this.height = grid.length;
            this.width = grid.reduce(
                function (prevValue, currValue) {
                    if(currValue.length > prevValue){
                        prevValue = currValue.length;}
                    return prevValue;},0);
        } else {
            this.height = undefined;
            this.width = undefined;
        }
    }
    isFinished() {
        return !!(this.status && this.finishDelay < 0);
    }
    //определяет есть ли какой-то экземпляр класса Actor в переданной позиции (движущийся объект)
    actorAt(actor) {
        if (!(actor instanceof Actor) || !(actor)) {
            throw new Error('Необходимо передать непустую переменную класса Actor.');
        }
        return this.actors.find(elem => actor.isIntersect(elem));
    }
    //определяет есть ли какое-то препятствие в переданной позиции
    obstacleAt(position, size) {
        if (!(position instanceof Vector)){
            throw new Error('Переменная speed должна быть класса Vector.');
        }
        if (!(size instanceof Vector)) {
            throw new Error('Переменная speed должна быть класса Vector.');
        }
        if (position.x < 0 || (size.x + position.x) > this.width || position.y < 0) {
            return 'wall';
        }
        if (size.y + position.y > this.height) {
            return 'lava';
        }
        for (let y = Math.ceil(position.y); y <= Math.ceil(position.y + size.y); y++) {
            for (let x = Math.ceil(position.x); x <= Math.ceil(position.x + size.x); x++) {
                if (this.grid[y][x] !== ' ') {
                    //some test
                    console.log(this.grid[y][x]);
                    return this.grid[y][x];
                }
            }
        }
        return undefined;
    }
    removeActor (actor) {
        if (this.actors.indexOf(actor) !== -1) {
            this.actors.splice(this.actors.indexOf(actor),1);
        }
    }
    noMoreActors (typeString) {
        //Проверяем существует ли указанный обхект на поле, и возвращаем результат обратный полученному
        //Т.е. если объектоы больше нет, то true иначе false
        return !this.actors.find(actor => actor.type === typeString);
    }
    //обрабатывает взаимодействие игрока с объктами расположенными на поле
    playerTouched (objectType, object = undefined) {
        if (!this.status) {
            if (objectType === 'lava' || objectType === 'fireball') {
                this.status = 'lost';
            }
            if (objectType === 'coin' && object.type === 'coin') {
                this.removeActor(object);
                if (this.noMoreActors(objectType)) {
                    this.status = 'won';
                }
            }
        }
    }
}
class LevelParser {
    constructor(objectDict = {}) {
        this.objectDict = objectDict;
    }
    //получение конструктора для экземпляра класса Actor на уровне
    actorFromSymbol(symbol){
        if (this.objectDict[symbol]) {
            return this.objectDict[symbol];
        } else {
            return undefined;
        }
    }
    //получение строки с наименованием препятствия
    obstacleFromSymbol(symbol) {
        if (symbol === 'x') {
            return 'wall';
        } else if (symbol === '!') {
            return 'lava';
        } else {
            return undefined;
        }
    }
    //создание сетки препятствий на игровом поле
    createGrid(plan = []) {
        if (plan.length <= 0) {
            return plan;
        }
        const grid = [];
        for (let i = 0; i < plan.length; i++) { //выбор строки в массиве строк
            const string = [];
            for (let j = 0; j < plan[i].length; j++) {//работа с элементами строки
                string.push(this.obstacleFromSymbol(plan[i][j]))
            }
            grid.push(string);
        }
        return grid;
    }
    //создание сетки экземпляров класса Actor на игровом поле
    createActors(plan = []) {
        let actorList = [];
        if (plan.length <= 0 || Object.keys(this.objectDict).length <= 0) {
            return actorList;
        }
        plan.forEach((stringElement, y) => {
            for (let x = 0; x < stringElement.length; x++) {
//если ттип проверяемого обекта - функция и название функции 'Actor' то выполняем дальнейшие действия
                if (typeof this.actorFromSymbol(stringElement[x]) === "function") {
                    //Возвращается конструктор класса
                    let ClassConstructor = this.actorFromSymbol(stringElement[x]);
                    //В этом блоке проверяется является возвращенный конструктор конструктором класса Actor
                    if (ClassConstructor === Actor || Actor.prototype.isPrototypeOf((Object(ClassConstructor)).prototype)) {
                        actorList.push(new ClassConstructor(new Vector(x, y)));
                    }
                }
            }
        });
        return actorList;
    }
    // формирование уровня
    parse (plan) {
        return new Level(this.createGrid(plan), this.createActors(plan))
    }
}
class Fireball extends Actor{
    constructor(pos = new Vector(), speed = new Vector()) {
        super(pos, new Vector(1,1), speed);
    }
    get type() {
        return 'fireball'
    }
    //рассчет новой позиции
    getNextPosition(time = 1) {
        return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time)
    }
    //расчет отражения от препятсвия
    handleObstacle() {
        this.speed.x *= -1;
        this.speed.y *= -1;
    }
    //проверка на налчие препятвий и изменение положения экземпляра
    act(time, level) {
        //в конструкции if - проверка на столкновние с препятвием, где this.getNextPosition(time) новая координата объекта и собственно размеры объекта. В случае наличия препятвия (true) - смена вектора скорости на противоположный, если (undefined (false)) сохранение новой позиции в для экземпляра
        if (level.obstacleAt(this.getNextPosition(time),this.size)) {
            this.handleObstacle();
        } else {
            this.pos = this.getNextPosition(time);
        }
    }
}

class HorizontalFireball extends Fireball{
    constructor(pos = new Vector()) {
        super(pos, new Vector(2,0))
    }
}
class VerticalFireball extends Fireball{
    constructor(pos = new Vector()) {
        super(pos, new Vector(0,2))
    }
}
class FireRain extends Fireball{
    constructor(pos = new Vector()) {
        super(pos, new Vector(0,3));
        this.startPos = this.pos;
    }
    handleObstacle(){
        this.pos = this.startPos;
    }
}
class Coin extends Actor{
    constructor(pos = new Vector()) {
        super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6), new Vector());
        this.startPos = this.pos;
        this.springSpeed = 8; //скорость подпрыгивания
        this.springDist = 0.07; //радиус подпрыгивания
        this.spring = Math.random() * 2*Math.PI; //фаза подпрыгивания
    }
    get type() {
        return 'coin';
    }
    updateSpring(time = 1) {
        this.spring += this.springSpeed * time;
    }
    getSpringVector() {
        return new Vector(0, Math.sin(this.spring)* this.springDist);
    }
    getNextPosition(time = 1) {
        this.updateSpring(time);
        return (new Vector(this.startPos.x, this.startPos.y)).plus(this.getSpringVector());
    }
    act(time) {
        this.pos = this.getNextPosition(time);
    }
}
class Player extends Actor {
    constructor(pos = new Vector()) {
        super(pos.plus(new Vector(0, -0.5)), new Vector(0.8,1.5))
    }
    get type() {
        return 'player';
    }
}


/////////////////////////////////////////////////////////////
const schemas = [
    [
        '       v ',
        '@        ',
        '         ',
        '       o ',
        '     !xxx',
        '    =    ',
        'xxx!  x! ',
        '         '
    ],
    [
        '      v  ',
        '    v    ',
        '  v      ',
        '        o',
        '        x',
        '    x    ',
        'x        ',
        '         '
    ]
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));
/*
const act = new Actor;
console.log(act.speed !== 0);
*/

