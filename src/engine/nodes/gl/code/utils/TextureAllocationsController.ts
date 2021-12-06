import {TextureAllocation, TextureAllocationData} from './TextureAllocation';
import {BaseGlNodeType} from '../../_Base';

// import {TypedConnection, COMPONENTS_COUNT_BY_TYPE} from '../../../../../Engine/Node/Gl/GlData';
import {TextureVariable} from './TextureVariable';
import {ShaderConfig} from '../configs/ShaderConfig';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {PolyScene} from '../../../../scene/PolyScene';
import {GlConnectionPointComponentsCountMap, BaseGlConnectionPoint} from '../../../utils/io/connections/Gl';
import {AttributeGlNode} from '../../Attribute';
import {GlobalsGlNode} from '../../Globals';
import {OutputGlNode} from '../../Output';
import {ArrayUtils} from '../../../../../core/ArrayUtils';
import {PolyDictionary} from '../../../../../types/GlobalTypes';
import {MapUtils} from '../../../../../core/MapUtils';

export type TextureAllocationsControllerData = {
	writable: PolyDictionary<TextureAllocationData>[];
	readonly: PolyDictionary<TextureAllocationData>[];
};
const OUTPUT_NAME_ATTRIBUTES = ['position', 'normal', 'color', 'uv'];

export class TextureAllocationsController {
	private _writableAllocations: TextureAllocation[] = [];
	private _readonlyAllocations: TextureAllocation[] = [];
	// private _next_allocation_index: number = 0;

	constructor() {}

	dispose() {
		this._writableAllocations.splice(0, this._writableAllocations.length);
		this._readonlyAllocations.splice(0, this._readonlyAllocations.length);
	}

	private static _sortNodes(root_nodes: BaseGlNodeType[]): BaseGlNodeType[] {
		//let's go through the output node first, in case there is a name conflict, it will have priority
		const outputNodes = root_nodes.filter((node) => node.type() == OutputGlNode.type());
		const sortedRootNodes: BaseGlNodeType[] = outputNodes;
		// we also sort them by name, to add some predictability to the generated shaders
		const nonOutputNodes = root_nodes.filter((node) => node.type() != OutputGlNode.type());
		const nonOutputNodeNames = nonOutputNodes.map((n) => n.name()).sort();
		const nonOutputNodesByName: Map<string, BaseGlNodeType> = new Map();
		for (let node of nonOutputNodes) {
			nonOutputNodesByName.set(node.name(), node);
		}
		for (let nodeName of nonOutputNodeNames) {
			const node = nonOutputNodesByName.get(nodeName);
			if (node) {
				sortedRootNodes.push(node);
			}
		}
		return sortedRootNodes;
	}

