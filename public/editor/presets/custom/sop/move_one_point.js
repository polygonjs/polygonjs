// Custom Geometry nodes must inherit from POLY.CustomNode.SOP
class MoveOnePoint extends POLY.CustomNode.SOP {
	constructor(){
		super();

		// This defines how many inputs the node accepts
		this.set_inputs_count(1)
	}

	// Create the nodes parameters here.
	// You can create as many as you like,
	// but only inside the method create_params()
	create_params() {

		// point_index will be the index of the point we can move
		this.add_param( POLY.ParamType.INTEGER, 'point_index', 445, {
			range: [0, 1000],
			range_locked: [true, true]
		});

		// dir and amount will influence how much the point is moved
		this.add_param( POLY.ParamType.VECTOR, 'dir', [0,1,0]);
		this.add_param( POLY.ParamType.FLOAT, 'amount', 1, {
			range: [-1, 1],
			range_locked: [false, false]
		});
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

		// We compute the normalized dir and multiply by the amount.
		// We get both value in the parameters using this._param_<param_name>
		// therefore we can have:
		// - this._param_dir to get a THREE.Vector()
		// - this._param_amount to get a float
		const dir = this._param_dir.clone().normalize()
		dir.multiplyScalar(this._param_amount)

		// Here we traverse the group,
		// and for every geometry inside,
		// we move the x component of the first point
		let array;
		for(let object of core_group.objects()){
			object.traverse((child)=>{
				array = child.geometry.attributes['position'].array
				if(child.geometry){
					// we modify the expected point in the position array
					// with this._param_point_index
					// which gives us the value of the paramters 'point_index'
					array[this._param_point_index*3+0] += dir.x
					array[this._param_point_index*3+1] += dir.y
					array[this._param_point_index*3+2] += dir.z
				}
			})
		}

		// When we have modified the geometry as we want
		// we call set_core_group() and give it the modified core_group.
		// The node will then notify any of its outputs that
		// they can in turn process what this node created.
		this.set_core_group(core_group)
	}

}