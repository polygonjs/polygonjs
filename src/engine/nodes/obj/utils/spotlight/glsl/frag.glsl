varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vWorldOrigin;

uniform vec3 lightColor;

// uniform vec3 spotPosition;

uniform float attenuation;
uniform float anglePower;

void main(){

	//////////////////////////////////////////////////////////
	// distance attenuation   //
	//////////////////////////////////////////////////////////
	float intensity = distance(vWorldPosition, vWorldOrigin) / attenuation;
	intensity = 1.0 - clamp(intensity, 0.0, 1.0);

	//////////////////////////////////////////////////////////
	// intensity on angle   //
	//////////////////////////////////////////////////////////
	vec3 normal = vec3(vNormal.x, vNormal.y, abs(vNormal.z));
	float angleIntensity = pow( dot(normal, vec3(0.0, 0.0, 1.0)), anglePower );
	intensity = intensity * angleIntensity;
	// 'gl_FragColor = vec4( lightColor, intensity );

	//////////////////////////////////////////////////////////
	// final color   //
	//////////////////////////////////////////////////////////

	// set the final color
	gl_FragColor = vec4( lightColor, intensity);
}