	allocateConnectionsFromRootNodes(root_nodes: BaseGlNodeType[], leaf_nodes: BaseGlNodeType[]) {
		const variables = [];

		root_nodes = TextureAllocationsController._sortNodes(root_nodes);
		leaf_nodes = TextureAllocationsController._sortNodes(leaf_nodes);

		for (let node of root_nodes) {
			const node_id = node.graphNodeId();
			switch (node.type()) {
				case OutputGlNode.type(): {
					for (let connection_point of node.io.inputs.namedInputConnectionPoints()) {
						const input = node.io.inputs.named_input(connection_point.name());
						if (input) {
							// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
							// connections_by_node_id[node_id].push(named_input)
							const variable = new TextureVariable(
								connection_point.name(),
								GlConnectionPointComponentsCountMap[connection_point.type()]
							);
							variable.addGraphNodeId(node_id);
							variables.push(variable);
						}
					}
					break;
				}
				case AttributeGlNode.type(): {
					const attrib_node = node as AttributeGlNode;
					const named_input: BaseGlNodeType | null = attrib_node.connected_input_node();
					const connection_point: BaseGlConnectionPoint | undefined =
						attrib_node.connected_input_connection_point();
					if (named_input && connection_point) {
						// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
						// connections_by_node_id[node_id].push(named_input)
						const variable = new TextureVariable(
							attrib_node.attribute_name,
							GlConnectionPointComponentsCountMap[connection_point.type()]
						);
						variable.addGraphNodeId(node_id);
						variables.push(variable);
					}
					break;
				}
			}
		}
		for (let node of leaf_nodes) {
			const node_id = node.graphNodeId();
			switch (node.type()) {
				case GlobalsGlNode.type(): {
					const globals_node = node as GlobalsGlNode;
					// const output_names_not_attributes = ['frame', 'gl_FragCoord', 'gl_PointCoord'];
					for (let output_name of globals_node.io.outputs.used_output_names()) {
						// is_attribute, as opposed to frame, gl_FragCoord and gl_PointCoord which are either uniforms or provided by the renderer
						const is_attribute = OUTPUT_NAME_ATTRIBUTES.includes(output_name);

						if (is_attribute) {
							const connection_point =
								globals_node.io.outputs.namedOutputConnectionPointsByName(output_name);
							if (connection_point) {
								const gl_type = connection_point.type();
								const variable = new TextureVariable(
									output_name,
									GlConnectionPointComponentsCountMap[gl_type]
								);
								variable.addGraphNodeId(node_id);
								variables.push(variable);
							}
						}
					}
					break;
				}
				case AttributeGlNode.type(): {
					const attribute_node = node as AttributeGlNode;
					const connection_point = attribute_node.output_connection_point();
					if (connection_point) {
						// connections_by_node_id[node_id] = connections_by_node_id[node_id] || []
						// connections_by_node_id[node_id].push(named_output)
						const variable = new TextureVariable(
							attribute_node.attribute_name,
							GlConnectionPointComponentsCountMap[connection_point.type()]
						);
						if (!attribute_node.isExporting()) {
							variable.setReadonly(true);
						}

						variable.addGraphNodeId(node_id);
						variables.push(variable);
					}
					break;
				}
			}
		}

		this._allocateVariables(variables);
	}
	private _allocateVariables(variables: TextureVariable[]) {
		const variables_by_size_inverse = ArrayUtils.sortBy(variables, (variable) => {
			return -variable.size();
		});
		const uniqVariables = this._ensureVariablesAreUnique(variables_by_size_inverse);
		for (let variable of uniqVariables) {
			if (variable.readonly()) {
				this._allocateVariable(variable, this._readonlyAllocations);
			} else {
				this._allocateVariable(variable, this._writableAllocations);
			}
		}
	}
	private _ensureVariablesAreUnique(variables: TextureVariable[]) {
		const variableByName: Map<string, TextureVariable[]> = new Map();
		for (let variable of variables) {
			MapUtils.pushOnArrayAtEntry(variableByName, variable.name(), variable);
		}
		const uniqVariables: TextureVariable[] = [];
		variableByName.forEach((variablesForName, variableName) => {
			const firstVariable = variablesForName[0];
			uniqVariables.push(firstVariable);
			for (let i = 1; i < variablesForName.length; i++) {
				const otherVariable = variablesForName[i];
				firstVariable.merge(otherVariable);
			}
		});
		return uniqVariables;
	}
	private _allocateVariable(new_variable: TextureVariable, allocations: TextureAllocation[]) {
		let isAllocated = this.hasVariable(new_variable.name());
		if (isAllocated) {
			throw 'no variable should be allocated since they have been made unique before';
			// const allocated_variable = this.variables().filter((v) => v.name() == new_variable.name())[0];
			// allocated_variable.merge(new_variable);
		} else {
			if (!isAllocated) {
				for (let allocation of allocations) {
					if (!isAllocated && allocation.hasSpaceForVariable(new_variable)) {
						allocation.addVariable(new_variable);
						isAllocated = true;
					}
				}
			}
			if (!isAllocated) {
				const new_allocation = new TextureAllocation(/*this.nextAllocationName()*/);
				allocations.push(new_allocation);
				new_allocation.addVariable(new_variable);
			}
		}
	}
	private _addWritableAllocation(allocation: TextureAllocation) {
		this._writableAllocations.push(allocation);
	}
	private _addReadonlyAllocation(allocation: TextureAllocation) {
		this._readonlyAllocations.push(allocation);
	}
	readonlyAllocations() {
		return this._readonlyAllocations;
	}

