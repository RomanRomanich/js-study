const arr = [' ','      ',' ','                 ','       '];
// let lenght=0;
let z = arr.reduce(function (prevValue, currValue)
{if(currValue.length > prevValue){
    console.log(currValue.length);
    prevValue = currValue.length;
 }return prevValue;
},0);

console.log(z);
console.log(arr);


if (typeof this.actorFromSymbol(stringElement[x]) === "function") {
    let ClassConstructor = this.actorFromSymbol(stringElement[x]);
    //В этом блоке проверка является прототип созданного объекта
    let obj = Object(ClassConstructor);
    if (ClassConstructor === Actor /*|| Actor.prototype.isPrototypeOf(obj.prototype)*/) {
        actorList.push(new ClassConstructor(new Vector(x, y)));
    }
}