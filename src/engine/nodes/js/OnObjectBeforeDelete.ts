/**
 * sends a trigger when the listened object is about to be deleted
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {InitFunctionJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OnObjectBeforeDeleteJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnObjectBeforeDeleteJsParamsConfig();

export class OnObjectBeforeDeleteJsNode extends TypedJsNode<OnObjectBeforeDeleteJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): JsType.ON_OBJECT_BEFORE_DELETE {
		return JsType.ON_OBJECT_BEFORE_DELETE;
	}
	override isTriggering() {
		return true;
	}
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}

	override setTriggeringLines(shadersCollectionController: JsLinesCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const func = Poly.namedFunctionsRegister.getFunction(
			'objectAddOnBeforeDeleteEventListener',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, `this`, `this.${nodeMethodName(this)}.bind(this)`);
		shadersCollectionController.addDefinitions(this, [
			new InitFunctionJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.OBJECT_3D,
				this.path(),
				bodyLine
			),
		]);

		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {gatherable: false});
	}
}
