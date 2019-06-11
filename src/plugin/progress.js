import React from 'react';

export default class extends React.PureComponent {

    static defaultProps = {
        percent: 0
    }

    render() {
        return <div className="progress">
            <div className="outer">
                <div className="inner">
                    <div className="bg" style={{ width: this.props.percent + "%" }}></div>
                </div>
            </div>
        </div>
    }
}