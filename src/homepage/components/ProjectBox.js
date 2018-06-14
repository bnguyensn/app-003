/**
 * ProjectBox
 *
 * This is created for /projects.
 *
 * ProjectBox normally shows the minified content, but can be expanded to show
 * the full content on click / tap.
 *
 * Contents are saved in JSON schema
 * */

// @flow

import * as React from 'react';

import getRandNumBtw from '../lib/utils/getRandNumBtw';

import '../css/project-box.css';

type Props = {
    content: {
        key: string,  // This is the alphabet character that identifies the
                      // ProjectBox
        title: string,
        logo: {
            src: string,
            alt?: string
        },
        description: string
    },
}

type State = {
    clicked: boolean
}

class ProjectBox extends React.PureComponent<Props, State> {
    static defaultProps = {
        content: {
            logo: {
                alt: ''
            }
        }
    };

    constructor(props) {
        super(props);
        this.bkgColorData = {
            init: '#E0E0E0',
            range: [
                '#e57373',
                '#F06292',
                '#BA68C8',
                '#9575CD',
                '#7986CB',
                '#64B5F6',
                '#4FC3F7',
                '#4DD0E1',
                '#4DB6AC',
                '#81C784',
            ]
        };
        this.state = {
            clicked: false,
            bkgColor: this.bkgColorData[0],
        }
    }

    handleClick = () => {
        this.setState((prevState, props) => ({
            clicked: !prevState.clicked,
            bkgColor: !prevState.clicked ?
                      this.bkgColorData.init :
                      this.bkgColorData.range[Math.floor(getRandNumBtw(0, this.bkgColorData.range.length))]
        }));
    };

    handleKeyPress = (e: SyntheticKeyboardEvent) => {
        if (e.keyCode === 13) {
            this.handleClick();
        }
    };

    render() {
        return (
            <div className="pb">
                <div className="pb-container"
                     style={{
                         backgroundColor: this.state.bkgColor
                     }}
                     onClick={this.handleClick}
                     onKeyPress={this.handleKeyPress}
                     role="button"
                     tabIndex={0}>

                    <img className="pb-logo" src={this.props.content.logo.src} alt={this.props.content.logo.alt} />

                </div>
            </div>
        )
    }
}

export default ProjectBox