import {Vector2} from 'three';
import {Vector2Param} from '../../../../engine/params/Vector2';
import {Poly} from '../../../../engine/Poly';
import {NodeParamProxiesRegister} from '../../NodeParamProxiesRegister';
import {Vector2ParamProxy} from '../../ParamProxy';
import {AnimPropertyTargetValue} from '../../TimelineBuilderProperty';
import {AddToTimelineOptions} from '../AnimBuilderTypes';
import {animBuilderCommonVars} from '../Common';
import {animBuilderStartTimeline} from '../StartTimeline';
import {AnimBuilderWithOp} from '../WithOp';

export function populateVarsForParamVector2(
	param: Vector2Param,
	targetValue: AnimPropertyTargetValue,
	options: AddToTimelineOptions
) {
	if (!(targetValue instanceof Vector2)) {
		Poly.warn(
			`TimelineBuilderProperty error: cannot animate vector2 param '${param.path()}' with targetValue`,
			targetValue
		);
		return;
	}
	const proxy = NodeParamProxiesRegister.paramProxy(param) as Vector2ParamProxy;
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
	animBuilderStartTimeline({...options, vars, target: proxy.proxyValue, registerableProp: param});
}
