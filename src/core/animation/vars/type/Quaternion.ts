import {Quaternion} from 'three';

interface PopulateVarsForVector {
	vars: gsap.TweenVars;
	targetValue: Quaternion;
	targetProperty: Quaternion;
}
export function populateVarsAndCreateProxyForQuaternion(options: PopulateVarsForVector) {
	const {vars, targetValue, targetProperty} = options;
	const proxy = {value: 0};
	const qTarget = targetProperty;
	const qStart = new Quaternion().copy(targetProperty);
	const qEnd = targetValue;
	vars.onUpdate = () => {
		qTarget.slerpQuaternions(qStart, qEnd, proxy.value);
	};
	vars.value = 1;
	return proxy;
}