	// private _nextAllocationName(): ShaderName {
	// 	const name = ParticleShaderNames[this._next_allocation_index];
	// 	this._next_allocation_index += 1;
	// 	return name;
	// }

	shaderNames(): ShaderName[] {
		const explicit_shader_names = this._writableAllocations.map((a) => a.shaderName());

		// include dependencies if needed
		// TODO: typescript - do I need those?
		// if (lodash_includes(explicit_shader_names, 'acceleration')) {
		// 	explicit_shader_names.push('velocity');
		// }
		// if (lodash_includes(explicit_shader_names, 'velocity')) {
		// 	explicit_shader_names.push('position');
		// }

		return ArrayUtils.uniq(explicit_shader_names);
	}
	createShaderConfigs(): ShaderConfig[] {
		return [
			// new ShaderConfig('position', ['position'], []),
			// new ShaderConfig('fragment', ['color', 'alpha'], ['vertex']),
		];
	}
	allocationForShaderName(shader_name: ShaderName): TextureAllocation | undefined {
		const writeableAllocation = this._writableAllocations.filter((a) => a.shaderName() == shader_name)[0];
		if (writeableAllocation) {
			return writeableAllocation;
		}
		return this._readonlyAllocations.filter((a) => a.shaderName() == shader_name)[0];
	}
	inputNamesForShaderName(root_node: BaseGlNodeType, shader_name: ShaderName) {
		const allocation = this.allocationForShaderName(shader_name);
		if (allocation) {
			return allocation.inputNamesForNode(root_node);
		}
	}
	// find_variable(root_node: BaseNodeGl, shader_name: ShaderName, input_name: string): TextureVariable{
	// 	const allocation = this.allocation_for_shader_name(shader_name)
	// 	if(allocation){
	// 		return allocation.find_variable_with_node(root_node, input_name)
	// 	}
	// }
	variable(variable_name: string): TextureVariable | undefined {
		for (let allocation of this._writableAllocations) {
			const variable = allocation.variable(variable_name);
			if (variable) {
				return variable;
			}
		}
		for (let allocation of this._readonlyAllocations) {
			const variable = allocation.variable(variable_name);
			if (variable) {
				return variable;
			}
		}
	}
	variables(): TextureVariable[] {
		const writableVariables = this._writableAllocations.map((a) => a.variables() || []).flat();
		const readonlyVariables = this._writableAllocations.map((a) => a.variables() || []).flat();
		return writableVariables.concat(readonlyVariables);
	}
	hasVariable(name: string): boolean {
		const names = this.variables().map((v) => v.name());
		return names.includes(name);
	}

	static fromJSON(data: TextureAllocationsControllerData): TextureAllocationsController {
		const controller = new TextureAllocationsController();
		for (let datum of data.writable) {
			const shader_name = Object.keys(datum)[0] as ShaderName;
			const allocation_data = datum[shader_name];
			const new_allocation = TextureAllocation.fromJSON(allocation_data);
			controller._addWritableAllocation(new_allocation);
		}
		for (let datum of data.readonly) {
			const shader_name = Object.keys(datum)[0] as ShaderName;
			const allocation_data = datum[shader_name];
			const new_allocation = TextureAllocation.fromJSON(allocation_data);
			controller._addReadonlyAllocation(new_allocation);
		}
		return controller;
	}
	toJSON(scene: PolyScene): TextureAllocationsControllerData {
		const writable = this._writableAllocations.map((allocation: TextureAllocation) => {
			const data = {
				[allocation.shaderName()]: allocation.toJSON(scene),
			};
			return data;
		});
		const readonly = this._readonlyAllocations.map((allocation: TextureAllocation) => {
			const data = {
				[allocation.shaderName()]: allocation.toJSON(scene),
			};
			return data;
		});
		return {writable, readonly};
	}
	print(scene: PolyScene) {
		console.warn(JSON.stringify(this.toJSON(scene), [''], 2));
	}
}
