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
import React from 'react';
import PropTypes from 'prop-types';
import { t, css, withTheme } from 'src/core';
import { InfoTooltipWithTrigger } from 'src/chartConntrols';
import { Tooltip } from 'src/components/Tooltip';
import { FormLabel } from 'src/components/Form';
import Icons from 'src/components/Icons';

const propTypes = {
  name: PropTypes.string,
  label: PropTypes.node,
  description: PropTypes.node,
  validationErrors: PropTypes.array,
  renderTrigger: PropTypes.bool,
  rightNode: PropTypes.node,
  leftNode: PropTypes.node,
  onClick: PropTypes.func,
  hovered: PropTypes.bool,
  tooltipOnClick: PropTypes.func,
  warning: PropTypes.string,
  danger: PropTypes.string,
};

const defaultProps = {
  validationErrors: [],
  renderTrigger: false,
  hovered: false,
  name: undefined,
};

class ControlHeader extends React.Component {
  renderOptionalIcons() {
    if (this.props.hovered) {
      return (
        <span
          css={theme => css`
            position: absolute;
            top: 50%;
            right: 0;
            padding-left: ${theme.gridUnit}px;
            transform: translate(100%, -50%);
            white-space: nowrap;
          `}
        >
          {this.props.description && (
            <span>
              <InfoTooltipWithTrigger
                label={t('description')}
                tooltip={this.props.description}
                placement="top"
                onClick={this.props.tooltipOnClick}
              />{' '}
            </span>
          )}
          {this.props.renderTrigger && (
            <span>
              <InfoTooltipWithTrigger
                label={t('bolt')}
                tooltip={t('Changing this control takes effect instantly')}
                placement="top"
                icon="bolt"
              />{' '}
            </span>
          )}
        </span>
      );
    }
    return null;
  }

  render() {
    if (!this.props.label) {
      return null;
    }
    const labelClass =
      this.props.validationErrors.length > 0 ? 'text-danger' : '';

    const { theme } = this.props;

    return (
      <div className="ControlHeader" data-test={`${this.props.name}-header`}>
        <div className="pull-left">
          <FormLabel
            css={{
              marginBottom: 0,
              position: 'relative',
            }}
          >
            {this.props.leftNode && <span>{this.props.leftNode}</span>}
            <span
              role="button"
              tabIndex={0}
              onClick={this.props.onClick}
              className={labelClass}
              style={{ cursor: this.props.onClick ? 'pointer' : '' }}
            >
              {this.props.label}
            </span>{' '}
            {this.props.warning && (
              <span>
                <Tooltip
                  id="error-tooltip"
                  placement="top"
                  title={this.props.warning}
                >
                  <Icons.AlertSolid
                    iconColor={theme.colors.alert.base}
                    iconSize="s"
                  />
                </Tooltip>{' '}
              </span>
            )}
            {this.props.danger && (
              <span>
                <Tooltip
                  id="error-tooltip"
                  placement="top"
                  title={this.props.danger}
                >
                  <Icons.ErrorSolid
                    iconColor={theme.colors.error.base}
                    iconSize="s"
                  />
                </Tooltip>{' '}
              </span>
            )}
            {this.props.validationErrors.length > 0 && (
              <span>
                <Tooltip
                  id="error-tooltip"
                  placement="top"
                  title={this.props.validationErrors.join(' ')}
                >
                  <Icons.ErrorSolid
                    iconColor={theme.colors.error.base}
                    iconSize="s"
                  />
                </Tooltip>{' '}
              </span>
            )}
            {this.renderOptionalIcons()}
          </FormLabel>
        </div>
        {this.props.rightNode && (
          <div className="pull-right">{this.props.rightNode}</div>
        )}
        <div className="clearfix" />
      </div>
    );
  }
}

ControlHeader.propTypes = propTypes;
ControlHeader.defaultProps = defaultProps;

export default withTheme(ControlHeader);
