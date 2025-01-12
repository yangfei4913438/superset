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
import { sum } from 'lodash';
import {
  BarChartTransformedProps,
  EchartsBarChartProps,
  EchartsBarFormData,
} from './types';
import { DEFAULT_FORM_DATA as DEFAULT_PIE_FORM_DATA } from './constants';
import { DEFAULT_LEGEND_FORM_DATA, LegendOrientation } from '../types';
import { defaultGrid, defaultTooltip } from '../defaults';
import { getFontSize } from '../utils/chart';
import { toRGBA } from '../utils/colors';

// 将值切换为百分比数据
// @ts-ignore
const switchPrecent: number[] = (arr: (string | number)[]) => {
  if (arr.length < 2) return arr;
  const name: string = arr[0] as string;
  const tmpArr = arr.slice(1, arr.length) as number[];
  const total = sum(tmpArr);
  const newArr = tmpArr.map(o => o / total);
  return [name, ...newArr];
};

export default function transformProps(
  chartProps: EchartsBarChartProps,
): BarChartTransformedProps {
  const {
    formData,
    height,
    hooks,
    // filterState,
    queriesData,
    width,
  } = chartProps;

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
    dateNameReplace, // 替换月份指标名称

    useAutoPadding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,

    showDataZoomY,
    zoomStartY,
    zoomEndY,
    showDataZoomX,
    zoomStartX,
    zoomEndX,
    barBackground, // 柱形的背景控制
    chartOrient, // 图表布局方向
    groupby,
    metrics, // 查询指标
    showAxisPointer, // 是否显示坐标轴指示器
    barWidth, // 柱子宽度
    ringgit, // 是否显示环比
    ringgitFontColor, // 环比的字体颜色

    showAverageLine,
    averageLineColor,
    averageLineType,

    yAxisLine, // 是否显示Y轴的轴线
    yAxisFormat, // Y轴的格式化类
    yAxisName, // Y轴名称
    yNameFontColor, // 名称颜色
    yAxisTick, // 轴线上的刻度
    ySplitLine, // Y轴方向的内部分割线
    yAxisLabel, // 是否显示Y轴标签
    yAxisShowMinmax, // 是否显示Y轴的最大值最小值限制
    yAxisBounds, // Y轴的最小值和最大值数组

    xAxisName, // X轴名称
    xNameFontColor, // 名称颜色
    xAxisLine, // X轴的轴线是否显示
    xAxisLabel, // X轴标签是否显示
    xLabelLayout, // X轴布局：标签旋转角度
    xAxisTick, // X轴是否显示刻度
    xSplitLine, // X轴方向的内部分割线
    xDistance, // X轴名称的距离

    showLabel, // 是否显示图形上的文本标签
    hAlignLabel, // 水平对齐文本标签
    vAlignLabel, // 垂直对齐文本标签
    labelRotate, // 文本标签旋转角度
    labelDistance, // 文本标签和图形的距离
    stacked, // 堆叠
    stackedPrecent, // 堆叠显示成百分比

    showLegend,
    legendPadding,
    legendOrientation,
    legendType,
    legendMode,
  }: EchartsBarFormData = {
    ...DEFAULT_LEGEND_FORM_DATA,
    ...DEFAULT_PIE_FORM_DATA,
    ...formData,
  };

  const { data, colnames } = queriesData[0];

  // 这里必然是多个返回数据
  const dataSet: { [key: string]: any[] } = {};
  if (groupby.length > 0) {
    data.forEach(row => {
      const keys: any[] = [];
      const values: number[] = [];
      Object.entries(row).forEach(([k, v]) => {
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
  } else {
    data.forEach(row => {
      Object.entries(row).forEach(([k, v], idx) => {
        let name = k;
        if (dateNameReplace) {
          if (idx === 0) {
            name = `${new Date().getFullYear()}-${String(
              new Date().getMonth(),
            ).padStart(2, '0')}`;
          } else {
            name = `${new Date().getFullYear()}-${String(
              new Date().getMonth() + 1,
            ).padStart(2, '0')}`;
          }
        }
        dataSet[name] = [v];
      });
    });
  }

  // 取出当前的指标名称数组
  let colNames: string[] = colnames.filter(col => !groupby.includes(col));
  if (groupby.length > 0) {
    if (dateNameReplace) {
      colNames = [
        `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(
          2,
          '0',
        )}`,
        `${new Date().getFullYear()}-${String(
          new Date().getMonth() + 1,
        ).padStart(2, '0')}`,
      ];
    }
  }

  // 指标分类标题
  const title: string[] = groupby.length
    ? ['product'].concat(colNames)
    : ['product'];

  // 生成数据集数据
  let rawData = [title];
  Object.entries(dataSet).forEach(([k, v]) => {
    rawData.push([k, ...v]);
  });

  // 如果堆叠百分比
  if (stacked && stackedPrecent) {
    const tmpArr = rawData.slice(1, rawData.length);
    // @ts-ignore
    rawData = [rawData[0], ...tmpArr.map(switchPrecent)];
  }

  const { setDataMask = () => {} } = hooks;

  // 标签位置，默认顶部
  let labelPosition = { position: 'top' };
  if (metrics.length > 1) {
    // 横向布局的时候，显示
    if (chartOrient === 'horizontal') {
      if (stacked) {
        // 多个放在内部显示
        labelPosition = { position: 'inside' };
      }
    } else {
      // 纵向布局的时候，也就是类目轴是竖着的时候
      labelPosition = { position: 'right' };
      if (stacked) {
        labelPosition = { position: 'inside' };
      }
    }
  } else {
    // 横向布局的时候，显示
    // eslint-disable-next-line no-lonely-if
    if (chartOrient !== 'horizontal') {
      labelPosition = { position: 'right' };
    }
  }

  // Y轴的格式化方法, 堆叠百分比的时候，自动显示百分比格式化类型
  const yFormatter = getNumberFormatter(
    stacked && stackedPrecent ? '.0%' : yAxisFormat,
  );

  // console.log('rawData:', rawData);
  // console.log('metrics:', metrics);

  let markPoint = {};
  if (ringgit) {
    const hbList: string[] = [];
    const mpList: object[] = [];
    // 一个维度，直接取值
    if (metrics.length === 1) {
      // 第一个值
      const raw1 = (rawData[1][1] as unknown) as number;
      // 第二个值
      const raw2: number = (rawData[2][1] as unknown) as number;
      // 计算环比（环比只会有两个数据比较）
      let val: any = Math.round(((raw2 - raw1) / raw1) * 100);
      if (val === 0) {
        val = (((raw2 - raw1) / raw1) * 100).toFixed(1);
      }
      // 显示在第二个柱子上
      mpList.push({
        value: raw2,
        xAxis: 1,
        yAxis: raw2,
      });
      hbList.push(`${val}%`);
    } else {
      rawData.forEach((raw, idx) => {
        if (idx > 0) {
          // 计算环比（环比只会有两个数据比较）
          // @ts-ignore
          let val: any = Math.round(((raw[2] - raw[1]) / raw[1]) * 100);
          // 如果是0，就显示小数
          if (val === 0) {
            // @ts-ignore
            val = (((raw[2] - raw[1]) / raw[1]) * 100).toFixed(1);
          }
          // 显示在第二个柱子上
          mpList.push({
            value: raw[2],
            xAxis: idx - 1, // 值索引
            yAxis: raw[2],
          });
          hbList.push(`${val}%`);
        }
      });
    }

    markPoint = {
      symbolSize: 0,
      silent: true, // 不响应和触发鼠标事件
      label: {
        fontSize: 12,
        color: 'red',
        fontWeight: 'bold',
        show: true,
        position: 'top',
        distance: 30,
        formatter: (params: any) => {
          // console.log('params-----:', params);
          if (metrics.length === 1) {
            // 只在第二个柱子上显示
            if (params.value === rawData[2][1]) {
              return `{a|${hbList[0]}}`;
            }
            return '';
          }
          // 系列索引1就是第2个柱子
          if (params.seriesIndex === 1) {
            return `{a|${hbList[params.dataIndex]}}`;
          }
          return '';
        },
        rich: {
          a: {
            align: 'center',
            fontSize: 14,
            fontWeight: 'bold',
            backgroundColor: '#fff',
            borderColor: '#aaa',
            borderWidth: 1,
            borderRadius: 4,
            padding: [10, 10],
            color: toRGBA(ringgitFontColor),
          },
        },
      },
      data: mpList,
    };
  }

  const markLine = {
    animation: false,
    data: [] as any[],
    lineStyle: {
      color: toRGBA(averageLineColor),
      type: averageLineType,
    },
    silent: true,
    symbol: 'none',
  };
  if (showAverageLine) {
    markLine.data.push({ name: '平均值', type: 'average' });
  }

  // 柱状图的通用配置
  const barSeries = {
    type: 'bar', // 柱状图
    animation: true, // 开启动画
    // 标签的统一布局配置。
    labelLayout: {
      // 是否隐藏重叠的标签
      hideOverlap: true,
    },
    tooltip: {
      // 提示的值格式化
      valueFormatter: yFormatter,
    },
    // 柱子宽度
    barWidth,
    label: {
      // 水平对齐
      align: hAlignLabel,
      // 垂直对齐
      verticalAlign: vAlignLabel,
      // 是否显示图形上的文本标签
      show: showLabel,
      // 标签的位置
      ...labelPosition,
      // 旋转
      rotate: labelRotate,
      // 距离
      distance: labelDistance,
      // 格式化值(标准数据集的取值格式化，非数据集才可以直接格式化)
      formatter({ value, encode }: any) {
        const idx = chartOrient === 'horizontal' ? encode.y[0] : encode.x[0];
        const row = value[idx];
        return yFormatter(row);
      },
    },
    stack: stacked && 'total', // 这个值相同的柱子，会堆叠起来。值是什么都行，但最好是有意义的值。
    markPoint,
    markLine,
  };

  // 这里只是生成相应数据的系列值
  const series = Array.from({
    length: groupby.length > 0 ? rawData[0].length - 1 : 1,
  }).map(() => ({
    ...barSeries,
    showBackground: barBackground,
    backgroundStyle: {
      color: 'rgba(180, 180, 180, 0.2)',
    },
  }));

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

  // Y轴的最大值和最小值
  let yMinMax = {};
  if (stacked && stackedPrecent) {
    yMinMax = {
      min: 0,
      max: 1,
    };
  } else if (yAxisShowMinmax && yAxisBounds.length === 2) {
    yMinMax = {
      min: yAxisBounds[0],
      max: yAxisBounds[1],
    };
  }

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
        return chartOrient === 'horizontal' ? -45 : 0;
    }
  };

  // 图例的位置布局方式
  let legendPosition = {};
  // eslint-disable-next-line default-case
  switch (legendOrientation) {
    case LegendOrientation.Right:
      legendPosition = { orient: 'vertical', top: 'center', right: 'right' };
      break;
    case LegendOrientation.Top:
      legendPosition = { top: 'top' };
      break;
    case LegendOrientation.Left:
      legendPosition = { orient: 'vertical', left: 'left', top: 'center' };
      break;
    case LegendOrientation.Bottom:
      legendPosition = { bottom: 'bottom' };
  }
  // 图例的内边距
  if (typeof legendPadding === 'number') {
    legendPosition = { ...legendPosition, padding: [5, legendPadding] };
  }

  // 类目轴的名称
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

  // 默认：一般横向，数组直接用就行，第一个分类是X，第二个值就是Y。如果是纵向的布局，就倒过来。
  const axisData = [
    {
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
    },
    {
      type: 'value', // 数值轴
      name: yAxisName, // Y表示数值轴
      nameLocation: 'center',
      nameGap: 32,
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: toRGBA(yNameFontColor),
      },
      ...yMinMax,
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
      axisLabel: {
        show: yAxisLabel,
        hideOverlap: true, // 是否隐藏重叠的标签
        formatter: yFormatter,
      },
    },
  ];
  const xAxis = chartOrient === 'horizontal' ? axisData[0] : axisData[1];
  const yAxis = chartOrient === 'horizontal' ? axisData[1] : axisData[0];

  // 图形grid位置计算
  const gridLayout = {};
  if (useAutoPadding) {
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
      if (ringgit) {
        gridLayout['top'] = '12%';
      } else {
        gridLayout['top'] = '10%';
      }
    }

    if (chartOrient !== 'horizontal') {
      gridLayout['right'] = '12%';
    }
  } else {
    gridLayout['top'] = `${paddingTop}%`;
    gridLayout['left'] = `${paddingLeft}%`;
    gridLayout['right'] = `${paddingRight}%`;
    gridLayout['bottom'] = `${paddingBottom}%`;
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
      yAxisIndex: [0],
      left: '93%',
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
    tooltip: {
      ...defaultTooltip,
      ...axisPointer,
    },
    legend: {
      show: showLegend,
      type: legendType === 'scroll' ? 'scroll' : 'plain',
      selectedMode: legendMode,
      ...legendPosition,
    },
    dataset: {
      source: rawData,
    },
    xAxis,
    yAxis,
    series,
  };

  return {
    formData,
    width,
    height,
    echartOptions,
    setDataMask,
    groupby,
    selectedValues: [],
  };
}
