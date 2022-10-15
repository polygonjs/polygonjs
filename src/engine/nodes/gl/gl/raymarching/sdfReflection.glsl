// --- REFLECTION - START
vec3 reflectedColor = GetReflection(p, n, rayDir, __reflectionBiasMult__, __envMap__, __reflectionDepth__, sdfContext);
col += reflectedColor * __reflectionTint__ * __reflectivity__;
// --- REFLECTION - END