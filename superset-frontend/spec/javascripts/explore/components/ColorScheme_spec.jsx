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
/* eslint-disable no-unused-expressions */
import React from 'react';
import { Select } from 'src/components';
import { getCategoricalSchemeRegistry } from 'src/core';
import { styledMount as mount } from 'spec/helpers/theming';
import ColorSchemeControl from 'src/explore/components/controls/ColorSchemeControl';

const defaultProps = {
  name: 'color_scheme',
  label: 'Color Scheme',
  options: getCategoricalSchemeRegistry()
    .keys()
    .map(s => [s, s]),
};

describe('ColorSchemeControl', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(<ColorSchemeControl {...defaultProps} />);
  });

  it('renders a Select', () => {
    expect(wrapper.find(Select)).toExist();
  });
});
