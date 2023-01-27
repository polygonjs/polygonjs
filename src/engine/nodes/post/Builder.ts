/**
 * Allows to build a post pass with [gl nodes](/docs/nodes/gl)
 *
 *
 */
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {EffectPass} from 'postprocessing';
import {BuilderEffect} from './utils/BuilderEffect';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlobalsGeometryHandler} from '../gl/code/globals/Geometry';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {BaseGlNodeType} from '../gl/_Base';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
import {IUniformsWithTime} from '../../scene/utils/UniformsController';
import {IUniforms} from '../../../core/geometry/Material';
import {valueof, Constructor} from './../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {AssemblerName} from './../../poly/registers/assemblers/_BaseRegister';
import {PostPersistedConfig} from './../gl/code/assemblers/post/PostPersistedConfig';
import {PostType} from './../../poly/registers/nodes/types/Post';

import defaultFragmentShader from './gl/builder.glsl';
import {NodeContext} from '../../poly/NodeContext';
import {GlAssemblerController} from '../gl/code/Controller';
import {ShaderAssemblerPost} from '../gl/code/assemblers/post/Post';

class BuilderPostParamsConfig extends NodeParamsConfig {
	/** @param effect amount */
	useInput1OuputBuffer = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
	});
}
const ParamsConfig = new BuilderPostParamsConfig();
export class BuilderPostNode extends TypedPostNode<EffectPass, BuilderPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return PostType.BUILDER;
	}
	override readonly persisted_config: PostPersistedConfig = new PostPersistedConfig(this);
	protected _assemblerController = this._createAssemblerController();

	public override usedAssembler(): Readonly<AssemblerName.GL_POST> {
		return AssemblerName.GL_POST;
	}
	protected _createAssemblerController(): GlAssemblerController<ShaderAssemblerPost> | undefined {
		const assemblerController: GlAssemblerController<ShaderAssemblerPost> | undefined =
			Poly.assemblersRegister.assembler(this, this.usedAssembler());
		if (assemblerController) {
			const globalsHandler = new GlobalsGeometryHandler();
			assemblerController.setAssemblerGlobalsHandler(globalsHandler);
			return assemblerController;
		}
	}

	assemblerController() {
		return this._assemblerController;
	}
	protected override _childrenControllerContext = NodeContext.GL;
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setCount(0, 2);

		// this ensures the builder recooks when its children are changed
		// and not just when a material that use it requests it
		this.addPostDirtyHook('_cook_main_without_inputs_when_dirty', () => {
			// setTimeout(this._cook_main_without_inputs_when_dirty_bound, 0);
			this.compileIfRequired();
		});
	}

	override createNode<S extends keyof GlNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GlNodeChildrenMap[S];
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseGlNodeType[];
	}
	override nodesByType<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodesByType(type) as GlNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		if (this.assemblerController()) {
			return super.childrenAllowed();
		}
		return false;
	}
	override sceneReadonly() {
		return this.assemblerController() == null;
	}

	// private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	// private async _cook_main_without_inputs_when_dirty() {
	// 	await this.cookController.cookMainWithoutInputs();
	// }
	// override cook() {
	// 	this.compileIfRequired();
	// 	this.cookController.endCook();
	// }

	/**
	 *
	 * FRAGMENT SHADER UPDATE
	 *
	 */
	private _fragmentShader: string = defaultFragmentShader;
	private _uniforms: IUniforms = {};
	fragmentShader() {
		return this._fragmentShader;
	}
	setFragmentShader(fragmentShader: string) {
		this._fragmentShader = fragmentShader;
		this._updatePasses();
	}
	uniforms() {
		return this._uniforms;
	}
	setUniforms(uniforms: IUniforms) {
		this._uniforms = uniforms;
		this._updatePasses();
	}
	shaders_by_name() {
		return {
			fragment: this._fragmentShader,
		};
	}

	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			try {
				this.compile();
			} catch (err) {
				const message = (err as any).message || 'failed to compile';
				this.states.error.set(message);
			}
		}
	}
	private compile() {
		const assemblerController = this.assemblerController();
		if (!assemblerController) {
			return;
		}
		const outputNodes: BaseGlNodeType[] = GlNodeFinder.findOutputNodes(this);
		if (outputNodes.length == 0) {
			this.states.error.set('one output node is required');
			return;
		}
		if (outputNodes.length > 1) {
			this.states.error.set('only one output node allowed');
			return;
		}
		const outputNode = outputNodes[0];
		if (outputNode) {
			//const param_nodes = GlNodeFinder.find_param_generating_nodes(this);
			const rootNodes = outputNodes; //.concat(param_nodes);
			assemblerController.assembler.set_root_nodes(rootNodes);

			// main compilation
			assemblerController.assembler.updateFragmentShader();

			// receives fragment and uniforms
			const fragmentShader = assemblerController.assembler.fragment_shader();
			const uniforms = assemblerController.assembler.uniforms();

			if (fragmentShader && uniforms) {
				this._fragmentShader = fragmentShader;
				this._uniforms = uniforms;
			}

			BuilderPostNode.handleDependencies(this, assemblerController.assembler.uniformsTimeDependent());
		}
		if (this._fragmentShader && this._uniforms) {
			this._updatePasses();
		}
		assemblerController.post_compile();
	}

	static handleDependencies(node: BuilderPostNode, timeDependent: boolean, uniforms?: IUniformsWithTime) {}

	/**
	 *
	 * PASS CREATE / UPDATE
	 *
	 */
	override createPass(context: TypedPostNodeContext) {
		this.compileIfRequired();
		const composerInput1 = this._createEffectComposer(context);
		composerInput1.autoRenderToScreen = false;

		const clonedContextInput1 = {...context};
		clonedContextInput1.composer = composerInput1;
		this._addPassFromInput(1, clonedContextInput1);

		const effect = new BuilderEffect(composerInput1, {
			fragmentShader: this._fragmentShader,
			useOutputBuffer: this.pv.useInput1OuputBuffer,
		});
		const pass = new EffectPass(context.camera, effect);
		// pass.needsSwap = false;
		// pass.renderToScreen = false;
		// console.log(pass.needsSwap, pass.renderToScreen);
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as BuilderEffect;
		effect.updateUniforms(this._uniforms);
		effect.updateFragmentShader(this._fragmentShader);
		pass.fullscreenMaterial.needsUpdate = true;
	}

	protected _createEffectComposer(context: TypedPostNodeContext) {
		const parentNode = this._postProcessNetworkNode();
		return parentNode.effectsComposerController.createEffectsComposer(context);
	}
}
