/* *
 *
 *  (c) 2010-2021 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type { HTMLDOMElement } from '../Renderer/DOMElementType';
import type MapView from '../../Maps/MapView';
import type Options from '../Options';
import type SVGPath from '../Renderer/SVG/SVGPath';

import Chart from './Chart.js';
import D from '../Defaults.js';
const { getOptions } = D;
import SVGRenderer from '../Renderer/SVG/SVGRenderer.js';
import U from '../Utilities.js';
const {
    addEvent,
    fireEvent,
    merge,
    pick
} = U;
import '../../Maps/MapSymbols.js';
import type SeriesOptions from '../Series/SeriesOptions';
import MapPoint from '../../Series/Map/MapPoint';
import MapSeries from '../../Series/Map/MapSeries';
import type {
    AnimationOptions
} from '../../Core/Animation/AnimationOptions';
import A from '../../Core/Animation/AnimationUtilities.js';
const { animObject } = A;


declare module './ChartLike'{
    interface ChartLike {
        mapView?: MapView;
    }
}

/**
 * Map-optimized chart. Use {@link Highcharts.Chart|Chart} for common charts.
 *
 * @requires modules/map
 *
 * @class
 * @name Highcharts.MapChart
 * @extends Highcharts.Chart
 */
class MapChart extends Chart {
    /**
     * Initializes the chart. The constructor's arguments are passed on
     * directly.
     *
     * @function Highcharts.MapChart#init
     *
     * @param {Highcharts.Options} userOptions
     *        Custom options.
     *
     * @param {Function} [callback]
     *        Function to run when the chart has loaded and and all external
     *        images are loaded.
     *
     *
     * @emits Highcharts.MapChart#event:init
     * @emits Highcharts.MapChart#event:afterInit
     */
    public init(
        userOptions: Partial<Options>,
        callback?: Chart.CallbackFunction
    ): void {

        const defaultCreditsOptions = getOptions().credits;

        const options = merge(
            {
                chart: {
                    panning: {
                        enabled: true,
                        type: 'xy'
                    },
                    type: 'map'
                },
                credits: {
                    mapText: pick(
                        (defaultCreditsOptions as any).mapText,
                        ' \u00a9 <a href="{geojson.copyrightUrl}">' +
                            '{geojson.copyrightShort}</a>'
                    ),
                    mapTextFull: pick(
                        (defaultCreditsOptions as any).mapTextFull,
                        '{geojson.copyright}'
                    )
                },
                mapView: {}, // Required to enable Chart.mapView
                tooltip: {
                    followTouchMove: false
                }
            },
            userOptions // user's options
        );

        super.init(options, callback);
    }
}

/* eslint-disable valid-jsdoc */

namespace MapChart {
    /**
     * Contains all loaded map data for Highmaps.
     *
     * @requires modules/map
     *
     * @name Highcharts.maps
     * @type {Record<string,*>}
     */
    export const maps: AnyRecord = {};

    /**
     * The factory function for creating new map charts. Creates a new {@link
     * Highcharts.MapChart|MapChart} object with different default options than
     * the basic Chart.
     *
     * @requires modules/map
     *
     * @function Highcharts.mapChart
     *
     * @param {string|Highcharts.HTMLDOMElement} [renderTo]
     * The DOM element to render to, or its id.
     *
     * @param {Highcharts.Options} options
     * The chart options structure as described in the
     * [options reference](https://api.highcharts.com/highstock).
     *
     * @param {Highcharts.ChartCallbackFunction} [callback]
     * A function to execute when the chart object is finished loading and
     * rendering. In most cases the chart is built in one thread, but in
     * Internet Explorer version 8 or less the chart is sometimes initialized
     * before the document is ready, and in these cases the chart object will
     * not be finished synchronously. As a consequence, code that relies on the
     * newly built Chart object should always run in the callback. Defining a
     * [chart.events.load](https://api.highcharts.com/highstock/chart.events.load)
     * handler is equivalent.
     *
     * @return {Highcharts.MapChart}
     * The chart object.
     */
    export function mapChart(
        a: (string|HTMLDOMElement|Options),
        b?: (Chart.CallbackFunction|Options),
        c?: Chart.CallbackFunction
    ): MapChart {
        return new MapChart(a as any, b as any, c);
    }

