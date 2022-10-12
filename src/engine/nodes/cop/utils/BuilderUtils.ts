import {Builder2DArrayCopNode} from '../Builder2DArray';
import {BuilderCopNode} from './../Builder';
import {IUniformsWithTime} from '../../../scene/utils/UniformsController';

interface HandleDependenciesOptions {
	node: BuilderCopNode | Builder2DArrayCopNode;
	timeDependent: boolean;
	uniforms?: IUniformsWithTime;
}

export function handleCopBuilderDependencies(options: HandleDependenciesOptions) {
	const {node, timeDependent, uniforms} = options;
	const scene = node.scene();
	if (timeDependent) {
		if (uniforms) {
			scene.uniformsController.addTimeUniform(uniforms);
		}
		const callbackName = node.callbackName();
		if (!scene.registeredBeforeTickCallbacks().has(callbackName)) {
			scene.registerOnBeforeTick(callbackName, node.boundRenderOnTarget);
		}
	} else {
		node.removeCallbacks();
	}
}
