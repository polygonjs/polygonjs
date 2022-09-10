// // --- REFRACTION - START
// vec3 refractedColor = vec3(0.);
// float ior = __ior__;
// float biasMult = __refractionBiasMult__;
// vec3 tint = __refractionTint__;
// float absorbtion = __absorbtion__;
// if(__splitRGB__){
// 	vec3 offset = __iorOffset__;
// 	vec4 refractedDataR = GetRefractedData(p, n, rayDir, ior+offset.x, biasMult, __envMap__, __refractionDepth__);
// 	vec4 refractedDataG = GetRefractedData(p, n, rayDir, ior+offset.y, biasMult, __envMap__, __refractionDepth__);
// 	vec4 refractedDataB = GetRefractedData(p, n, rayDir, ior+offset.z, biasMult, __envMap__, __refractionDepth__);
// 	refractedColor.r = applyRefractionAbsorbtion(refractedDataR, tint, absorbtion).r;
// 	refractedColor.g = applyRefractionAbsorbtion(refractedDataG, tint, absorbtion).g;
// 	refractedColor.b = applyRefractionAbsorbtion(refractedDataB, tint, absorbtion).b;
// } else {
// 	vec4 refractedData = GetRefractedData(p, n, rayDir, ior, biasMult, __envMap__, __refractionDepth__);
// 	refractedColor = applyRefractionAbsorbtion(refractedData, tint, absorbtion);
// }
// col += refractedColor * __transmission__;
// // --- REFRACTION - END