    /**
     * Utility for reading SVG paths directly.
     *
     * @requires modules/map
     *
     * @function Highcharts.splitPath
     *
     * @param {string|Array<string|number>} path
     *
     * @return {Highcharts.SVGPathArray}
     * Splitted SVG path
     */
    export function splitPath(
        path: string|Array<string|number>
    ): SVGPath {
        let arr: Array<string|number>;

        if (typeof path === 'string') {
            path = path
                // Move letters apart
                .replace(/([A-Za-z])/g, ' $1 ')
                // Trim
                .replace(/^\s*/, '').replace(/\s*$/, '');

            // Split on spaces and commas. The semicolon is bogus, designed to
            // circumvent string replacement in the pre-v7 assembler that built
            // specific styled mode files.
            const split = path.split(/[ ,;]+/);

            arr = split.map((item): (number|string) => {
                if (!/[A-za-z]/.test(item)) {
                    return parseFloat(item);
                }
                return item;
            });
        } else {
            arr = path;
        }

        return SVGRenderer.prototype.pathToSegments(arr);
    }
}

addEvent(MapChart, 'addSeriesAsDrilldown', function (e): boolean {
    const chart = this,
        {
            point,
            options
        }: {
            point: MapPoint,
            options: SeriesOptions
        } = e as any;

    // stop hovering while drilling down
    point.series.isDrilling = true;
    // stop duplicating and overriding animations
    point.series.options.inactiveOtherPoints = true;

    if (
        chart.options.drilldown &&
        chart.options.drilldown.animation &&
        chart.options.drilldown.mapZooming &&
        chart.mapView
    ) {
        // hide and disable dataLabels
        if (point.series.dataLabelsGroup) {
            point.series.dataLabelsGroup.destroy();
            delete point.series.dataLabelsGroup;
        }

        // first zoomTo then crossfade series
        chart.mapView.allowTransformAnimation = true;

        const animOptions = animObject(chart.options.drilldown.animation);

        if (typeof animOptions !== 'boolean') {
            const userComplete = animOptions.complete,
                drilldownComplete = function (
                    obj?: { applyDrilldown?: boolean }): void {
                    if (obj && obj.applyDrilldown && chart.mapView) {
                        chart.addSingleSeriesAsDrilldown(point, options);
                        chart.applyDrilldown();
                        chart.mapView.allowTransformAnimation = false;
                    }
                };
            animOptions.complete =
                function (): void {
                    if (userComplete) {
                        userComplete.apply(this, arguments);
                    }
                    drilldownComplete.apply(this, arguments);
                };
        }

        point.zoomTo(animOptions);

    } else {
        return true;
    }
    return false; // to prevent default function from fireEvent
});

addEvent(MapChart, 'applyDrilldown', function (e): boolean {
    const chart = this;

    let drilldownLevels = this.drilldownLevels,
        levelToRemove: (number|undefined);

    if (drilldownLevels && drilldownLevels.length > 0) { // #3352, async loading
        levelToRemove = drilldownLevels[drilldownLevels.length - 1].levelNumber;
        (this.drilldownLevels as any).forEach(function (
            level: Highcharts.DrilldownLevelObject,
            i: Number
        ): void {

            if (
                chart.options.drilldown &&
                chart.options.drilldown.mapZooming
            ) {
                chart.redraw();
                if (chart.mapView) {
                    level.lowerSeries.isDrilling = false;
                    chart.mapView.fitToBounds(
                        (level.lowerSeries as MapSeries).bounds);
                    level.lowerSeries.isDrilling = true;
                }
            }

            if (level.levelNumber === levelToRemove) {
                level.levelSeries.forEach(function (series, j): void {
                    // Not removed, not added as part of a multi-series
                    // drilldown
                    if (
                        series.options &&
                        series.options._levelNumber === levelToRemove &&
                        series.group
                    ) {
                        let animOptions: boolean | Partial<AnimationOptions> | undefined = {};

                        if (chart.options.drilldown) {
                            animOptions = chart.options.drilldown.animation;
                        }

                        series.group.animate({
                            opacity: 0
                        },
                        animOptions,
                        function (): void {
                            series.remove(false);

                            // We have a reset zoom button. Hide it and detatch
                            // it from the chart. It is preserved to the layer
                            // config above.
                            if (chart.resetZoomButton) {
                                chart.resetZoomButton.hide();
                                delete chart.resetZoomButton;
                            }

                            chart.pointer.reset();

                            fireEvent(chart, 'afterDrilldown');

                            if (chart.mapView) {
                                chart.series.forEach((series): void => {
                                    series.isDirtyData = true;
                                    // series.isDrilling = false;
                                });
                                chart.mapView.setView(void 0, 1);
                            }
                            chart.series.forEach((series): void => {
                                series.isDrilling = false;
                            });
                            fireEvent(chart, 'afterApplyDrilldown');
                        });
                    }
                });
            }
        });
    }
    return false; // to prevent default function from fireEvent
});

