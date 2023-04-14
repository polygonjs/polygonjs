import {Color, Vector3} from 'three';
import {ColorParam} from '../../../../engine/params/Color';
import {Poly} from '../../../../engine/Poly';
import {NodeParamProxiesRegister} from '../../NodeParamProxiesRegister';
import {ColorParamProxy} from '../../ParamProxy';
import {AnimPropertyTargetValue} from '../../TimelineBuilderProperty';
import {AddToTimelineOptions} from '../AnimBuilderTypes';
import {animBuilderCommonVars} from '../Common';
import {animBuilderStartTimeline} from '../StartTimeline';
import {AnimBuilderWithOp} from '../WithOp';
import {Operation} from '../AnimBuilderTypes';
import {GsapTweenVars} from '../../../thirdParty/gsap';

export function populateVarsForParamColor(
	param: ColorParam,
	targetValue: AnimPropertyTargetValue,
	options: AddToTimelineOptions
) {
	if (!(targetValue instanceof Color || targetValue instanceof Vector3)) {
		Poly.warn(
			`TimelineBuilderProperty error: cannot animate color param '${param.path()}' with targetValue`,
			targetValue
		);
		return;
	}
	const proxy = NodeParamProxiesRegister.paramProxy(param) as ColorParamProxy;
	if (!proxy) {
		return;
	}
	const vars = animBuilderCommonVars(options.timelineBuilder);
	vars.onUpdate = () => {
		proxy.update();
	};
	const operation = options.timelineBuilder.operation();
	const x = targetValue instanceof Color ? targetValue.r : targetValue.x;
	const y = targetValue instanceof Color ? targetValue.g : targetValue.y;
	const z = targetValue instanceof Color ? targetValue.b : targetValue.z;
	vars.r = AnimBuilderWithOp(param.value.r, x, operation);
	vars.g = AnimBuilderWithOp(param.value.g, y, operation);
	vars.b = AnimBuilderWithOp(param.value.b, z, operation);
	animBuilderStartTimeline({...options, vars, target: proxy.proxyValue, registerableProp: param});
}

interface PopulateVarsForVector {
	vars: GsapTweenVars;
	targetValue: Color;
	targetProperty: Color;
	propertyNames: string[];
	operation: Operation;
}
export function populateVarsForColor(options: PopulateVarsForVector) {
	const {vars, targetValue, targetProperty, propertyNames, operation} = options;
	for (let propertyName of propertyNames) {
		vars[propertyName] = AnimBuilderWithOp(
			targetProperty[propertyName as 'r'],
			targetValue[propertyName as 'r'],
			operation
		);
	}
}
