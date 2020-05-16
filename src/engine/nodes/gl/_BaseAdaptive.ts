import {TypedGlNode} from './_Base';
// import {ParamType} from '../../../Engine/Param/_Module';
// import {ThreeToGl} from '../../../Core/ThreeToGl'

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
// import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
// import {GlConnectionsController} from './utils/GLConnectionsController';
// import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';

class BaseAdaptiveParamsConfig extends NodeParamsConfig {}

export abstract class BaseAdaptiveGlNode<T extends BaseAdaptiveParamsConfig> extends TypedGlNode<T> {
	// protected abstract gl_output_name(): string;
	// protected abstract gl_input_name(index: number): string;
	// protected abstract expected_input_types(): ConnectionPointType[];
	// protected abstract expected_output_types(): ConnectionPointType[];

	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);

	initialize_node() {
		super.initialize_node();
		// this.gl_connections_controller.initialize_node();
	}
}
