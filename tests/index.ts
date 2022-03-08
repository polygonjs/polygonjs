import {AllRegister} from '../src/engine/poly/registers/All';
AllRegister.run();

import {setupQUnit} from './helpers/setup';
import './tests';

import QUnit from 'qunit';
setupQUnit(QUnit);
QUnit.start();
