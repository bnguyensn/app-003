// @flow

import * as React from 'react';
import Loadable from 'react-loadable';

import Loading from './components/Loading';
import Intro from './components/Intro';
/*import ControlPanel from './components/ControlPanel';
import Chart from './components/Chart';*/

import {filterData, sortData} from './lib/utils/dataMutation';

import type {FundData, ColorData} from './components/DataTypes';

import './app.css';

import sampleData from './json/sample-01';
import sampleColorData from './json/sample-colors-01';

const chartMargin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
};
const chartSize = {
    width: 640 - chartMargin.left - chartMargin.right,
    height: 640 - chartMargin.top - chartMargin.bottom,
    marginTop: 50,
    marginRight: 50,
    marginBottom: 50,
    marginLeft: 50,
};

type AppStates = {
    chartKey: boolean,  // Used to "reset" page elements on data upload
    data: FundData[],
    mutatedData: FundData[],
    colorData: ColorData,
    filterRange: {min: number, max: number},
}

const LoadableControlPanel = Loadable({
    loader: () => import('./components/ControlPanel'),
    loading: Loading,
});

const LoadableChart = Loadable({
    loader: () => import('./components/Chart'),
    loading: Loading,
});

export default class App extends React.PureComponent<{}, AppStates> {
    constructor(props: {}) {
        super(props);
        this.state = {
            chartKey: false,
            data: [...sampleData],
            mutatedData: [...sampleData],
            colorData: sampleColorData,
            filterRange: {min: 0, max: 1},
        };
    }

    componentDidMount() {
        // Fetch data
    }

    /**
     * Called when a new dataset is uploaded. This resets the chart element via
     * changing its "key" prop.
     * */
    setNewData = (data: FundData[], colorData: ColorData) => {
        this.setState((prevState: AppStates) => ({
            chartKey: !prevState.chartKey,
            data: [...data],
            mutatedData: [...data],
            colorData: {...colorData},
            filterRange: {min: 0, max: 1},
        }));
    };

    filterData = (min: number, max: number) => {
        const {data, mutatedData} = this.state;

        const nextMutatedData = filterData(data, mutatedData, min, max);

        if (nextMutatedData) {
            this.setState({
                mutatedData: [...nextMutatedData],
                filterRange: {min, max},
            });
        }
    };

    /**
     * When sorting data, we should sort the unfiltered data to prevent data
     * jumping around when filters are unset
     * */
    sortData = (sortKey: string) => {
        const {data, mutatedData, filterRange} = this.state;

        const sortedData = sortData(data, sortKey);

        if (sortedData) {
            const nextMutatedData = filterData(sortedData, mutatedData,
                filterRange.min, filterRange.max, true);

            this.setState(prevState => ({
                data: [...sortedData],
                mutatedData: nextMutatedData || prevState.mutatedData,
            }));
        }
    };

    render() {
        const {chartKey, mutatedData, colorData} = this.state;

        return (
            <div id="app">
                <Intro />
                <LoadableControlPanel key={`CP-${chartKey.toString()}`}
                              setNewData={this.setNewData}
                              filterData={this.filterData}
                              sortData={this.sortData} />
                <LoadableChart key={`Ch-${chartKey.toString()}`}
                       chartSize={chartSize}
                       data={mutatedData}
                       colorData={colorData} />
            </div>
        )
    }
}
