import {Material, Object3D, Texture, Vector2, Vector3} from 'three';
import {getClothControllerNodeFromWorldObject} from '../nodes/sop/ClothSolver';
import {
	NamedFunction9,
	ObjectNamedFunction0,
	ObjectNamedFunction1,
	ObjectNamedFunction2,
	ObjectNamedFunction5,
} from './_Base';
import {
	clothSolverStepSimulation as _clothSolverStepSimulation,
	clothSolverUpdateMaterial as _clothSolverUpdateMaterial,
} from '../../core/cloth/ClothSolver';
import {_getPhysicsRBDSphereRadius, _setPhysicsRBDSphereProperty} from '../../core/physics/shapes/RBDSphere';
import {_matchArrayLength} from './_ArrayUtils';
import {clothControllerFromObject} from '../../core/cloth/ClothControllerRegister';
// import {Ref} from '@vue/reactivity';
import {
	ClothMaterialUniformConfig,
	ClothMaterialUniformConfigRef,
	ClothMaterialUniformNameConfig,
} from '../../core/cloth/modules/ClothFBOController';

const _v3 = new Vector3();

//
//
// WORLD
//
//
export class clothSolverReset extends ObjectNamedFunction0 {
	static override type() {
		return 'clothSolverReset';
	}
	func(object3D: Object3D): void {
		const clothSolverNode = getClothControllerNodeFromWorldObject(object3D, this.scene);
		if (!clothSolverNode) {
			// console.warn(`no ${SopType.PHYSICS_WORLD} node found`);
			return;
		}
		clothSolverNode.setDirty();
	}
}

let uniformConfig: ClothMaterialUniformConfig | undefined;
let uniformNameConfig: ClothMaterialUniformNameConfig | undefined;
export class clothSolverStepSimulation extends ObjectNamedFunction5<
	[number, number, number, number, ClothMaterialUniformConfigRef]
> {
	static override type() {
		return 'clothSolverStepSimulation';
	}
	func(
		object3D: Object3D,
		stepsCount: number,
		selectedVertexInfluence: number,
		viscosity: number,
		spring: number,
		uniformConfigRef: ClothMaterialUniformConfigRef
	): void {
		_clothSolverStepSimulation(object3D, stepsCount, selectedVertexInfluence, viscosity, spring, uniformConfigRef);
	}
}
export class clothSolverUpdateMaterial extends NamedFunction9<
	[Material, string, string, string, string, Vector2, Texture, Texture, Texture]
> {
	static override type() {
		return 'clothSolverUpdateMaterial';
	}
	func(
		material: Material,
		tSizeName: string,
		tPosition0Name: string,
		tPosition1Name: string,
		tNormalName: string,
		tSize: Vector2,
		tPosition0: Texture,
		tPosition1: Texture,
		tNormal: Texture
	): void {
		uniformConfig = uniformConfig || {tSize, tPosition0, tPosition1, tNormal};
		uniformConfig.tSize = tSize;
		uniformConfig.tPosition0 = tPosition0;
		uniformConfig.tPosition1 = tPosition1;
		uniformConfig.tNormal = tNormal;

		uniformNameConfig = uniformNameConfig || {
			tSize: tSizeName,
			tPosition0: tPosition0Name,
			tPosition1: tPosition1Name,
			tNormal: tNormalName,
		};
		uniformNameConfig.tSize = tSizeName;
		uniformNameConfig.tPosition0 = tPosition0Name;
		uniformNameConfig.tPosition1 = tPosition1Name;
		uniformNameConfig.tNormal = tNormalName;

		_clothSolverUpdateMaterial(material, uniformConfig, uniformNameConfig);
	}
}

export class clothCreateConstraint extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'clothCreateConstraint';
	}
	func(object3D: Object3D, index: number): void {
		const controller = clothControllerFromObject(object3D);
		if (controller) {
			controller.createConstraint(index);
		}
	}
}
export class clothDeleteConstraint extends ObjectNamedFunction0 {
	static override type() {
		return 'clothDeleteConstraint';
	}
	func(object3D: Object3D): void {
		const controller = clothControllerFromObject(object3D);
		if (controller) {
			controller.deleteConstraint();
		}
	}
}
export class clothConstraintSetPosition extends ObjectNamedFunction2<[Vector3, number]> {
	static override type() {
		return 'clothConstraintSetPosition';
	}
	func(object3D: Object3D, position: Vector3, lerp: number): void {
		const controller = clothControllerFromObject(object3D);
		if (controller) {
			if (lerp >= 1) {
				controller.setConstraintPosition(position);
			} else {
				controller.constraintPosition(_v3);
				_v3.lerp(position, lerp);
				controller.setConstraintPosition(position);
			}
		}
	}
}
