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
    // Clamps a value to the range 0-1
    //
    function clamp(value: number) {
        if (value < 0.0) return 0.0;
        if (value > 1.0) return 1.0;
        return value;
    }

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

    //
    // A color space that deals with oversaturated color components by distributing the 'extra' light to other
    // components.
    //
    // For example, a red value of 2 will distribute 0.5 units to blue and green.
    //
    export class SaturatingColorSpace implements ColorSpace<EmissiveColor, EmissiveColor> {
        SaturatingColorSpace() {
            // Decoding goes straight through (we can't meaningfully reverse this transformation)
            this.decode = value => value;

            // Returns the amount of oversaturation in a particular value
            function oversaturation(value: number) {
                if (value > 1.0) return value-1.0;
                return 0;
            }

            // Distributes the 'extra' light caused by oversaturating a color
            // TODO: it would be nice if we distribute too much color to a component to
            // distribute the remainder to the remaining component.
            this.encode = value => {
                var redOver     = oversaturation(value.red);
                var greenOver   = oversaturation(value.green);
                var blueOver    = oversaturation(value.blue);

                return {
                    red:    clamp(value.red-redOver     + (greenOver*0.5 + blueOver*0.5)),
                    green:  clamp(value.green-greenOver + (redOver*0.5 + blueOver*0.5)),
                    blue:   clamp(value.blue-blueOver   + (redOver*0.5 + greenOver*0.5))
                };
            }
        }

        encode: (EmissiveColor) => EmissiveColor;
        decode: (EmissiveColor) => EmissiveColor;
    }
}
