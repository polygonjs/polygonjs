import {Vector4} from 'three';
import {Vector4Param} from '../../../../engine/params/Vector4';
import {Poly} from '../../../../engine/Poly';
import {NodeParamProxiesRegister} from '../../NodeParamProxiesRegister';
import {Vector4ParamProxy} from '../../ParamProxy';
import {AnimPropertyTargetValue} from '../../TimelineBuilderProperty';
import {AddToTimelineOptions} from '../AnimBuilderTypes';
import {animBuilderCommonVars} from '../Common';
import {animBuilderStartTimeline} from '../StartTimeline';
import {AnimBuilderWithOp} from '../WithOp';

export function populateVarsForParamVector4(
	param: Vector4Param,
	targetValue: AnimPropertyTargetValue,
	options: AddToTimelineOptions
) {
	if (!(targetValue instanceof Vector4)) {
		Poly.warn(
			`TimelineBuilderProperty error: cannot animate vector4 param '${param.path()}' with targetValue`,
			targetValue
		);
		return;
	}
	const proxy = NodeParamProxiesRegister.paramProxy(param) as Vector4ParamProxy;
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
	vars.w = AnimBuilderWithOp(param.value.w, targetValue.w, operation);
	animBuilderStartTimeline({...options, vars, target: proxy.proxyValue, registerableProp: param});
}
