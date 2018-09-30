// @flow

import * as React from 'react';

export default class SortChart extends React.PureComponent<{}, {}> {
    render() {
        return (
            <div id="cp-sort-chart" className="cp-section">
                <div className="cp-section-title">
                    SORT
                </div>
                <div className="cp-section-description">
                    Sort data by selecting an option below
                </div>
                <label htmlFor="sort-chart-select">
                    <select id="sort-chart-select">
                        <option value="name">Fund name</option>
                        <option value="goingconcern">Going concern</option>
                        <option value="fcalrem">Remaining calls from investments</option>
                        <option value="totalassets">Total assets</option>
                    </select>
                </label>
            </div>
        )
    }
}
