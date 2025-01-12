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
import { t, smartDateFormatter, NumberFormats } from 'src/core';

// D3 specific formatting config
export const D3_FORMAT_DOCS = t(
  'D3 format syntax: https://github.com/d3/d3-format',
);

// input choices & options
export const D3_FORMAT_OPTIONS: [string, string][] = [
  [NumberFormats.SMART_NUMBER, t('Adaptative formating')],
  ['~g', t('Original value')],
  ['PRECENT', t('Precent (66 => 66%)')],
  ['Not Decimal Precent', t('Not Decimal Precent (66.6 => 67%)')],
  ['Thousand Separator', t('Thousand Separator (12345 => 12,345)')],
  ['1 Decimal Precent', t('1 Decimal Precent (2.432 => 2.4%)')],
  ['2 Decimal Precent', t('2 Decimal Precent (2.432 => 2.43%)')],
  ['.0%', '.0% (0.2432 => 24%)'],
  ['.1%', '.1% (0.2432 => 24.3%)'],
  ['.2%', '.2% (0.24321 => 24.32%)'],
  ['.3%', '.3% (0.24321 => 24.321%)'],
  [',d', ',d (12345.432 => 12,345)'],
  ['.1s', '.1s (12345.432 => 10k)'],
  ['.3s', '.3s (12345.432 => 12.3k)'],
  [',.1%', ',.1% (12345.432 => 1,234,543.2%)'],
  ['.4r', '.4r (12345.432 => 12350)'],
  [',.3f', ',.3f (12345.432 => 12,345.432)'],
  ['+,', '+, (12345.432 => +12,345.432)'],
  ['$,.2f', '$,.2f (12345.432 => $12,345.43)'],
  ['DURATION', t('Duration in s (66000 => 1m 6s)')],
  ['DURATION_SUB', t('Duration in ns (1.40008 => 1ms 400µs 80ns)')],
];

export const D3_TIME_FORMAT_DOCS = t(
  'D3 time format syntax: https://github.com/d3/d3-time-format',
);

export const D3_TIME_FORMAT_OPTIONS: [string, string][] = [
  [smartDateFormatter.id, t('Adaptative formating')],
  ['%d/%m/%Y', '%d/%m/%Y | 14/01/2019'],
  ['%m/%d/%Y', '%m/%d/%Y | 01/14/2019'],
  ['%Y-%m-%d', '%Y-%m-%d | 2019-01-14'],
  ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M:%S | 2019-01-14 01:32:10'],
  ['%d-%m-%Y %H:%M:%S', '%d-%m-%Y %H:%M:%S | 14-01-2019 01:32:10'],
  ['%H:%M:%S', '%H:%M:%S | 01:32:10'],
];

export const DEFAULT_NUMBER_FORMAT = D3_FORMAT_OPTIONS[0][0];
export const DEFAULT_TIME_FORMAT = D3_TIME_FORMAT_OPTIONS[0][0];
