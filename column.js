const React = require("react");
import PropTypes from "prop-types";
import {Dropdown, Button} from "react-bootstrap";
const getUniqueId = require("@app/modules/utility").getUniqueId;
import DummyComponent from "@app/components/generic/common/dummy-component";

const Column = React.createClass({
    displayName: "Column",

    propTypes: {
        cell: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
        columnKey: PropTypes.string.isRequired,
        filter: PropTypes.object,
        filterable: PropTypes.bool,
        name: PropTypes.string.isRequired,
        sortKey: PropTypes.string,
        sortOrder: PropTypes.string,
        sortable: PropTypes.bool,
        tableSortKey: PropTypes.string
    },

    getInitialState() {
        return {
            action: 0,
            visible: false
        };
    },

    componentWillMount() {
        const sortKey = this.props.sortKey || this.props.columnKey;
        if (sortKey === this.props.tableSortKey) {
            if (this.props.sortOrder === "desc") {
                this.setState({action: 1});
            }
            else if (this.props.sortOrder === "asc") {
                this.setState({action: 2});
            }
        }
    },

    componentWillReceiveProps(nextProps) {
        const sortKey = this.props.sortKey || this.props.columnKey;
        if (nextProps.tableSortKey !== sortKey) {
            this.setState({action: 0});
        }
    },

    sort() {
        const sortKey = this.props.sortKey || this.props.columnKey;
        const action = (this.state.action + 1) % 3;
        this.setState({action});
        if (action === 1) {
            this.props.sort(sortKey, "desc");
        }
        else if (action === 2) {
            this.props.sort(sortKey, "asc");
        }
        else if (this.props.removeSort) {
            this.props.removeSort();
        }
    },

    toggleFilter(isOpen) {
        if (this.props.filterable) {
            this.setState({visible: isOpen});
        }
    },

    render() {
        const filter = this.props.filter;
        return (
            <th key={this.props.columnKey} ref="target" className="column-header">
                <Dropdown
                    className="column-button"
                    id={getUniqueId(this.props.columnKey)}
                    open={this.state.visible}
                    onToggle={this.toggleFilter}
                >
                    <Button
                        className="column-button-sort"
                        disabled={!this.props.sortable}
                        onClick={this.sort}
                    >
                        <div>
                            <span className="column-button-text">{this.props.name}</span>
                            <div className="sort-chevron">
                                {this.state.action === 0 && (
                                    <i className="fa fa-caret-down hidden-sort-button" aria-hidden="true" />
                                )}
                                {this.state.action === 1 && (
                                    <i className="fa fa-caret-down" aria-hidden="true" />
                                )}
                                {this.state.action === 2 && (
                                    <i className="fa fa-caret-up" aria-hidden="true" />
                                )}
                            </div>
                        </div>
                    </Button>
                    <Dropdown.Toggle noCaret className={`column-button-filter-toggle ${this.props.filterable ? "" : "disabled"}`}>
                        {this.props.filterable && (
                            <i className="fa fa-filter" aria-hidden="true" />
                        )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {this.props.filterable && filter && (
                            <DummyComponent>
                                {React.cloneElement(filter, Object.assign({}, filter.props, {toggle: this.toggleFilter}))}
                            </DummyComponent>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            </th>
        );
    }
});

module.exports = Column;
