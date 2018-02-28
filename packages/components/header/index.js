// Main header with logo and sign up links
import React, {Component} from 'react';
import {Toolbox} from 'packages/components';
import {Link} from 'react-router-dom';

export default class Header extends Component {
    static propTypes = {
        // className: PropTypes.string,
        // // Current locale
        // locale: PropTypes.string,
        // // User profile
        // profile: PropTypes.object,
    };

    render() {
        return (
            <Toolbox.AppBar title="Product Name" leftIcon="menu" />
        );
    }
}
