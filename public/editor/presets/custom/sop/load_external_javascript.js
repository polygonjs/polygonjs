// Custom Geometry nodes must inherit from POLY.CustomNode.SOP
class LoadExternalJavascript extends POLY.CustomNode.SOP {
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
	async cook(input_contents){

		// In this case, since we only have a single input,
		// we only get the first element of the array input_contents,
		// which is a Polygonjs class called CoreGroup.
		// The CoreGroup has a method .objects() to get the list of THREE.Object3D it contains
		const core_group = input_contents[0]

		// This will ensure that the script is loaded only once
		// If you inspect this small file, you can see it loads the function MY_LIBRARY.process
		await POLY.Loader.Script.load('https://polygonjs-examples.s3.eu-west-2.amazonaws.com/js/custom_node_sop')

		// we can now call the loaded function on each geometry processed by this node
		for(let object of core_group.objects()){
			object.traverse(child=>{
				if(child.geometry){
					MY_LIBRARY.process(child.geometry, this._param_amount)
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