// to prevent default function from fireEvent
addEvent(MapChart, 'midDrillUp', function (): boolean {
    return !(this instanceof MapChart);
});

addEvent(MapChart, 'finishDrillUp', function (e): boolean {
    const chart = this,
        {
            shouldAnimate,
            oldSeries,
            newSeries
        }: {
            shouldAnimate: boolean,
            oldSeries: MapSeries,
            newSeries: MapSeries
        } = e as any,
        zoomingDrill = chart.options.drilldown &&
            chart.options.drilldown.animation &&
            chart.options.drilldown.mapZooming;

    if (shouldAnimate) {
        oldSeries.remove(false);
    } else {
        // hide and disable dataLabels
        if (oldSeries.dataLabelsGroup) {
            oldSeries.dataLabelsGroup.destroy();
            delete oldSeries.dataLabelsGroup;
        }

        if (chart.mapView) {
            if (zoomingDrill) {
                // stop hovering while drilling down
                oldSeries.isDrilling = true;
                newSeries.isDrilling = true;
                chart.redraw(false);
                // Fit to previous bounds
                chart.mapView.fitToBounds(
                    (oldSeries as any).bounds,
                    void 0,
                    true,
                    false
                );
            }

            chart.mapView.allowTransformAnimation = true;

            fireEvent(chart, 'afterDrillUp', {
                seriesOptions: newSeries ? newSeries.userOptions : void 0
            });

            const removeMapSeries = (): void => {
                oldSeries.remove(false);
                chart.series.forEach((series): void => {
                    // ensures to redraw series to get correct colors
                    if (series.colorAxis) {
                        series.isDirtyData = true;
                    }
                    series.options.inactiveOtherPoints = false;
                });
                chart.redraw();
            };

            if (zoomingDrill) {
                // Fit to natural bounds
                chart.mapView.setView(void 0, 1, true, {
                    complete: function (): void {
                        // fire it only on complete in this place (once)
                        if (
                            Object.prototype.hasOwnProperty.call(
                                this,
                                'complete'
                            )
                        ) {
                            removeMapSeries();
                        }
                    }
                });
            } else {
                // When user don't want to zoom into region only fade out
                chart.mapView.allowTransformAnimation = false;
                if (oldSeries.group) {
                    oldSeries.group.animate({
                        opacity: 0
                    },
                    (chart.options.drilldown as any).animation,
                    function (): void {
                        removeMapSeries();
                        if (chart.mapView) {
                            chart.mapView.allowTransformAnimation = true;
                        }
                    });
                } else {
                    removeMapSeries();
                    chart.mapView.allowTransformAnimation = true;
                }
            }

            newSeries.isDrilling = false;
            if (chart.ddDupes) {
                chart.ddDupes.length = 0; // #3315
            } // #8324
            // Fire a once-off event after all series have been drilled up
            // (#5158)
            fireEvent(chart, 'drillupall');
        }
    }

    return false; // to prevent default function from fireEvent
});

/* *
 *
 *  Default Export
 *
 * */

export default MapChart;
