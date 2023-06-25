import React, { Fragment, useState } from "react";
import { Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import dynamic from "next/dynamic";
import {
  subYears,
  subMonths,
  endOfYear,
  isAfter,
  format,
  parseISO
} from "date-fns";
import { Toggle } from "../../components/atomic";
import { BTCDataType } from "../../types";
import { BTCLineChartColumns, DateFormats } from "../../enums";

//Solves Hyrdation issues with Recharts, and should only render on the Client
const RechartsLineChart = dynamic(
  () => import("recharts").then(recharts => recharts.LineChart),
  { ssr: false }
);

enum FilterTypes {
  YTD = "YTD",
  "12M" = "12M",
  "3M" = "3M",
  "1M" = "1M",
  ALL = "All"
}

interface ToggleOption {
  label: string;
  value: FilterTypes;
}

interface LineChartProps {
  data: BTCDataType[];
}

interface LineConfig {
  dataKey: string;
  stroke: string;
  dot?: boolean;
}

const lineConfigs: LineConfig[] = [
  { dataKey: BTCLineChartColumns.GreaterThen1K, stroke: "#8884d8", dot: false },
  {
    dataKey: BTCLineChartColumns.GreaterThen10K,
    stroke: "#82ca9d",
    dot: false
  },
  {
    dataKey: BTCLineChartColumns.GreaterThen100K,
    stroke: "#ffc658",
    dot: false
  },
  { dataKey: BTCLineChartColumns.GreaterThen1M, stroke: "#FF8042", dot: false },
  { dataKey: BTCLineChartColumns.GreaterThen10M, stroke: "#00C49F", dot: false }
];

const FilterFunctionMap = {
  [FilterTypes.YTD]: (now: number | Date) => endOfYear(subYears(now, 1)),
  [FilterTypes["12M"]]: (now: number | Date) => subYears(now, 1),
  [FilterTypes["3M"]]: (now: number | Date) => subMonths(now, 3),
  [FilterTypes["1M"]]: (now: number | Date) => subMonths(now, 1),
  [FilterTypes.ALL]: () => new Date(0) // using epoch as default
};

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const [filter, setFilter] = useState(FilterTypes.ALL);

  const filterDate = FilterFunctionMap[filter](parseISO("2023-02-01"));
  const filteredData = data.filter(item =>
    isAfter(new Date(item.Time), filterDate)
  );

  const maxYValue = Math.max(
    ...filteredData.map(item => Math.max(...Object.values(item).slice(1)))
  );

  const formatValue = (value: number) => {
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const toggleOptions: ToggleOption[] = Object.values(
    FilterTypes
  ).map(value => ({ label: value, value }));

  return (
    <Fragment>
      <Toggle
        options={toggleOptions}
        currentValue={filter}
        onChange={setFilter}
      />
      <RechartsLineChart width={600} height={400} data={filteredData}>
        <XAxis
          dataKey="Time"
          tick={
            <CustomXAxisTick
              filter={filter}
              x={0}
              y={0}
              payload={{
                value: ""
              }}
            />
          }
        />
        <YAxis domain={[0, maxYValue]} tick={<CustomYAxisTick />} />
        <Tooltip
          formatter={formatValue}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
            fontSize: "14px"
          }}
          labelStyle={{ fontWeight: "bold" }}
          itemStyle={{ marginBottom: "5px" }}
        />
        {lineConfigs.map(({ dataKey, stroke, dot }) =>
          <Line
            key={dataKey}
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            dot={dot}
          />
        )}
        <Legend
          wrapperStyle={{
            paddingTop: "30px",
            fontSize: "14px"
          }}
        />
      </RechartsLineChart>
    </Fragment>
  );
};

export default LineChart;

const FilterToDateFormat: Record<FilterTypes, DateFormats> = {
  [FilterTypes.YTD]: DateFormats.MMM_yy,
  [FilterTypes["12M"]]: DateFormats.MMM_yy,
  [FilterTypes["3M"]]: DateFormats.MMM_yy,
  [FilterTypes["1M"]]: DateFormats.MMMM_dd,
  [FilterTypes.ALL]: DateFormats.yyyy
};

const CustomXAxisTick: React.FC<{
  x: number;
  y: number;
  payload: { value: string };
  filter: FilterTypes;
}> = ({ x, y, payload, filter }) => {
  const date = parseISO(payload.value);
  const dateFormat = FilterToDateFormat[filter];
  const label = format(date, dateFormat);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
        {label}
      </text>
    </g>
  );
};

const CustomYAxisTick: React.FC<any> = props => {
  const { x, y, payload } = props;

  const roundedValue = Math.round(payload.value / 1000000) * 1000000;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize={12}>
        {`${(roundedValue / 1000000).toFixed(0)}M`}
      </text>
    </g>
  );
};
