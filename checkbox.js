import React from "react";
import PropTypes from "prop-types";

class Checkbox extends React.PureComponent {
    constructor(props) {
        super(props);

        this.onChange = (event) => this.props.onChange && this.props.onChange(event);
    }

    render() {
        const {children, ...props} = this.props;

        return (
            <label className="shift-checkbox checkbox">
                <input type="checkbox" {...props}
                    onChange={this.onChange} />
                <span className="shift-checkbox-indicator" />
                <span className="shift-checkbox-label">
                    {children}
                </span>
            </label>
        );
    }
}

Checkbox.displayName = "Checkbox";
Checkbox.propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func
};

export default Checkbox;
