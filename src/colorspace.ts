//
// Pigment
//

module Pigment {
	//
	// Represents a color space
	//
	// A color space converts a source color to an equivalent color in a different space.
	//
	export interface ColorSpace<TSourceColor, TDestColor> {
		//
		// 'Encodes' a source color, producing a destination color
		//
		encode: TSourceColor => TDestColor;

		//
		// 'Decodes' a destination color, producing a source color
		//
		decode: TDestColor => TSourceColor;
	}
}
