/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { getNumberFormatter } from 'src/core';
import { EChartsCoreOption } from 'echarts';
import {
  EchartsMixedLineBarChartTransformedProps,
  EchartsMixedLineBarProps,
  EchartsMixedLineBarFormData,
} from './types';
import { defaultGrid, defaultTooltip } from '../../defaults';
import { getFontSize } from '../../utils/chart';
import { toRGBA } from '../../utils/colors';

const lineConfig = (
  stacked: boolean,
  smooth: boolean,
  showLabel: boolean,
  yAxisFormat: string,
  yAxisShowMinmax: boolean,
  yAxisBounds: any[],
) => {
  // Y轴的格式化方法, 堆叠百分比的时候，自动显示百分比格式化类型
  const numberFormatter = getNumberFormatter(yAxisFormat);

  // 折线图的通用配置
  const lineSeries = {
    type: 'line', // 折线图
    smooth, // 平滑曲线
    animation: true, // 开启动画
    // 标签的统一布局配置。
    labelLayout: {
      // 是否隐藏重叠的标签
      hideOverlap: true,
    },
    label: {
      // 在柱子上显示值
      show: showLabel,
      // 标签的位置
      position: 'top',
      // 旋转
      rotate: 0,
      // 格式化值(标准数据集的取值格式化，非数据集才可以直接格式化)
      formatter({ value, encode }: any) {
        const idx = encode.y[0];
        const row = value[idx];
        return numberFormatter(row);
      },
    },
    stack: stacked && 'total', // 这个值相同的柱子，会堆叠起来。值是什么都行，但最好是有意义的值。
  };

  // Y轴的最大值和最小值
  let yMinMax = {};
  if (yAxisShowMinmax && yAxisBounds.length === 2) {
    yMinMax = {
      min: yAxisBounds[0],
      max: yAxisBounds[1],
    };
  }

  return {
    numberFormatter,
    lineSeries,
    yMinMax,
  };
};

const barConfig = (
  metrics: any[],
  stacked: boolean,
  yAxisFormat: string,
  showLabel: boolean,
  barBackground: boolean,
  yAxisShowMinmax: boolean,
  yAxisBounds: any[],
  barWidth: number,
) => {
  // 标签位置，默认顶部
  let labelPosition = { position: 'top' };
  if (metrics.length > 1 && stacked) {
    // 多个放在内部显示
    labelPosition = { position: 'inside' };
  }

  // Y轴的格式化方法, 堆叠百分比的时候，自动显示百分比格式化类型
  const numberFormatter = getNumberFormatter(yAxisFormat);

  // 柱状图的通用配置
  const barSeries = {
    type: 'bar', // 柱状图
    animation: true, // 开启动画
    // 标签的统一布局配置。
    labelLayout: {
      // 是否隐藏重叠的标签
      hideOverlap: true,
    },
    // 柱子宽度
    barWidth,
    label: {
      // 是否显示图形上的文本标签
      show: showLabel,
      // 标签的位置
      ...labelPosition,
      // 旋转
      rotate: 0,
      // 格式化值(标准数据集的取值格式化，非数据集才可以直接格式化)
      formatter({ value, encode }: any) {
        const idx = encode.y[0];
        const row = value[idx];
        return numberFormatter(row);
      },
    },
    stack: stacked && 'total', // 这个值相同的柱子，会堆叠起来。值是什么都行，但最好是有意义的值。
    showBackground: barBackground, // 柱子的背景色
    backgroundStyle: {
      color: 'rgba(180, 180, 180, 0.2)',
    },
  };

  // Y轴的最大值和最小值
  let yMinMax = {};
  if (yAxisShowMinmax && yAxisBounds.length === 2) {
    yMinMax = {
      min: yAxisBounds[0],
      max: yAxisBounds[1],
    };
  }

  return {
    numberFormatter,
    barSeries,
    yMinMax,
  };
};

// X轴标签布局: 旋转角度
const getRotate = (rotate: string): number => {
  switch (rotate) {
    case '0°':
      return 0;
    case '-45°':
      return -45;
    case '-90°':
      return -90;
    case '45°':
      return 45;
    case '90°':
      return 90;
    default:
      return -45;
  }
};

