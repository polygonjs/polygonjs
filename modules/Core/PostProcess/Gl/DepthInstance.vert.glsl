#include <common>

vec3 rotate_with_quat( vec3 v, vec4 q )
{
	return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
}


attribute vec4 instanceOrientation;
attribute vec3 instancePosition;
attribute vec3 instanceScale;
varying float vViewZDepth;



void main() {

	vec3 v_POLYGON_instance_transform1_position = vec3(position);
	v_POLYGON_instance_transform1_position *= instanceScale;
	v_POLYGON_instance_transform1_position = rotate_with_quat( v_POLYGON_instance_transform1_position, instanceOrientation );
	v_POLYGON_instance_transform1_position += instancePosition;
	
	// replaces #include <begin_vertex>
	vec3 transformed = v_POLYGON_instance_transform1_position;


	#include <project_vertex>

	vViewZDepth = - mvPosition.z;
}