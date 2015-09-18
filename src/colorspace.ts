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
        encode: (TSourceColor) => TDestColor;

        //
        // 'Decodes' a destination color, producing a source color
        //
        decode: (TDestColor) => TSourceColor;
    };

    //
    // Convets to and from a screen color space
    //
    // This applies gamma correction and clamps the values to a 0-1 range to generate a final color.
    // Note that the clamping is simple; if there are out of range values in use, then this will produce
    // distorted colors with no attempt at correction.
    //
    // The most common distortion will be when a color is oversaturated. For example, a color with a red
    // value of 2 will be clamped to 1, meaning that it looks no different.
    //
    export class ScreenColorSpace implements ColorSpace<EmissiveColor, EmissiveColor> {
        ScreenColorSpace(encodeGamma: GammaFunction, decodeGamma: GammaFunction) {
            encodeGamma = encodeGamma || createGammaFunction(defaultEncodingGamma);
            decodeGamma = decodeGamma || createGammaFunction(defaultDecodingGamma);

            function clamp(value: number) {
                if (value < 0.0) return 0.0;
                if (value > 1.0) return 1.0;
                return value;
            }

            this.encode = value => {
                return {
                    red:    clamp(encodeGamma(value.red)),
                    green:  clamp(encodeGamma(value.green)),
                    blue:   clamp(encodeGamma(value.blue))
                };
            };

            this.decode = value => {
                return {
                    red:    clamp(decodeGamma(value.red)),
                    green:  clamp(decodeGamma(value.green)),
                    blue:   clamp(decodeGamma(value.blue))
                };
            };
        }

        encode: (EmissiveColor) => EmissiveColor;
        decode: (EmissiveColor) => EmissiveColor;
    };
}
