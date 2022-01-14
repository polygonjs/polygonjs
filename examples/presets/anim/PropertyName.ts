import {PropertyNameAnimNode} from '../../../src/engine/nodes/anim/PropertyName';
import {BasePreset, NodePresetsCollection, PresetsCollectionFactory} from '../BasePreset';

const PropertyNameAnimNodePresetsCollectionFactory: PresetsCollectionFactory<PropertyNameAnimNode> = (
	node: PropertyNameAnimNode
) => {
	const collection = new NodePresetsCollection();

	const position = new BasePreset().addEntry(node.p.name, `position`);
	const positionX = new BasePreset().addEntry(node.p.name, `position.x`);
	const positionY = new BasePreset().addEntry(node.p.name, `position.y`);
	const positionZ = new BasePreset().addEntry(node.p.name, `position.z`);
	const rotation = new BasePreset().addEntry(node.p.name, `rotation`);
	const rotationX = new BasePreset().addEntry(node.p.name, `rotation.x`);
	const rotationY = new BasePreset().addEntry(node.p.name, `rotation.y`);
	const rotationZ = new BasePreset().addEntry(node.p.name, `rotation.z`);
	const scale = new BasePreset().addEntry(node.p.name, `scale`);
	const scaleX = new BasePreset().addEntry(node.p.name, `scale.x`);
	const scaleY = new BasePreset().addEntry(node.p.name, `scale.y`);
	const scaleZ = new BasePreset().addEntry(node.p.name, `scale.z`);

	collection.setPresets({
		position,
		positionX,
		positionY,
		positionZ,
		rotation,
		rotationX,
		rotationY,
		rotationZ,
		scale,
		scaleX,
		scaleY,
		scaleZ,
	});

	return collection;
};
export {PropertyNameAnimNode, PropertyNameAnimNodePresetsCollectionFactory};
