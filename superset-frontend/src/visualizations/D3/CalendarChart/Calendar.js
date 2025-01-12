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
import PropTypes from 'prop-types';
import { extent as d3Extent, range as d3Range } from 'd3-array';
import { select as d3Select } from 'd3-selection';
import { getNumberFormatter, getTimeFormatter, getSequentialSchemeRegistry } from 'src/core';
import CalHeatMap from './vendor/cal-heatmap';
import './vendor/cal-heatmap.css';

function convertUTC(dttm) {
  return new Date(
    dttm.getUTCFullYear(),
    dttm.getUTCMonth(),
    dttm.getUTCDate(),
    dttm.getUTCHours(),
    dttm.getUTCMinutes(),
    dttm.getUTCSeconds(),
  );
}

const convertUTCTS = uts => convertUTC(new Date(uts)).getTime();

const propTypes = {
  data: PropTypes.shape({
    // Object hashed by metric name,
    // then hashed by timestamp (in seconds, not milliseconds) as float
    // the innermost value is count
    // e.g. { count_distinct_something: { 1535034236.0: 3 } }
    data: PropTypes.object,
    domain: PropTypes.string,
    range: PropTypes.number,
    // timestamp in milliseconds
    start: PropTypes.number,
    subdomain: PropTypes.string,
  }),
  height: PropTypes.number,
  // eslint-disable-next-line react/sort-prop-types
  cellPadding: PropTypes.number,
  // eslint-disable-next-line react/sort-prop-types
  cellRadius: PropTypes.number,
  // eslint-disable-next-line react/sort-prop-types
  cellSize: PropTypes.number,
  linearColorScheme: PropTypes.string,
  showLegend: PropTypes.bool,
  showMetricName: PropTypes.bool,
  showValues: PropTypes.bool,
  steps: PropTypes.number,
  timeFormat: PropTypes.string,
  valueFormat: PropTypes.string,
  verboseMap: PropTypes.object,
};

function Calendar(element, props) {
  const {
    data,
    height,
    cellPadding = 3,
    cellRadius = 0,
    cellSize = 10,
    domainGranularity,
    linearColorScheme,
    showLegend,
    showMetricName,
    showValues,
    steps,
    subdomainGranularity,
    timeFormat,
    valueFormat,
    verboseMap,
  } = props;

  const valueFormatter = getNumberFormatter(valueFormat);
  const timeFormatter = getTimeFormatter(timeFormat);

  const container = d3Select(element).classed('superset-legacy-chart-calendar', true).style('height', height);
  container.selectAll('*').remove();
  const div = container.append('div');

  const subDomainTextFormat = showValues ? (date, value) => valueFormatter(value) : null;

  // Trick to convert all timestamps to UTC
  // TODO: Verify if this conversion is really necessary
  // since all timestamps should always be in UTC.
  const metricsData = {};
  Object.keys(data.data).forEach(metric => {
    metricsData[metric] = {};
    Object.keys(data.data[metric]).forEach(ts => {
      metricsData[metric][convertUTCTS(ts * 1000) / 1000] = data.data[metric][ts];
    });
  });

  Object.keys(metricsData).forEach(metric => {
    const calContainer = div.append('div');
    if (showMetricName) {
      calContainer.text(`Metric: ${verboseMap[metric] || metric}`);
    }
    const timestamps = metricsData[metric];
    const extents = d3Extent(Object.keys(timestamps), key => timestamps[key]);
    const step = (extents[1] - extents[0]) / (steps - 1);
    const colorScale = getSequentialSchemeRegistry().get(linearColorScheme).createLinearScale(extents);

    const legend = d3Range(steps).map(i => extents[0] + step * i);
    const legendColors = legend.map(x => colorScale(x));

    const cal = new CalHeatMap();
    cal.init({
      start: convertUTCTS(data.start),
      data: timestamps,
      itemSelector: calContainer.node(),
      legendVerticalPosition: 'top',
      cellSize,
      cellPadding,
      cellRadius,
      legendCellSize: cellSize,
      legendCellPadding: 2,
      legendCellRadius: cellRadius,
      tooltip: true,
      domain: domainGranularity,
      subDomain: subdomainGranularity,
      range: data.range,
      browsing: true,
      legend,
      legendColors: {
        colorScale,
        min: legendColors[0],
        max: legendColors[legendColors.length - 1],
        empty: 'white',
      },
      displayLegend: showLegend,
      itemName: '',
      valueFormatter,
      timeFormatter,
      subDomainTextFormat,
    });
  });
}

Calendar.displayName = 'Calendar';
Calendar.propTypes = propTypes;

export default Calendar;
