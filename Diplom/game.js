'use strict';
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    plus (vector) {
        if (!(vector instanceof Vector)) {
            throw Error('Можно прибавлять к вектору только вектор типа Vector.');
        } else {
            const x = this.x + vector.x, y = this.y + vector.y;
            return new Vector(x,y);
        }
    }
    //Пока работаем на целых числах
    times (mult) {
        if (typeof mult !== 'number') {
            mult = parseInt(mult, 10);
            if (isNaN(mult)) {
                throw Error('Здесь должно быть число');
            }
        }
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
        this.pos = pos;
        this.size = size;
        this.speed = speed;
    }

    act() {};

    get left() {

    }

}




const z = new Vector(10, 10);
const moveTo = new Vector(10,10);
// const result = z.plus(test);
const result = z.plus(moveTo.times(2));

// console.log(z instanceof Vector);
// console.log(moveTo instanceof Vector);
console.log(result);
