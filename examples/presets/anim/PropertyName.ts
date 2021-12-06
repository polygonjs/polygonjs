import {PropertyNameAnimNode} from '../../../src/engine/nodes/anim/PropertyName';

export function PropertyNameAnimNodePresets() {
	return {
		position: function (node: PropertyNameAnimNode) {
			node.p.name.set(`position`);
		},
		positionX: function (node: PropertyNameAnimNode) {
			node.p.name.set(`position.x`);
		},
		positionY: function (node: PropertyNameAnimNode) {
			node.p.name.set(`position.y`);
		},
		positionZ: function (node: PropertyNameAnimNode) {
			node.p.name.set(`position.z`);
		},
		rotation: function (node: PropertyNameAnimNode) {
			node.p.name.set(`rotation`);
		},
		rotationX: function (node: PropertyNameAnimNode) {
			node.p.name.set(`rotation.x`);
		},
		rotationY: function (node: PropertyNameAnimNode) {
			node.p.name.set(`rotation.y`);
		},
		rotationZ: function (node: PropertyNameAnimNode) {
			node.p.name.set(`rotation.z`);
		},
		scale: function (node: PropertyNameAnimNode) {
			node.p.name.set(`scale`);
		},
		scaleX: function (node: PropertyNameAnimNode) {
			node.p.name.set(`scale.x`);
		},
		scaleY: function (node: PropertyNameAnimNode) {
			node.p.name.set(`scale.y`);
		},
		scaleZ: function (node: PropertyNameAnimNode) {
			node.p.name.set(`scale.z`);
		},
	};
}
