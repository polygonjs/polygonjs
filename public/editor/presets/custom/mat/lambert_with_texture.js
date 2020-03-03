// Custom Material nodes must inherite from POLY.CustomNode.MAT
class LambertWithTexture extends POLY.CustomNode.MAT {
	constructor() {
		super()
	}

	// this method will be called once when the node is created.
	// After that, when the node cooks, it will only modify this material.
	// A new one is created only when the code is updated
	create_material() {
		return new THREE.MeshLambertMaterial({
			color: 0xffffff,
		})
	}

	// Create the nodes parameters here.
	// You can create as many as you like,
	// but only inside the method create_params()
	create_params() {
		this.add_param( POLY.ParamType.OPERATOR_PATH, 'texture', '/COP/file_uv', {
			// we add options to the parameter.
			// The node_selection option ensures that
			// we can only add a texture node (or COP node, for compositing)
			// when selecting a node using the select button
			// on the right of the parameter field.
			node_selection: {
				context: POLY.NodeContext.COP
			}
		})
	}

	// The cook method is called everytime the node computes (or cooks!).
	// we prefix the method with async here, as the load_texture method is asynchronous
	async cook() {
		await this.load_texture('texture', 'map');

		// end_cook() notifies nodes that depend on this that they should update
		// It also sets the node to a clean state, meaning it is free to cook again.
		// If this was not called, the node would still be considered in the cooking state,
		// and would wait before cooking again
		this.end_cook()
	}

	async load_texture(param_name, material_attribute){
		const texture_node = this.param(param_name).found_node();
		if(texture_node){
			// here we request the content of the node referred to in the parameter 'texture', created in the create_params() method
			const texture_container = await texture_node.request_container()
			const texture = texture_container.texture()
			if(texture){
				this._material[material_attribute] = texture;
				this._material.needsUpdate = true;
			}
		}
	}

}


