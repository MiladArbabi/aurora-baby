import { Dimensions } from 'react-native'

export const RING_SIZE = Dimensions.get('window').width * 0.9
export const RING_THICKNESS = 30
export const GAP = 1
export const CLOCK_STROKE_WIDTH = 5
export const CLOCK_STROKE_EXTRA = CLOCK_STROKE_WIDTH
export const OUTER_RADIUS = RING_SIZE / 2
export const T = RING_THICKNESS
export const G = GAP

export const WRAPPER_SIZE = RING_SIZE + CLOCK_STROKE_EXTRA * 2;
export const CENTER = WRAPPER_SIZE / 2;
export const INNERMOST_DIAMETER = RING_SIZE - 4 * (RING_THICKNESS + GAP);
export const CLOCK_RADIUS = INNERMOST_DIAMETER / 2 - RING_THICKNESS;