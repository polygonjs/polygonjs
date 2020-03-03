// Custom Material nodes must inherit from POLY.CustomNode.MAT
class CustomPoints extends POLY.CustomNode.MAT {
	constructor() {
		super()
	}

	// this method will be called once when the node is created.
	// After that, when the node cooks, it will only modify this material.
	// A new one is created only when the code is updated
	create_material() {
		return new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.1,
		})
	}

	// Create the nodes parameters here.
	// You can create as many as you like,
	// but only inside the method create_params()
	create_params() {
		this.add_param( POLY.ParamType.COLOR, 'color', [1,1,1])
		this.add_param( POLY.ParamType.FLOAT, 'size', 1)
	}

	cook() {
		// this._material will be assigned to the return value of the create_material() method
		// We modify the attributes of the material by refering to the evaluated values of the parameters
		// with this._param_<param_name>, so this._param_color and this._param_size in this case
		this._material.color = this._param_color
		this._material.size = this._param_size

		// end_cook() notifies nodes that depend on this that they should update
		// It also sets the node to a clean state, meaning it is free to cook again.
		// If this was not called, the node would still be considered in the cooking state,
		// and would wait before cooking again
		this.end_cook()
	}

}


