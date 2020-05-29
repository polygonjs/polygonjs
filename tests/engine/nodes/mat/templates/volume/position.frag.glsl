precision highp float;
precision highp int;

#include <common>

#define DIR_LIGHTS_COUNT 1
#define MAX_STEPS_COUNT 4096

uniform vec3 u_Color;
uniform float u_VolumeDensity;
uniform float u_ShadowDensity;
uniform float u_StepSize;
uniform vec3 u_BoundingBoxMin;
uniform vec3 u_BoundingBoxMax;
//const int u_PointsCount = 3;
//uniform vec3 u_Points[3];
uniform sampler2D u_Map;

//const int u_DirectionalLightsCount = 1;
uniform vec3 u_DirectionalLightDirection; //[DIR_LIGHTS_COUNT];

varying vec3 vPw;
// varying vec3 vN;
// varying vec2 vUV;
//varying vec3 vPCameraSpace;
// varying vec4 vCd;

vec3 normalize_in_bbox(vec3 point){

	vec3 min = u_BoundingBoxMin;
	vec3 max = u_BoundingBoxMax;

	return vec3(
		(point.x - min.x) / (max.x - min.x),
		(point.y - min.y) / (max.y - min.y),
		(point.z - min.z) / (max.z - min.z)
	);
}

bool is_inside_bbox(vec3 Pw){

	vec3 min = u_BoundingBoxMin;
	vec3 max = u_BoundingBoxMax;

	return (
		Pw.x > min.x &&
		Pw.y > min.y &&
		Pw.z > min.z &&

		Pw.x < max.x &&
		Pw.y < max.y &&
		Pw.z < max.z
		);
}

float density_to_opacity(float density, float step_size){
	float curent_density = density;
	curent_density = max(0.0, curent_density);

	float opacity = (1.0-exp(-curent_density * step_size));
	return max(opacity,0.0);
}

float density_function(vec3 position_for_step){
	float density = 1.0;
	// start builder body code



	// /MAT/volume_builder1/globals1
	vec3 v_POLY_globals1_position = position_for_step;
	
	// /MAT/volume_builder1/vec3_to_float1
	float v_POLY_vec3_to_float1_y = v_POLY_globals1_position.y;
	
	// /MAT/volume_builder1/output1
	density *= v_POLY_vec3_to_float1_y;




	return density;
}

vec4 raymarch_light(vec3 ray_dir, vec3 start_pos){

	float step_size = u_StepSize;
	vec3 step_vector = ray_dir * step_size;

	vec3 current_pos = start_pos + step_vector*rand(start_pos.x*ray_dir.xy);
	float opacity = 0.0;
	for(int i=0; i<MAX_STEPS_COUNT; i++){
		if(opacity >= 0.99){ break; }

		if( is_inside_bbox(current_pos) ){

			float density = density_function(current_pos) * u_ShadowDensity;
			opacity += density_to_opacity(density, step_size);
			current_pos += step_vector;

		}else{
			break;
		}
	}

	vec3 light_color = vec3(1.0, 1.0, 1.0) * u_Color;
	light_color *= (1.0-opacity);
	return vec4(light_color, 1.0-opacity);
}

vec4 raymarch_bbox(vec3 start_pos, vec3 ray_dir){

	float step_size = u_StepSize;
	vec3 step_vector = ray_dir * step_size;

	vec3 current_pos = start_pos - step_vector*rand(ray_dir.xz);
	float opacity = 0.0;
	vec3 color = vec3(0.0, 0.0, 0.0);
	float steps_count = 0.0;
	bool was_inside_bbox = false;
	for(int i=0; i<MAX_STEPS_COUNT; i++){
		if(opacity >= 0.99){ break; }

		if( i==0 || is_inside_bbox(current_pos) ){
			was_inside_bbox = true;

			float density = density_function(current_pos) * u_VolumeDensity;
			opacity += density_to_opacity(density, step_size);

			vec4 light_color = vec4(0.0,0.0,0.0,1.0); //vec4(1.0,1.0,1.0,1.0);
			// vec3 directional_light_direction;
			// for ( int l = 0; l < DIR_LIGHTS_COUNT; l++ ) {
			// directional_light_direction = u_DirectionalLightsDirection[ l ];
			light_color += raymarch_light(-u_DirectionalLightDirection, current_pos);
			// }
			float blend = 1.0-opacity;
			color = mix( color.xyz, light_color.xyz, vec3(blend, blend, blend) );
			steps_count += 1.0;

		}else{
			if (was_inside_bbox) { break; }
		}
		current_pos += step_vector;
	}

	return vec4(color, opacity);
	// steps_count = steps_count / 5.0;
	// return vec4(vec3(steps_count, steps_count, steps_count), 1.0);
}

void main()	{

	vec3 eye = normalize(vPw - cameraPosition);
	// we can start from the bbox, as we are front facing
	vec3 start_pos = vPw;

	vec4 color = raymarch_bbox(start_pos, eye);
	gl_FragColor = color;

}