export default function transformProps(
  chartProps: EchartsMixedLineBarProps,
): EchartsMixedLineBarChartTransformedProps {
  const { formData, height, hooks, queriesData, width } = chartProps;

  // console.log('chartProps:', chartProps);

  const {
    titleText,
    titleFontSize,
    titleFontColor,
    titleFontWeight,
    subTitleText,
    subTitleFontSize,
    subTitleFontColor,
    subTitleFontWeight,

    // 通用配置
    showDataZoomY,
    zoomStartY,
    zoomEndY,
    showDataZoomX,
    zoomStartX,
    zoomEndX,
    groupby, // 分组条件
    showAxisPointer, // 是否显示坐标轴指示器
    showLegend, // 是否显示图例
    legendMode, // 图例显示模式
    legendPadding, // 图例的内边距
    legendType, // 图例的显示类型：滚动还是平铺
    barBackground, // 柱形的背景控制
    barWidth, // 柱子宽度
    smooth, // 平滑曲线
    symbol, // 折线图节点上的标记类型
    symbolSize, // 标记的大小
    symbolRotate, // 标记的旋转角度
    // 不同的配置
    emitFilter, // 全局筛选会用到
    emitFilterB,
    // adhocFilters, // 不太清楚干嘛的
    // adhocFiltersB,
    showLabel, // 是否显示图形上的文本标签
    showLabelB,
    stacked, // 堆叠
    stackedB,

    yAxisTick, // 刻度
    yAxisTickB,

    ySplitLine, // 内部分割
    ySplitLineB,

    yAxisLabel, // 标签
    yAxisLabelB,

    yAxisFormat, // Y轴1的格式化类
    yAxisFormatB, // Y轴2的格式化类
    yAxisName, // Y轴1名称
    yAxisNameB, // Y轴2名称
    yAxisLine, // Y轴1是否显示数值轴的线
    yAxisLineB, // Y轴2是否显示数值轴的线
    yAxisShowMinmax, // 是否显示Y1轴的最大值最小值限制
    yAxisShowMinmaxB, // 是否显示Y2轴的最大值最小值限制
    yAxisBounds, // Y轴1的最小值和最大值数组
    yAxisBoundsB, // Y轴2的最小值和最大值数组

    xAxisName, // X轴名称
    xNameFontColor, // 名称颜色
    xAxisLine, // X轴的轴线是否显示
    xAxisLabel, // X轴标签是否显示
    xLabelLayout, // X轴布局：标签旋转角度
    xAxisTick, // X轴是否显示刻度
    xSplitLine, // X轴方向的内部分割线
    xDistance, // X轴名称的距离
  }: EchartsMixedLineBarFormData = formData;

  // 这里必然是多个返回数据
  const dataSet: { [key: string]: any[] } = {};
  // 指标分类标题
  let title: string[] = [];
  // 柱形图的指标数量
  let barNumbers = 0;
  // 折线图的指标数量
  let lineNumbers = 0;
  // 开始处理数据
  queriesData.forEach(response => {
    // 取出当前的指标名称数组
    const colNames: string[] = response.colnames.filter(
      col => !groupby.includes(col),
    );
    // 指标收录，因为只有两个查询结果，所以只需要判断当前是否为空
    if (title.length === 0) {
      title = ['product'].concat(colNames);
      barNumbers = colNames.length;
    } else {
      title = title.concat(colNames);
      lineNumbers = colNames.length;
    }

    // 处理维度分组和对应的值
    response.data.forEach(row => {
      const keys: any[] = [];
      const values: any[] = [];
      Object.entries(row).forEach(([k, v]) => {
        // 判断是否为分组维度
        if (groupby.includes(k)) {
          // @ts-ignore
          if ([undefined, null].includes(v)) {
            keys.push('null');
          } else {
            keys.push(v);
          }
        } else {
          // 避免值不是数值，造成图表渲染出现异常
          // @ts-ignore
          const value = [undefined, null].includes(v) ? 0 : v;
          values.push(value);
        }
      });
      // 生成存储key
      const key = keys.join(',');
      if (Object.keys(dataSet).includes(key)) {
        dataSet[key] = dataSet[key].concat(values);
      } else {
        dataSet[key] = values;
      }
    });
  });

  const sourceData = [title];
  Object.entries(dataSet).forEach(([k, v]) => {
    sourceData.push([k, ...v]);
  });

  const { setDataMask = () => {} } = hooks;

  const metrics = sourceData[0].slice(1, sourceData[0].length);

  const bConfig = barConfig(
    metrics,
    stacked,
    yAxisFormat,
    showLabel,
    barBackground,
    yAxisShowMinmax,
    yAxisBounds,
    barWidth,
  );
  const lConfig = lineConfig(
    stackedB,
    smooth,
    showLabelB,
    yAxisFormatB,
    yAxisShowMinmaxB,
    yAxisBoundsB,
  );

  // X轴的名称
  let xLabelGap = {};
  if (xAxisName) {
    xLabelGap = {
      name: xAxisName, // X 表示类目轴
      nameGap: xDistance,
      nameLocation: 'center',
      nameTextStyle: {
        color: toRGBA(xNameFontColor),
        fontWeight: 'bold',
        fontSize: 16,
      },
    };
  }
  const xAxis = {
    type: 'category', // 类目轴
    ...xLabelGap,
    // 轴线
    axisLine: {
      show: xAxisLine,
    },
    // 轴线上的刻度
    axisTick: {
      show: xAxisTick,
    },
    // 内部分割线
    splitLine: {
      show: xSplitLine,
    },
    axisLabel: {
      show: xAxisLabel,
      hideOverlap: true, // 是否隐藏重叠的标签
      rotate: getRotate(xLabelLayout), // 标签旋转角度
    },
  };
  const y1Axis = {
    type: 'value', // 数值轴
    name: yAxisName, // Y表示数值轴
    nameGap: 24,
    nameTextStyle: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    ...bConfig.yMinMax,
    axisLine: {
      // 是否显示数值轴的轴线
      show: yAxisLine,
    },
    // 轴线上的刻度
    axisTick: {
      show: yAxisTick,
    },
    // 内部分割线
    splitLine: {
      show: ySplitLine,
    },
    // 轴线上的标签
    axisLabel: {
      show: yAxisLabel,
      hideOverlap: true, // 是否隐藏重叠的标签
      formatter(val: number) {
        return bConfig.numberFormatter(val);
      },
    },
  };
  const y2Axis = {
    type: 'value', // 数值轴
    name: yAxisNameB, // Y表示数值轴
    nameGap: 24,
    nameTextStyle: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    ...lConfig.yMinMax,
    axisLine: {
      // 是否显示数值轴的轴线
      show: yAxisLineB,
    },
    // 轴线上的刻度
    axisTick: {
      show: yAxisTickB,
    },
    // 内部分割线
    splitLine: {
      show: ySplitLineB,
    },
    // 轴线上的标签
    axisLabel: {
      show: yAxisLabelB,
      formatter(val: number) {
        return lConfig.numberFormatter(val);
      },
    },
  };

  // 暂时还用不到这个，保留做参考
  // const selectedValues = (filterState.selectedValues || []).reduce(
  //   (acc: Record<string, number>, selectedValue: string) => {
  //     const index = series.findIndex(({ name }) => name === selectedValue);
  //     return {
  //       ...acc,
  //       [index]: selectedValue,
  //     };
  //   },
  //   {},
  // );

  // 图形grid位置计算
  const gridLayout = {};
  if (xAxisName || showDataZoomX) {
    if (getRotate(xLabelLayout) === 0) {
      gridLayout['bottom'] = 64;
    } else {
      gridLayout['bottom'] = 32;
    }
  } else {
    gridLayout['bottom'] = 'auto';
  }
  if (showLegend) {
    gridLayout['top'] = '10%';
  }

  // 图例的位置布局方式
  let legendPosition = {};
  // 图例的内边距
  if (typeof legendPadding === 'number') {
    legendPosition = { padding: [5, legendPadding] };
  }

  let axisPointer = {};
  if (showAxisPointer) {
    axisPointer = {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    };
  }

  // 数据缩放
  let dataZoom = {};
  if (showDataZoomX || showDataZoomY) {
    const zoomX = {
      type: 'slider',
      show: true,
      xAxisIndex: [0],
      start: zoomStartX,
      end: zoomEndX,
    };
    const zoomY = {
      type: 'slider',
      show: true,
      yAxisIndex: [0, 1],
      left: showLabelB ? '96%' : '93%',
      start: zoomStartY,
      end: zoomEndY,
    };
    const list = [];
    if (showDataZoomX) {
      list.push(zoomX);
    }
    if (showDataZoomY) {
      list.push(zoomY);
    }
    dataZoom = {
      dataZoom: list,
    };
  }

  const echartOptions: EChartsCoreOption = {
    title: {
      text: titleText,
      textStyle: {
        fontSize: getFontSize(titleFontSize, width),
        fontWeight: titleFontWeight,
        color: toRGBA(titleFontColor),
      },
      subtext: subTitleText,
      subtextStyle: {
        fontSize: getFontSize(subTitleFontSize, width),
        fontWeight: subTitleFontWeight,
        color: toRGBA(subTitleFontColor),
      },
    },
    grid: {
      ...defaultGrid,
      ...gridLayout,
    },
    ...dataZoom,
    legend: {
      show: showLegend,
      type: legendType === 'scroll' ? 'scroll' : 'plain',
      selectedMode: legendMode,
      top: 'top',
      ...legendPosition,
    },
    tooltip: {
      ...defaultTooltip,
      ...axisPointer,
    },
    dataset: {
      source: sourceData,
    },
    xAxis,
    yAxis: [y1Axis, y2Axis],
    series: [
      ...Array.from({ length: barNumbers }).map(_ => ({
        yAxisIndex: 0,
        ...bConfig.barSeries,
        tooltip: {
          // 提示的值格式化
          valueFormatter: (val: any) => bConfig.numberFormatter(val),
        },
      })),
      ...Array.from({ length: lineNumbers }).map(_ => ({
        yAxisIndex: 1,
        // 标记
        symbol,
        symbolSize,
        symbolRotate,
        ...lConfig.lineSeries,
        tooltip: {
          // 提示的值格式化
          valueFormatter: (val: any) => lConfig.numberFormatter(val),
        },
      })),
    ],
  };

  // console.log('echartOptions:', echartOptions);

  return {
    formData,
    width,
    height,
    echartOptions,
    setDataMask,
    groupby,
    selectedValues: [],
    emitFilter,
    emitFilterB,
    labelMap: {},
    labelMapB: {},
  };
}
