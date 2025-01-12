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
describe('Annotations', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '/explore_json/**').as('getJson');
    cy.intercept('POST', '/explore_json/**').as('postJson');
  });

  it('Create formula annotation y-axis goal line', () => {
    cy.visitChartByName('Num Births Trend');
    cy.verifySliceSuccess({ waitAlias: '@postJson' });

    const layerLabel = 'Goal line';

    cy.get('[data-test=annotation_layers]').click();

    cy.get('[data-test="popover-content"]').within(() => {
      cy.get('[aria-label=Name]').type(layerLabel);
      cy.get('[aria-label=Formula]').type('y=1400000');
      cy.get('button').contains('OK').click();
    });

    cy.get('button[data-test="run-query-button"]').click();
    cy.get('[data-test=annotation_layers]').contains(layerLabel);

    cy.verifySliceSuccess({
      waitAlias: '@postJson',
      chartSelector: 'svg',
    });
    cy.get('.nv-legend-text').should('have.length', 2);
  });
});
