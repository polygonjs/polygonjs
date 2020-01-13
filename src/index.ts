console.log('start');
import 'src/engine/Poly';
import {PolyScene} from 'src/engine/scene/PolyScene';
import {CoreString} from './core/String';
new PolyScene();

console.log(CoreString.precision(12.7, 4), '12.7000');
console.log(CoreString.precision(12.75789465, 4), '12.7578');
console.log(CoreString.precision(12.0, 4), '12.0000');
console.log(CoreString.precision(12, 4), '12.0000');
