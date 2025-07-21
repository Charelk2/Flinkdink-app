import React from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

// --- Type Definitions for our Color Palette ---
interface ThemeColors {
  skyTop: string;
  skyBottom: string;
  sun: string;
  cloud: string;
  hill: string;
  treeTrunk: string;
  treeFoliage: string[];
}

// --- Color Palette (always use light) ---
const colors: ThemeColors = {
  skyTop: '#8ED6FF',
  skyBottom: '#C8FFFF',
  sun: '#FFE66D',
  cloud: '#FFFFFF',
  hill: '#7FD88B',
  treeTrunk: '#84542A',
  treeFoliage: ['#52BE6C', '#66C87D', '#47A34A'],
};

// --- Prop Type Definitions for Sub-components ---
interface SunProps { colors: ThemeColors; }
interface CloudProps { x: number; y: number; color: string; }
interface TreeProps { x: number; y: number; size?: number; foliageColor: string; trunkColor: string; }

export default function FlinkDinkBackground() {
  const { width, height } = useWindowDimensions();

  // Helper Components
  const Sun: React.FC<SunProps> = ({ colors }) => (
    <Circle cx={width * 0.09} cy={height * 0.12} r={28} fill={colors.sun} opacity={0.75} />
  );

  const Cloud: React.FC<CloudProps> = ({ x, y, color }) => (
    <>
      <Circle cx={x} cy={y} r={35} fill={color} opacity={0.7} />
      <Circle cx={x + 30} cy={y + 15} r={45} fill={color} opacity={0.7} />
      <Circle cx={x - 25} cy={y + 20} r={30} fill={color} opacity={0.7} />
      <Circle cx={x + 10} cy={y + 35} r={25} fill={color} opacity={0.7} />
    </>
  );

  const Tree: React.FC<TreeProps> = ({ x, y, size = 1, foliageColor, trunkColor }) => (
    <>
      <Rect x={x - 4 * size} y={y} width={8 * size} height={24 * size} rx={4 * size} fill={trunkColor} />
      <Circle cx={x} cy={y} r={18 * size} fill={foliageColor} />
      <Circle cx={x + 12 * size} cy={y + 4 * size} r={12 * size} fill={foliageColor} opacity={0.88} />
      <Circle cx={x - 12 * size} cy={y + 5 * size} r={11 * size} fill={foliageColor} opacity={0.8} />
    </>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {/* Sky Gradient */}
        <Defs>
          <LinearGradient
            id="skyGrad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2={height.toString()}
          >
            <Stop offset="0%" stopColor={colors.skyTop} />
            <Stop offset="100%" stopColor={colors.skyBottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#skyGrad)" />

        <Sun colors={colors} />

        {/* Clouds */}
        <Cloud x={width * 0.75} y={height * 0.18} color={colors.cloud} />
        <Cloud x={width * 0.2} y={height * 0.22} color={colors.cloud} />

        {/* Hill */}
        <Path
          d={`M0,${height * 0.7} C ${width * 0.3},${height * 0.65} ${width * 0.7},${height * 0.75} ${width},${height * 0.7} L${width},${height} L0,${height} Z`}
          fill={colors.hill}
        />

        {/* Trees */}
        <Tree x={width * 0.1} y={height * 0.64 + 45} size={1.1} foliageColor={colors.treeFoliage[0]} trunkColor={colors.treeTrunk} />
        <Tree x={width * 0.9} y={height * 0.63 + 45} size={1.3} foliageColor={colors.treeFoliage[1]} trunkColor={colors.treeTrunk} />
        <Tree x={width * 0.82} y={height * 0.65 + 45} size={0.9} foliageColor={colors.treeFoliage[2]} trunkColor={colors.treeTrunk} />
      </Svg>
    </View>
  );
}
