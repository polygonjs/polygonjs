// Custom Geometry nodes must inherit from POLY.CustomNode.SOP
class DoNothing extends POLY.CustomNode.SOP {
	constructor(){
		super();

		// This defines how many inputs the node accepts
		this.set_inputs_count(1)
	}

	// Create the nodes parameters here.
	// You can create as many as you like,
	// but only inside the method create_params()
	create_params() {
		this.add_param( POLY.ParamType.FLOAT, 'amount', 1 );
	}

	// The cook method is called everytime the node computes (or cooks!).
	// Input_containers are the containers fetched from the input nodes
	// there can be as many inputs
	cook(input_contents){

		// In this case, since we only have a single input,
		// we only get the first element of the array input_contents,
		// which is a Polygonjs class called CoreGroup.
		// The CoreGroup has a method .objects() to get the list of THREE.Object3D it contains
		const core_group = input_contents[0]

		// When we have modified the geometry as we want
		// we call set_core_group() and give it the modified core_group.
		// The node will then notify any of its outputs that
		// they can in turn process what this node created.
		this.set_core_group(core_group)
	}
}