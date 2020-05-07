const React = require("react");
import PropTypes from "prop-types";
const moment = require("moment");
const _ = require("underscore");
const numbro = require("numbro");
const counterpart = require("counterpart");

// test
// test noor

const getDeepValue = (item, key) => {
    if (item) {
        if (key === "_root") {
            return item;
        }
        const temp = key.split(".");
        if (temp.length === 1) {
            return item[temp[0]];
        }
        return getDeepValue(item[temp.shift()], temp.join("."));
    }
    return null;
};

import {Pagination} from "react-bootstrap";
import Checkbox from "./checkbox";

const Table = React.createClass({
    displayName: "Table",

    propTypes: {
        activePage: PropTypes.number,
        data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
        displayNumberOfResult: PropTypes.bool,
        filteredCount: PropTypes.number,
        goToPage: PropTypes.func,
        length: PropTypes.number,
        paginate: PropTypes.bool,
        primaryKey: PropTypes.string.isRequired,
        selectAll: React.PropTypes.bool,
        selectable: PropTypes.bool,
        sort: PropTypes.func,
        sortOrder: PropTypes.string,
        tableSortKey: PropTypes.string,
        toggleSelect: PropTypes.func,
        toggleSelectAll: PropTypes.func,
        totalCount: PropTypes.number
    },

    getInitialState() {
        return {
            primaryKey: {},
            selected: {},
            selectAll: false,
            sorting: {
                key: "",
                order: ""
            },
            pagination: {
                activePage: 1,
                length: 10
            }
        };
    },

    componentWillMount() {
        const primaryKey = this.props.primaryKey;
        const selected = {};
        _.each(this.props.data, (item) => {
            selected[item[primaryKey]] = false;
        });
        this.setState({
            selected,
            sorting: {
                key: this.props.tableSortKey || this.state.sorting.key,
                order: this.props.sortOrder || this.state.sorting.order
            }
        });
    },

    componentWillReceiveProps(nextProps) {
        if (_.isEqual(nextProps, this.props) === false) {
            const data = nextProps.data;
            let activePage = nextProps.activePage || this.state.pagination.activePage;

            const length = nextProps.length || this.state.pagination.length,
                pageNumber = Math.ceil((nextProps.filteredCount || data.length || _.keys(data).length) / length);

            if (pageNumber !== 0 && pageNumber < activePage) {
                activePage = pageNumber;
            }

            this.setState({
                data,
                selectAll: nextProps.selectAll,
                sorting: {
                    key: nextProps.tableSortKey || this.state.sorting.key,
                    order: nextProps.sortOrder || this.state.sorting.order
                },
                pagination: {
                    activePage,
                    length
                }
            });
        }
    },

    handleSelect(item) {
        const primaryKey = this.props.primaryKey;
        if (this.props.toggleSelect) {
            this.props.toggleSelect(item[primaryKey]);
        }
        else {
            const selected = this.state.selected;
            selected[item[primaryKey]] = !selected[item[primaryKey]];
            const selectedTrue = _.filter(_.values(selected), (value) => { return value === true; });
            const selectAll = selectedTrue.length === this.state.pagination.length;
            this.setState({selectAll, selected});
        }
    },

    toggleSelectAll() {
        if (this.props.toggleSelectAll) {
            this.props.toggleSelectAll();
        }
        else {
            let selectAll = this.state.selectAll;
            const primaryKey = this.props.primaryKey;
            const selected = this.state.selected;
            _.each(this.props.data, (item) => {
                selected[item[primaryKey]] = !selectAll;
            });
            selectAll = !selectAll;
            this.setState({
                selected,
                selectAll
            });
        }
    },

    sort(key, order) {
        if (this.props.sort) {
            this.props.sort(key, order);
        }
        this.setState({
            sorting: {
                key,
                order
            }
        });
    },

    handlePageChange(event) {
        if (this.props.goToPage) {
            this.props.goToPage(event);
        }
        else {
            this.setState({
                pagination: {
                    activePage: event,
                    length: this.state.pagination.length
                }
            });
        }
    },

    getRowClassName(item) {
        if (this.props.getRowClassName) {
            return this.props.getRowClassName(item);
        }
        return "";
    },

    render() {
        const primaryKey = this.props.primaryKey;
        const columns = this.props.children;
        const selected = this.state.selected;
        const selectAll = this.state.selectAll;
        let data = this.props.data;
        const dataLength = this.props.filteredCount || data.length || _.keys(data).length;
        if (!this.props.sort) {
            data = _.sortBy(data, (item) => getDeepValue(item, this.state.sorting.key));
            if (this.state.sorting.order === "desc") {
                data.reverse();
            }
        }
        let pageCount = 1;
        if (this.props.paginate) {
            const activePage = this.state.pagination.activePage;
            const pageDataLength = this.state.pagination.length;
            if (!this.props.goToPage) {
                const start = (activePage - 1) * pageDataLength;
                data = data.slice(start, start + pageDataLength);
            }
            pageCount = Math.ceil(dataLength / pageDataLength);
        }
        const results = this.props.filteredCount ? this.props.filteredCount : dataLength;
        const filtered = this.props.totalCount ? this.props.totalCount - this.props.filteredCount : dataLength;
        const html = counterpart("table.number_results", {results, filtered});

        return (
            <div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            {this.props.selectable && (
                                <th><Checkbox checked={selectAll} onChange={this.toggleSelectAll} /></th>
                            )}
                            {_.map(columns, (column, columnIdx) => {
                                return React.cloneElement(column, Object.assign({}, column.props, {
                                    key: columnIdx,
                                    sortOrder: this.state.sorting.order,
                                    sort: this.sort,
                                    tableSortKey: this.state.sorting.key,
                                    removeSort: this.props.removeSort
                                }));
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {(dataLength === 0) && (
                            <tr><td>{counterpart("table.no_records")}</td></tr>
                        )}
                        {_.map(data, (item, rowIdx) => {
                            return (
                                <tr className={this.getRowClassName(item)} key={rowIdx}>
                                    {this.props.selectable && (
                                        <td><Checkbox checked={item.selected === true || selected[item[primaryKey]] === true} onChange={this.handleSelect.bind(this, item)} /></td>
                                    )}
                                    {_.map(columns, (column, cellIdx) => {
                                        const cell = column.props.cell;
                                        const key = column.props.columnKey;
                                        const value = getDeepValue(item, key);
                                        if (typeof cell === "string") {
                                            return (
                                                <td key={cellIdx}>
                                                    {cell === "amount" && (
                                                        value === null ? "" : numbro(value).formatCurrency()
                                                    )}
                                                    {cell === "string" && (
                                                        value
                                                    )}
                                                    {cell === "date" && (
                                                        value === null ? "" : moment(value).format("L")
                                                    )}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={cellIdx}>
                                                {cell(getDeepValue(item, key))}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {this.props.paginate && (
                    <Pagination prev next first last ellipsis items={pageCount} activePage={this.state.pagination.activePage} onSelect={this.handlePageChange} maxButtons={5} />
                )}
                {this.props.displayNumberOfResult && (
                    <div className="shift-table-footer-info" dangerouslySetInnerHTML={{__html: html}}></div>
                )}
            </div>
        );
    }
});

module.exports = Table;
