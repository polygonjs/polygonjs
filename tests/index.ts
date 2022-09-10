import {AllRegister} from '../src/engine/poly/registers/All';
AllRegister.registerAll();

import {setupQUnit} from './helpers/setup';
import './tests';

import QUnit from 'qunit';
setupQUnit(QUnit);
QUnit.start();
