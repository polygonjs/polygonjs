float textureDisplacementDisplace__COMPONENT__(sampler2D displacementMap, float amount, vec2 vUv) {
	return texture2D(displacementMap, vUv).__COMPONENT__ * amount;
}

TextureDisplacementResult textureDisplacement__COMPONENT__(
	sampler2D displacementMap,
	vec2 vUv,
	vec2 textureSize,
	float amount,
	vec3 position,
	vec3 normal,
	vec2 tangentsPosOffset
	){

	TextureDisplacementResult result;
	float diagonal = 1.0;//0.707;

	vec2 uvLookup = vec2( vUv.x, vUv.y );
	vec3 currentP = position + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, vUv );

	vec2 texelSize = vec2( 1.0 / textureSize.x, - 1.0 / textureSize.y );

	vec2 posOffset = vec2(tangentsPosOffset.x, tangentsPosOffset.y);

	vec3 offset0 = position + vec3( 0.0, 						0.0, 	posOffset.y);
	vec3 offset1 = position + vec3( diagonal * posOffset.x, 	0.0, 	diagonal * posOffset.y);
	vec3 offset2 = position + vec3( posOffset.x, 				0.0, 	0.0);
	vec3 offset3 = position + vec3( diagonal * posOffset.x, 	0.0, 	- diagonal * posOffset.y);
	vec3 offset4 = position + vec3( 0.0, 						0.0, 	- posOffset.y);
	vec3 offset5 = position + vec3( - diagonal * posOffset.x, 	0.0, 	- diagonal * posOffset.y);
	vec3 offset6 = position + vec3( - posOffset.x, 				0.0, 	0.0);
	vec3 offset7 = position + vec3( - diagonal * posOffset.x, 	0.0, 	diagonal * posOffset.y);

	vec2 uv0 = vec2( 0.0, 						texelSize.y);
	vec2 uv1 = vec2( diagonal * texelSize.x, 	diagonal * texelSize.y);
	vec2 uv2 = vec2( texelSize.x, 				0.0);
	vec2 uv3 = vec2( diagonal * texelSize.x, 	- diagonal * texelSize.y);
	vec2 uv4 = vec2( 0.0, 						- texelSize.y);
	vec2 uv5 = vec2( - diagonal * texelSize.x, 	- diagonal * texelSize.y);
	vec2 uv6 = vec2( - texelSize.x, 				0.0);
	vec2 uv7 = vec2( - diagonal * texelSize.x, 	diagonal * texelSize.y);

	vec3 p0 = offset0 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvLookup + uv0 );
	vec3 p1 = offset1 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvLookup + uv1 );
	vec3 p2 = offset2 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvLookup + uv2 );
	vec3 p3 = offset3 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvLookup + uv3 );
	vec3 p4 = offset4 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvLookup + uv4 );
	vec3 p5 = offset5 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvLookup + uv5 );
	vec3 p6 = offset6 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvLookup + uv6 );
	vec3 p7 = offset7 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvLookup + uv7 );

	vec3 d0 = (p0 - currentP);
	vec3 d1 = (p1 - currentP);
	vec3 d2 = (p2 - currentP);
	vec3 d3 = (p3 - currentP);
	vec3 d4 = (p4 - currentP);
	vec3 d5 = (p5 - currentP);
	vec3 d6 = (p6 - currentP);
	vec3 d7 = (p7 - currentP);

	vec3 computedNormal = vec3(0.);
	// computedNormal += cross(d0, d1);
	// computedNormal += cross(d1, d2);
	// computedNormal += cross(d2, d3);
	// computedNormal += cross(d3, d4);
	// computedNormal += cross(d4, d5);
	// computedNormal += cross(d5, d6);
	// computedNormal += cross(d6, d7);
	// computedNormal += cross(d7, d0);
	bool a = 1.0 > 0.5;
	if(a){
		computedNormal += cross(d0, d2);
		computedNormal += cross(d2, d3);
		computedNormal += cross(d3, d4);
		computedNormal += cross(d4, d6);
		computedNormal += cross(d6, d7);
		computedNormal += cross(d7, d0);
	}else{
		computedNormal += cross(d0, d1);
		computedNormal += cross(d1, d2);
		computedNormal += cross(d2, d4);
		computedNormal += cross(d4, d5);
		computedNormal += cross(d5, d6);
		computedNormal += cross(d6, d0);
	}
	result.normal = normalize(computedNormal);
	result.position = currentP;

	return result;

}