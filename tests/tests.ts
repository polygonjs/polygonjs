import 'qunit';

QUnit.module('core');
import './core/Object';
import './core/String';
import './core/Walker';
QUnit.module('core/geometry');
import './core/geometry/Attribute';
import './core/geometry/Group';

QUnit.module('params');
import './engine/params/_Base';
import './engine/params/Boolean';
import './engine/params/Color';
import './engine/params/Float';
import './engine/params/Integer';
import './engine/params/String';
import './engine/params/Vector3';
import './engine/params/utils/DefaultValues';
import './engine/params/utils/Dirty';
import './engine/params/utils/Expression';
import './engine/params/utils/ReferencedAssets';
import './engine/params/utils/TimeDependent';

QUnit.module('obj');
import './engine/nodes/obj/AmbientLight';
import './engine/nodes/obj/Geo';

QUnit.module('sop');
import './engine/nodes/sop/Add';
import './engine/nodes/sop/AnimationCopy';
import './engine/nodes/sop/AnimationMixer';
import './engine/nodes/sop/AttribAddMult';
import './engine/nodes/sop/AttribCreate';
import './engine/nodes/sop/BboxScatter';
import './engine/nodes/sop/Box';
import './engine/nodes/sop/Color';
import './engine/nodes/sop/Data';
import './engine/nodes/sop/DataUrl';
import './engine/nodes/sop/File';
import './engine/nodes/sop/Hierarchy';
import './engine/nodes/sop/Plane';
import './engine/nodes/sop/Text';
import './engine/nodes/sop/Transform';
