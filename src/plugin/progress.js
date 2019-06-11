import React from 'react';

export default class extends React.PureComponent {

    static defaultProps = {
        percent: 0
    }

    render() {
        return <div className="progress">
            <div className="inner" style={{ width: this.props.percent + "%" }}>
                <div className="bg"></div>
            </div>
            <div className="title">
                {this.props.children}
            </div>
        </div>
    }
}