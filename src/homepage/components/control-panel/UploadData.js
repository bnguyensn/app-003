// @flow

import * as React from 'react';

import {isFileOfType} from '../../lib/utils/validation';
import processXlsx from '../../lib/utils/xlsx/processXlsx';
import {
    createAssetColorData,
    createAssetLvlColorData,
} from '../../lib/utils/xlsx/createColorData';

import type {FundData} from '../DataTypes';

const DEBUG = true;  // TODO: remove in production

type UploadDataProps = {
    logStatusMsg: (msg: string) => void,
    setNewData: (data: FundData[]) => void,
};

type UploadDataStates = {
    statusMsg: string,
};

export default class UploadData extends React.PureComponent<UploadDataProps, {}> {
    fileTypes: string[];

    constructor(props: UploadDataProps) {
        super(props);
        this.fileTypes = [
            'application/vnd.ms-excel',  // .csv, .xls
            'application/vnd.ms-excel.sheet.binary.macroEnabled.12',  // .xlsb
            'application/vnd.ms-excel.sheet.macroEnabled.12',  // .xlsm
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  // .xlsx
        ];

        this.state = {
            statusMsg: 'Ready to get new data.',
        }
    }

    handleFileSelected = (e: SyntheticInputEvent<HTMLElement>) => {
        const {logStatusMsg, setNewData} = this.props;

        const {files} = e.target;
        const f = files[0];

        if (files.length === 0) {
            if (DEBUG) console.log('No files selected');
        } else {
            if (DEBUG) {
                console.log(`Selected file's name is ${f.name}`);
                console.log(`Selected file's size is ${(f.size / 1024).toFixed(0)} kb`);
                console.log(`Selected file is of type ${f.type}`);
            }

            if (isFileOfType(f, this.fileTypes)) {
                // Set up FileReader
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = e.target.result;

                    const processRes = processXlsx(data);

                    if (!processRes.success) {
                        // Error parsing uploaded data

                        logStatusMsg(processRes.data);

                        // this.setStatusMsg('Error parsing data. Please revise and re-upload.');
                    } else {
                        // Successfully parsed uploaded data

                        if (DEBUG) {
                            console.log('Successfully read .xlsx. Result:');
                            console.log(processRes.data);
                            // console.log(JSON.stringify(processRes.data));
                        }

                        // Update color data using a sample fund data

                        const assetLvlsObj = processRes.data[0].assets
                            .reduce((acc, curVal) => {
                                if (acc[curVal.lvl] === undefined) {
                                    acc[curVal.lvl] = curVal.lvl;
                                }
                                return acc
                            }, {});
                        const colorDataAssetLvls = createAssetLvlColorData(
                            Object.values(assetLvlsObj),
                        );

                        const colorDataAssets = createAssetColorData(
                            processRes.data[0].assets,
                            colorDataAssetLvls,
                        );

                        const colorData = {
                            assets: colorDataAssets,
                            assetLvls: colorDataAssetLvls,
                        };

                        if (DEBUG) {
                            console.log(JSON.stringify(colorData));
                        }

                        // Update fund data

                        setNewData(processRes.data, colorData);

                        // this.setStatusMsg('Data parsed successfully. Ready to get new data');
                    }
                };

                // Read xlsx
                reader.readAsArrayBuffer(f);

                // this.setStatusMsg('Parsing data...');
            }
        }
    };

    setStatusMsg = (msg: string) => {
        this.setState({
            statusMsg: msg,
        })
    };

    render() {
        console.log('rendering upload data');

        const {statusMsg} = this.state;

        return (
            <div id="cp-upload" className="cp-subsection-960">
                <div className="title">
                    PROVIDE DATA
                </div>
                <div className="description">
                    <b>Note:</b> selected file is <b>not</b> uploaded anywhere.{' '}
                    The application parses data locally using your browser.
                </div>
                <div className="cp-upload-btn-container">
                    <label className="cp-upload-btn" htmlFor="cp-uploader">
                        <span>SELECT FILE</span>
                        <input id="cp-uploader"
                               type="file"
                               accept=".xlsx, .xls, .xlsb, .xlsm, .csv"
                               onChange={this.handleFileSelected} />
                    </label>
                </div>
                {/*<div className="cp-upload-status">
                    {statusMsg}
                </div>*/}
            </div>
        )
    }
}
