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
import React, { useCallback } from 'react';
import Echart from 'src/visualizations/ECharts/Echart';

import { ChartTransformedProps } from './types';
import { EventHandlers } from '../types';
import { getChartDataMask } from '../utils/datamask';

export default function EchartsRadar({
  height,
  width,
  echartOptions,
  setDataMask,
  labelMap,
  groupby,
  selectedValues,
  formData,
}: ChartTransformedProps) {
  const handleChange = useCallback(
    (values: string[]) => {
      if (!formData.emitFilter) {
        return;
      }
      const groupbyValues = values.map(value => labelMap[value]);
      const dataMask = getChartDataMask(values, groupby, groupbyValues);
      setDataMask(dataMask);
    },
    [formData.emitFilter, groupby, setDataMask, labelMap],
  );

  const eventHandlers: EventHandlers = {
    click: props => {
      const { name } = props;
      const values = Object.values(selectedValues);
      if (values.includes(name)) {
        // @ts-ignore
        handleChange(values.filter(v => v !== name));
      } else {
        handleChange([name]);
      }
    },
  };

  return (
    <Echart
      themeType={formData.themeType}
      height={height}
      width={width}
      echartOptions={echartOptions}
      eventHandlers={eventHandlers}
      selectedValues={selectedValues}
    />
  );
}
