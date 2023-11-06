import {QUnit} from '../tests/helpers/QUnit';
import {AllRegister} from '../src/engine/poly/registers/All';
AllRegister.registerAll();

import {setupQUnit} from './helpers/setup';
import {testPolygonjs} from './tests';
import {CoreFeaturesController} from '../src/core/FeaturesController';

setupQUnit(QUnit);

const testBatchId = CoreFeaturesController.testBatchId();
if (testBatchId < 0) {
	for (let i = 0; i < 2; i++) {
		testPolygonjs({qUnit: QUnit, testBatchId: i});
	}
} else {
	testPolygonjs({qUnit: QUnit, testBatchId});
}

QUnit.start();
