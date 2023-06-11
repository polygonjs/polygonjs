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

	result.position = position + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, vUv );

	vec3 tangent = vec3(0.0, 0.0, 1.0);
	vec3 bitangent = vec3(1.0, 0.0, 0.0);
	vec2 texelSize = vec2( 1.0 / textureSize.x, 1.0 / textureSize.y );

	// tangent
	vec3 PosT0 = position + tangent * tangentsPosOffset.y;
	vec3 PosT1 = position - tangent * tangentsPosOffset.y;
	vec2 uvT0 = vUv + vec2(0.0, -texelSize.y);
	vec2 uvT1 = vUv + vec2(0.0, +texelSize.y);

	// bittangent
	vec3 PosBT0 = position + bitangent * tangentsPosOffset.x;
	vec3 PosBT1 = position - bitangent * tangentsPosOffset.x;
	vec2 uvBT0 = vUv + vec2(+texelSize.x, 0.0);
	vec2 uvBT1 = vUv + vec2(-texelSize.x, 0.0);

	// disp
	vec3 dispT0 = PosT0 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvT0 );
	vec3 dispT1 = PosT1 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvT1 );
	vec3 dispBT0 = PosBT0 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvBT0 );
	vec3 dispBT1 = PosBT1 + normal * textureDisplacementDisplace__COMPONENT__( displacementMap, amount, uvBT1 );

	vec3 dispT = normalize(dispT0 - dispT1);
	vec3 dispBT = normalize(dispBT0 - dispBT1);
	result.normal = normalize(cross(dispT, dispBT));

	return result;

}