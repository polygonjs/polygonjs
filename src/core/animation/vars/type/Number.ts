import {FloatParam} from '../../../../engine/params/Float';
import {IntegerParam} from '../../../../engine/params/Integer';
import {Poly} from '../../../../engine/Poly';
import {GsapTweenVars} from '../../../thirdParty/gsap';
import {CoreType} from '../../../Type';
import {NodeParamProxiesRegister} from '../../NodeParamProxiesRegister';
import {FloatParamProxy, IntegerParamProxy} from '../../ParamProxy';
import {AnimPropertyTargetValue} from '../../TimelineBuilderProperty';
import {AddToTimelineOptions, Operation} from '../AnimBuilderTypes';
import {animBuilderCommonVars} from '../Common';
import {animBuilderStartTimeline} from '../StartTimeline';
import {AnimBuilderWithOp} from '../WithOp';

export function populateVarsForSingleNumber(
	param: IntegerParam | FloatParam,
	targetValue: AnimPropertyTargetValue,
	options: AddToTimelineOptions
) {
	if (!CoreType.isNumber(targetValue)) {
		Poly.warn(
			`TimelineBuilderProperty error: cannot animate float/integer param '${param.path()}' with targetValue`,
			targetValue
		);
		return;
	}
	const proxy = NodeParamProxiesRegister.paramProxy(param) as FloatParamProxy | IntegerParamProxy;
	if (!proxy) {
		return;
	}
	const keyframes = options.timelineBuilder.keyframes();
	const interpolant = keyframes ? keyframes.createInterpolant() : undefined;
	const vars = animBuilderCommonVars(options.timelineBuilder);
	vars.onUpdate = () => {
		proxy.update(interpolant);
	};
	if (keyframes) {
		// TODO: keyframes should change duration
		// vars.duration = 1
		targetValue = 1;
	}

	const operation = options.timelineBuilder.operation();
	vars.proxyValue = AnimBuilderWithOp(param.value, targetValue, operation);
	animBuilderStartTimeline({...options, vars, target: proxy, registerableProp: param});
}

interface PopulateVarsForNumber {
	vars: GsapTweenVars;
	targetValue: number;
	targetProperty: number;
	propertyNames: string[];
	operation: Operation;
}
export function populateVarsForNumber(options: PopulateVarsForNumber) {
	const {vars, targetValue, targetProperty, propertyNames, operation} = options;
	for (let property_name of propertyNames) {
		vars[property_name] = AnimBuilderWithOp(targetProperty, targetValue, operation);
	}
}
