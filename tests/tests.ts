import 'qunit';

QUnit.module('core');
import './core/Object';
import './core/String';
import './core/Walker';
QUnit.module('core/geometry');
import './core/geometry/Attribute';

QUnit.module('params');
import './engine/params/_Base';
import './engine/params/Boolean';
import './engine/params/Color';
import './engine/params/Float';
import './engine/params/Integer';
import './engine/params/String';
import './engine/params/Vector';
import './engine/params/utils/DefaultValues';
import './engine/params/utils/Dirty';
import './engine/params/utils/Expression';
import './engine/params/utils/ReferencedAssets';
import './engine/params/utils/TimeDependent';

QUnit.module('sop');
import './engine/nodes/sop/Box';
import './engine/nodes/sop/Text';
import './engine/nodes/sop/Transform';
