import {QUnit} from '../tests/helpers/QUnit';
import {AllRegister} from '../src/engine/poly/registers/All';
AllRegister.registerAll();

import {setupQUnit} from './helpers/setup';
import {testPolygonjs} from './tests';

setupQUnit(QUnit);
testPolygonjs(QUnit);
QUnit.start();
