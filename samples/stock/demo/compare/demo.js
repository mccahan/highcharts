const seriesOptions = [],
    names = ['MSFT', 'AAPL', 'GOOG'];
let seriesCounter = 0;

/**
 * Create the chart when all data is loaded
 * @return {undefined}
 */
function createChart() {

    Highcharts.stockChart('container', {

        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                format: '{#if (gt value 0)}+{/if}{value}%'
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}

function success(data) {
    const name = this.url.match(/(msft|aapl|goog)/)[0].toUpperCase();
    const i = names.indexOf(name);
    seriesOptions[i] = {
        name: name,
        data: data
    };

    // As we're loading the data asynchronously, we don't know what order it
    // will arrive. So we keep a counter and create the chart when all the data is loaded.
    seriesCounter += 1;

    if (seriesCounter === names.length) {
        createChart();
    }
}

Highcharts.getJSON(
    'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/msft-c.json',
    success
);
Highcharts.getJSON(
    'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/aapl-c.json',
    success
);
Highcharts.getJSON(
    'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/goog-c.json',
    success
);