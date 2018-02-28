import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Toolbox} from 'packages/components';

export default class LocaleSwitcher extends Component {
    static propTypes = {
        locale: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        options: [
            {key: 'en', value: 'en', flag: 'gb', label: 'English'},
        ],
    };

    render() {
        return (
            <span>
                <Toolbox.Dropdown
                    auto
                    source={this.state.options}
                    value={this.props.locale}
                    onChange={(e, {value}) => this.props.onChange(value)}
                />
            </span>
        );
    }
}
