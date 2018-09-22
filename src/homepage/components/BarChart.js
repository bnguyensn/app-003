// @flow

import * as React from 'react';
import {select} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {axis, axisBottom, axisLeft} from 'd3-axis';
import {stack} from 'd3-shape';
import type {FundData, ColorData} from './DataTypes';
import {findMaxInArray} from '../lib/utils/arrayMaths';
import '../css/bar-chart.css';

type BarChartProps = {
    chartSize: {width: number, height: number},
    chartMargin: {top: number, right: number, bottom: number, left: number},
    barSize: number,
    data: FundData[],
    colorData: ColorData,
};

type BarChartStates = {
    scaleX: any,
    scaleY: any,
};

export default class BarChart extends React.PureComponent<BarChartProps, BarChartStates> {
    svgNodeRef: any;
    chartNodeRef: any;

    constructor(props: BarChartProps) {
        super(props);
        this.svgNodeRef = React.createRef();
        this.chartNodeRef = React.createRef();
        this.state = {
            scaleX: {},
            scaleY: {},
        };
    }

    componentDidMount() {
        this.updateChart();
    }

    componentDidUpdate() {
        // this.updateChart();
    }

    updateChart = () => {
        const {data, colorData, barSize, chartMargin, chartSize} = this.props;

        // Warning: specific to data type
        const assetsData = {};
        data[0].assets.forEach((asset) => {
            assetsData[asset.name] = {};
            assetsData[asset.name].lvl = asset.lvl;
            assetsData[asset.name].color = colorData[asset.lvl];
        });

        const chartNode = this.getChart();
        if (chartNode) {
            const chart = select(chartNode);

            // ********** Update scale ********** //

            const x = this.createScaleX();  // Band scale
            const y = this.createScaleY();  // Linear scale

            // ********** Update axes ********** //

            const xAxis = this.createAxisBottom(chart, x);
            const yAxis = this.createAxisLeft(chart, y);

            // ********** Update vertical bars ********** //

            const stackedSeries = this.createStackedSeries();

            // Series

            const seriesU = chart.selectAll('.series')
                .data(stackedSeries);
            const seriesE = seriesU.enter();
            const seriesUE = seriesE.append('g')
                .merge(seriesU);
            seriesU.exit().remove();

            seriesUE.attr('fill', d => assetsData[d.key].color);  // Colorise series

            // Individual rect

            const rectU = seriesUE.selectAll('rect')
                .data(d => d);
            const rectE = rectU.enter();
            const rectUE = rectE.append('rect')
                .merge(rectU);
            rectUE.exit().remove();

            const getRectHeight = (a, b) => y(y.domain()[1] - (b - a));
            const getRectY = (a, b) => y(a) - getRectHeight(a, b);

            rectUE.attr('width', x.bandwidth())
                .attr('height', d => getRectHeight(d[0], d[1]))
                .attr('x', d => x(d.data.name))
                .attr('y', d => getRectY(d[0], d[1]));

            // stackedBarUE.attr('transform', d => `translate(${x(d.data.name)}, ${y(d[1])})`);

            // Build bars - verbose
            /*const uBar = chart
                .selectAll('.chart-bar')
                .data(data);
            const eBar = uBar.enter();
            const ueBar = eBar.append('g')
                .merge(uBar);
            ueBar.attr('transform', (d, i) => `translate(${i * barGroupSize}, 0)`);
            ueBar.append('rect')
                .attr('class', 'chart-bar')
                .style('fill', '#29B6F6')
                .attr('y', d => y(d))
                .attr('height', d => chartSize.height - y(d))
                .attr('width', barSize);
            ueBar.append('text')
                .attr('x', barSize / 2)
                .attr('y', d => y(d))
                .text(d => d);
            const exBar = uBar.exit();
            exBar.remove();*/
        }
    };

    createScaleX = () => {
        const {data, chartSize} = this.props;

        const fundNames = data.map(fundData => fundData.name);

        // Using band scale for x
        return scaleBand()
            .domain(fundNames)
            .range([0, chartSize.width])
            .padding(0.05);
    };

    createScaleY = () => {
        const {data, chartSize} = this.props;

        // Warning: specific to data type
        const fCalRems = data.map(fundData => Math.min(fundData.fCom - fundData.fCal, 0));
        const totalAssetsReducer = (acc, curVal): number => acc + curVal.amt;
        const totalAssets = data.map(fundData => fundData.assets.reduce(totalAssetsReducer, 0));

        const dataMax = findMaxInArray([fCalRems, totalAssets]);

        // Using linear scale for y
        // y scale's range runs from negative to 0 because svg's coordinate
        // system runs from top left to bottom right
        return scaleLinear()
            .domain([0, dataMax])
            .nice()
            .range([chartSize.height, 0]);
    };

    // Note: band and point scales do not implement scale.ticks
    createAxisBottom = (chart: any, scale: any) => {
        const {chartSize} = this.props;

        const axis = axisBottom(scale);

        return chart.append('g')
            .attr('transform', `translate(0, ${chartSize.height})`)
            .call(axis);
    };

    createAxisLeft = (chart: any, scale: any) => {
        const axis = axisLeft(scale)
            .ticks(5, ',f');

        return chart.append('g')
            .call(axis);
    };

    createStackedSeries = () => {
        const {data} = this.props;

        // Create stack data - Warning: specific to data type
        const stackData = data.map((fundData) => {
            const fundObj = {};
            fundObj.name = fundData.name;
            fundData.assets.forEach((asset) => {
                fundObj[asset.name] = asset.amt;
            });
            return fundObj
        });

        // Create stack keys - Warning: specific to data type
        const anAssetsObj = data[0].assets;
        const compareFn = (a, b) => {
            if (a.lvl === b.lvl) {
                return a.name.localeCompare(b, 'en', {
                    sensitivity: 'base',
                    ignorePunctuation: true,
                    numeric: true,
                })
            }
            return a.lvl - b.lvl
        };
        anAssetsObj.sort(compareFn);
        const stackKeys = anAssetsObj.map(asset => asset.name);

        // Create stack generator
        const stackGen = stack()
            .keys(stackKeys);

        return stackGen(stackData)
    };

    getSvg = () => {
        if (this.svgNodeRef && this.svgNodeRef.current) {
            return this.svgNodeRef.current
        }
        return null
    };

    getChart = () => {
        if (this.chartNodeRef && this.chartNodeRef.current) {
            return this.chartNodeRef.current
        }
        return null
    };

    render() {
        const {chartSize, chartMargin} = this.props;

        return (
            <div className="chart-container">
                <svg ref={this.svgNodeRef}
                     width={chartSize.width + chartMargin.right + chartMargin.left}
                     height={chartSize.height + chartMargin.top + chartMargin.bottom}>
                    <g ref={this.chartNodeRef}
                       transform={`translate(${chartMargin.left}, ${chartMargin.top})`} />
                </svg>
            </div>
        )
    }
}
