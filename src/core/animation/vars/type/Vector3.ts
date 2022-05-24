import {Vector3} from 'three';
import {Vector3Param} from '../../../../engine/params/Vector3';
import {Poly} from '../../../../engine/Poly';
import {NodeParamProxiesRegister} from '../../NodeParamProxiesRegister';
import {Vector3ParamProxy} from '../../ParamProxy';
import {AnimPropertyTargetValue} from '../../TimelineBuilderProperty';
import {AddToTimelineOptions} from '../AnimBuilderTypes';
import {animBuilderCommonVars} from '../Common';
import {animBuilderStartTimeline} from '../StartTimeline';
import {AnimBuilderWithOp} from '../WithOp';

export function populateVarsForParamVector3(
	param: Vector3Param,
	targetValue: AnimPropertyTargetValue,
	options: AddToTimelineOptions
) {
	if (!(targetValue instanceof Vector3)) {
		Poly.warn(
			`TimelineBuilderProperty error: cannot animate vector3 param '${param.path()}' with targetValue`,
			targetValue
		);
		return;
	}
	const proxy = NodeParamProxiesRegister.paramProxy(param) as Vector3ParamProxy;
	if (!proxy) {
		return;
	}
	const vars = animBuilderCommonVars(options.timelineBuilder);
	vars.onUpdate = () => {
		proxy.update();
	};
	const operation = options.timelineBuilder.operation();
	vars.x = AnimBuilderWithOp(param.value.x, targetValue.x, operation);
	vars.y = AnimBuilderWithOp(param.value.y, targetValue.y, operation);
	vars.z = AnimBuilderWithOp(param.value.z, targetValue.z, operation);
	animBuilderStartTimeline({...options, vars, target: proxy.proxyValue, registerableProp: param});
}
