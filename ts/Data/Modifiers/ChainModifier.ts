/* *
 *
 *  (c) 2020-2022 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Sophie Bremer
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import DataModifier from './DataModifier.js';
import DataTable from '../DataTable.js';
import U from '../../Core/Utilities.js';
const { merge } = U;

/* *
 *
 *  Class
 *
 * */

/**
 * Modifies a table with the help of modifiers in an ordered chain.
 *
 * @private
 */
class ChainModifier extends DataModifier {

    /* *
     *
     *  Static Properties
     *
     * */

    /**
     * Default option for the ordered modifier chain.
     */
    public static readonly defaultOptions: ChainModifier.Options = {
        modifier: 'Chain',
        reverse: false
    };

    /* *
     *
     *  Constructors
     *
     * */

    /**
     * Constructs an instance of the modifier chain.
     *
     * @param {DeepPartial<ChainModifier.Options>} [options]
     * Options to configure the modifier chain.
     *
     * @param {...DataModifier} [modifiers]
     * Modifiers in order for the modifier chain.
     */
    public constructor(
        options?: DeepPartial<ChainModifier.Options>,
        ...modifiers: Array<DataModifier>
    ) {
        super();

        this.modifiers = modifiers;
        this.options = merge(ChainModifier.defaultOptions, options);
    }

    /* *
     *
     *  Properties
     *
     * */

    /**
     * Ordered modifiers.
     */
    public readonly modifiers: Array<DataModifier>;

    /**
     * Options of the modifier chain.
     */
    public readonly options: ChainModifier.Options;

    /* *
     *
     *  Functions
     *
     * */

    /**
     * Adds a configured modifier to the end of the modifier chain. Please note,
     * that the modifier can be added multiple times.
     *
     * @param {DataModifier} modifier
     * Configured modifier to add.
     */
    public add(modifier: DataModifier): void {
        this.modifiers.push(modifier);
    }

    /**
     * Clears all modifiers from the chain.
     */
    public clear(): void {
        this.modifiers.length = 0;
    }

    /**
     * Applies partial modifications of a cell change to the property `modified`
     * of the given modified table.
     *
     * *Note:* The `modified` property of the table gets replaced.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {string} columnName
     * Column name of changed cell.
     *
     * @param {number|undefined} rowIndex
     * Row index of changed cell.
     *
     * @param {Highcharts.DataTableCellType} cellValue
     * Changed cell value.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Highcharts.DataTable}
     * Table with `modified` property as a reference.
     */
    public modifyCell<T extends DataTable>(
        table: T,
        columnName: string,
        rowIndex: number,
        cellValue: DataTable.CellType
    ): T {
        const modifiers = (
            this.options.reverse ?
                this.modifiers.reverse() :
                this.modifiers
        );

        if (modifiers.length) {
            let clone = table.clone();

            for (let i = 0, iEnd = modifiers.length; i < iEnd; ++i) {
                modifiers[i].modifyCell(
                    clone,
                    columnName,
                    rowIndex,
                    cellValue
                );
                clone = clone.modified;
            }

            table.modified = clone;
        }

        return table;
    }

    /**
     * Applies partial modifications of column changes to the property
     * `modified` of the given table.
     *
     * *Note:* The `modified` property of the table gets replaced.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {Highcharts.DataTableColumnCollection} columns
     * Changed columns as a collection, where the keys are the column names.
     *
     * @param {number} [rowIndex=0]
     * Index of the first changed row.
     *
     * @return {Highcharts.DataTable}
     * Table with `modified` property as a reference.
     */
    public modifyColumns<T extends DataTable>(
        table: T,
        columns: DataTable.ColumnCollection,
        rowIndex: number
    ): T {
        const modifiers = (
            this.options.reverse ?
                this.modifiers.reverse() :
                this.modifiers.slice()
        );

        if (modifiers.length) {
            let clone = table.clone();

            for (let i = 0, iEnd = modifiers.length; i < iEnd; ++i) {
                modifiers[i].modifyColumns(
                    clone,
                    columns,
                    rowIndex
                );
                clone = clone.modified;
            }

            table.modified = clone;
        }

        return table;
    }

    /**
     * Applies partial modifications of row changes to the property `modified`
     * of the given table.
     *
     * *Note:* The `modified` property of the table gets replaced.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {Array<(Highcharts.DataTableRow|Highcharts.DataTableRowObject)>} rows
     * Changed rows.
     *
     * @param {number} [rowIndex]
     * Index of the first changed row.
     *
     * @return {Highcharts.DataTable}
     * Table with `modified` property as a reference.
     */
    public modifyRows<T extends DataTable>(
        table: T,
        rows: Array<(DataTable.Row|DataTable.RowObject)>,
        rowIndex: number
    ): T {
        const modifiers = (
            this.options.reverse ?
                this.modifiers.reverse() :
                this.modifiers.slice()
        );

        if (modifiers.length) {
            let clone = table.clone();

            for (let i = 0, iEnd = modifiers.length; i < iEnd; ++i) {
                modifiers[i].modifyRows(
                    clone,
                    rows,
                    rowIndex
                );
                clone = clone.modified;
            }

            table.modified = clone;
        }

        return table;
    }

    /**
     * Applies several modifications to the table.
     *
     * *Note:* The `modified` property of the table gets replaced.
     *
     * @param {DataTable} table
     * Table to modify.
     *
     * @return {DataTable}
     * Table as a reference.
     *
     * @emits ChainDataModifier#execute
     * @emits ChainDataModifier#afterExecute
     */
    public modifyTable<T extends DataTable>(table: T): T {
        const chain = this;

        const modifiers = (
            chain.options.reverse ?
                chain.modifiers.reverse() :
                chain.modifiers.slice()
        );

        let modified = table.modified;

        for (
            let i = 0,
                iEnd = modifiers.length,
                modifier: DataModifier;
            i < iEnd;
            ++i
        ) {
            modifier = modifiers[i];
            modified = modifier.modifyTable(modified).modified;
        }

        table.modified = modified;

        return table;
    }

    /**
     * Removes a configured modifier from all positions of the modifier chain.
     *
     * @param {DataModifier} modifier
     * Configured modifier to remove.
     *
     * @param {DataEventEmitter.EventDetail} [eventDetail]
     * Custom information for pending events.
     */
    public remove(modifier: DataModifier): void {
        const modifiers = this.modifiers;

        modifiers.splice(modifiers.indexOf(modifier), 1);
    }

}

/* *
 *
 *  Class Namespace
 *
 * */

/**
 * Additionally provided types for modifier options, and JSON conversion.
 */
namespace ChainModifier {

    /**
     * Options to configure the modifier.
     */
    export interface Options extends DataModifier.Options {
        /**
         * Whether to revert the order before execution.
         */
        reverse: boolean;
    }

}

/* *
 *
 *  Register
 *
 * */

DataModifier.addModifier(ChainModifier);

declare module './ModifierType' {
    interface ModifierTypeRegistry {
        Chain: typeof ChainModifier;
    }
}

/* *
 *
 *  Export
 *
 * */

export default ChainModifier;
