import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

export interface StepChartPoint {
  label: string;
  value: number;
}

interface StepsLineChartProps {
  points: StepChartPoint[];
  goalValue: number;
  lineColor: string;
  goalLineColor: string;
  axisColor: string;
  labelColor: string;
}

const CHART_WIDTH = 340;
const CHART_HEIGHT = 220;
const PADDING_TOP = 20;
const PADDING_RIGHT = 18;
const PADDING_BOTTOM = 42;
const PADDING_LEFT = 38;

export function StepsLineChart({
  points,
  goalValue,
  lineColor,
  goalLineColor,
  axisColor,
  labelColor,
}: StepsLineChartProps) {
  const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  if (points.length === 0) {
    return <View style={styles.empty} />;
  }

  const maxValue = Math.max(goalValue, ...points.map((point) => point.value), 1);

  const xForIndex = (index: number): number => {
    if (points.length === 1) return PADDING_LEFT;
    const step = innerWidth / (points.length - 1);
    return PADDING_LEFT + index * step;
  };

  const yForValue = (value: number): number => {
    const normalized = value / maxValue;
    return PADDING_TOP + innerHeight - normalized * innerHeight;
  };

  const polylinePoints = points
    .map((point, index) => `${xForIndex(index)},${yForValue(point.value)}`)
    .join(" ");

  const goalY = yForValue(goalValue);

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Line
          x1={PADDING_LEFT}
          y1={PADDING_TOP}
          x2={PADDING_LEFT}
          y2={PADDING_TOP + innerHeight}
          stroke={axisColor}
          strokeWidth={1}
        />
        <Line
          x1={PADDING_LEFT}
          y1={PADDING_TOP + innerHeight}
          x2={PADDING_LEFT + innerWidth}
          y2={PADDING_TOP + innerHeight}
          stroke={axisColor}
          strokeWidth={1}
        />

        <Line
          x1={PADDING_LEFT}
          y1={goalY}
          x2={PADDING_LEFT + innerWidth}
          y2={goalY}
          stroke={goalLineColor}
          strokeDasharray="4 4"
          strokeWidth={2}
        />

        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point, index) => {
          const x = xForIndex(index);
          const y = yForValue(point.value);

          return (
            <Circle key={`${point.label}-${index}`} cx={x} cy={y} r={4} fill={lineColor} />
          );
        })}

        {points.map((point, index) => {
          const x = xForIndex(index);

          return (
            <SvgText
              key={`label-${point.label}-${index}`}
              x={x}
              y={CHART_HEIGHT - 16}
              fontSize="11"
              fill={labelColor}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          );
        })}

        <SvgText
          x={PADDING_LEFT + 6}
          y={goalY - 6}
          fontSize="11"
          fill={goalLineColor}
          textAnchor="start"
        >
          Goal
        </SvgText>

        <SvgText x={4} y={PADDING_TOP + 10} fontSize="11" fill={labelColor} textAnchor="start">
          {Math.round(maxValue).toLocaleString()}
        </SvgText>
        <SvgText
          x={4}
          y={PADDING_TOP + innerHeight + 4}
          fontSize="11"
          fill={labelColor}
          textAnchor="start"
        >
          0
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  empty: {
    height: CHART_HEIGHT,
    width: "100%",
  },
});
