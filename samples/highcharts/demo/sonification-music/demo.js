// Allow input tags in axis labels
Highcharts.AST.allowedTags.push('input');
Highcharts.AST.allowedTags.push('label');
Highcharts.AST.allowedAttributes.push('checked');

var masterVolume = 0.8;

// ------------------------------------------------------------------------
// Controls

// Mute/unmute an instrument without stopping play
function setInstrumentMute(targetSeriesIx, channels, mute) {
    channels.forEach(function (ch) {
        if (ch.events[0].relatedPoint.series.index === targetSeriesIx) {
            ch.engine.setMasterVolume(mute ? 0 : masterVolume);
        }
    });
}

// Called on chart render
function onRender() {
    var chart = this;

    // Chart play button
    document.getElementById('play').onclick = function () {
        chart.toggleSonify(true, function () {
            // Reset crosshair on end since we are animating it
            chart.series[0].xAxis.drawCrosshair(
                void 0, chart.series[0].points[0]
            );
            chart.series[0].xAxis.hideCrosshair();
        });
    };

    // Handle checkbox clicks for each instrument
    ['bass-on', 'chimes-on', 'shaker1-on', 'piano-on', 'flute-on',
        'synth-on', 'shaker2-on', 'pad-on', 'basspad-on'
    ].forEach(function (id, seriesIx) {
        document.getElementById(id).onclick = function () {
            var timeline = chart.sonification.timeline,
                muted = !this.checked;
            if (!timeline) {
                return;
            }
            setInstrumentMute(seriesIx, timeline.channels, muted);
            chart.series[seriesIx].setState(muted ? 'inactive' : 'normal');
        };
    });

    // Set plot border radius
    chart.plotBackground.attr('r', '9px');
}


// ------------------------------------------------------------------------
// Chart

// Convenience function to get y axis options, since we have 9 of them
function buildYAxisOpts(height, top, labelText, checkboxId, iconSrc) {
    return {
        height: height + '%', // Axis height
        top: top + '%', // Axis offset from top
        offset: 0,
        labels: {
            enabled: false
        },
        gridLineWidth: 0,
        title: {
            rotation: 0,
            offset: 70,
            useHTML: true,
            style: {
                width: 120
            },
            // Checkbox, icon and axis title combined here
            text: '<label class="hc-axis-title"><input id="' + checkboxId +
                '" type="checkbox" checked><img alt="" src="' +
                iconSrc + '" class="hc-axis-icon"> <span class="hc-axis-title-text">' +
                labelText + '</span></label>'
        }
    };
}

Highcharts.chart('container', {
    chart: {
        type: 'scatter',
        marginLeft: 150,
        events: {
            render: onRender
        },
        plotBackgroundColor: '#F5F5F5'
    },
    title: {
        text: 'Musical Chart',
        align: 'left',
        margin: 25,
        style: {
            fontSize: '1.4rem'
        }
    },
    subtitle: {
        text: 'Using the builtin Highcharts Synthesizer',
        align: 'left'
    },
    sonification: {
        duration: 14400,
        order: 'simultaneous',
        showCrosshairOnly: true,
        masterVolume: masterVolume,
        defaultInstrumentOptions: {
            // Only show for one track since we have some delayed tracks
            showPlayMarker: false
        }
    },
    data: {
        csv: document.getElementById('csv').textContent,
        complete: function (opts) {
            delete opts.xAxis;
            // Assign each series to their own y-axes
            opts.series.forEach(function (s, ix) {
                s.yAxis = ix;
            });
        }
    },
    legend: {
        enabled: false
    },
    tooltip: {
        enabled: false
    },
    xAxis: {
        crosshair: {
            enabled: true,
            width: 15,
            color: '#75A073',
            className: 'hc-crosshair'
        },
        visible: false,
        minPadding: 0.02
    },
    // Each series gets its own y axis
    yAxis: [
        buildYAxisOpts(
            9, 1, 'Bass', 'bass-on',
            'https://upload.wikimedia.org/wikipedia/commons/3/37/Papapishu-double-bass-1.svg'
        ),
        buildYAxisOpts(
            9, 11, 'Chimes', 'chimes-on',
            'https://upload.wikimedia.org/wikipedia/commons/e/ee/Bell_by_hatalar205.svg'
        ),
        buildYAxisOpts(
            5, 21, 'Shaker 1', 'shaker1-on',
            'https://upload.wikimedia.org/wikipedia/commons/a/a1/Maracas.svg'
        ),
        buildYAxisOpts(
            9, 27, 'Piano', 'piano-on',
            'https://upload.wikimedia.org/wikipedia/commons/5/50/Piano.svg'
        ),
        Highcharts.merge(
            buildYAxisOpts(
                26, 37, 'Flute', 'flute-on',
                'https://upload.wikimedia.org/wikipedia/commons/c/ce/Quena.svg'
            ), {
                plotBands: [{
                    from: -10,
                    to: 20,
                    color: '#404543'
                }],
                min: -1,
                max: 13
            }
        ),
        buildYAxisOpts(
            9, 64, 'Synth', 'synth-on',
            'https://upload.wikimedia.org/wikipedia/commons/9/99/Nuvola_apps_kcmmidi.svg'
        ),
        buildYAxisOpts(
            5, 74, 'Shaker 2', 'shaker2-on',
            'https://upload.wikimedia.org/wikipedia/commons/a/a1/Maracas.svg'
        ),
        buildYAxisOpts(
            9, 80, 'Pad', 'pad-on',
            'https://upload.wikimedia.org/wikipedia/commons/9/99/Nuvola_apps_kcmmidi.svg'
        ),
        buildYAxisOpts(
            9, 90, 'Bass Pad', 'basspad-on',
            'https://upload.wikimedia.org/wikipedia/commons/9/99/Nuvola_apps_kcmmidi.svg'
        )
    ],
    plotOptions: {
        series: {
            enableMouseTracking: false
        }
    },

    // Sonification mappings for each series
    // ----------------------------------------------------------------------
    series: [{
        // Bass
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'vibraphone',
                mapping: {
                    pitch: {
                        mapTo: 'y',
                        min: 'd2',
                        max: 'd3'
                    },
                    pan: 0,
                    volume: 0.4
                }
            }
        },
        color: 'transparent',
        marker: {
            symbol: 'circle',
            radius: 5,
            lineColor: '#508055',
            lineWidth: 3
        }
    }, {
        // Chimes
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'vibraphone',
                mapping: {
                    pitch: {
                        mapTo: 'y',
                        min: 'd5',
                        max: 'g6'
                    },
                    volume: 0.07,
                    pan: 0.95
                }
            },
            tracks: [{
                // Default
            }, {
                mapping: {
                    pitch: {
                        min: 'd6',
                        max: 'g7'
                    },
                    volume: 0.05,
                    playDelay: 11
                }
            }]
        },
        color: '#c0f090',
        marker: {
            symbol: 'diamond',
            radius: 4,
            lineColor: '#608060',
            lineWidth: 2
        }
    }, {
        // Shaker 1
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'shaker',
                mapping: {
                    volume: 0.25,
                    pan: -1
                }
            }
        },
        color: '#204020',
        marker: {
            symbol: 'square',
            radius: 3,
            lineColor: '#408050',
            lineWidth: 2
        }
    }, {
        // Piano
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'piano',
                mapping: {
                    pitch: {
                        mapTo: 'y',
                        min: 'd3',
                        max: 'e4'
                    },
                    highpass: {
                        frequency: 300
                    },
                    lowpass: {
                        frequency: 6000,
                        resonance: 9
                    },
                    pan: -1,
                    volume: 0.12
                }
            },
            tracks: [{
                // We use this track for play marker since it plays constantly
                showPlayMarker: true
            }, {
                // Delay
                mapping: {
                    volume: 0.05,
                    playDelay: 169
                }
            }, {
                // Plucked double comes in eventually
                instrument: 'plucked',
                mapping: {
                    lowpass: {
                        frequency: 5000
                    },
                    pitch: {
                        min: 'd3',
                        max: 'e4'
                    },
                    volume: 0.08,
                    pan: 1,
                    playDelay: -4
                },
                // This track comes in when x = 24
                activeWhen: {
                    prop: 'x',
                    min: 24
                }
            }]
        },
        type: 'spline',
        color: '#42b862',
        marker: {
            symbol: 'circle',
            radius: 3,
            lineColor: '#408050',
            lineWidth: 2
        }
    }, {
        // Flute
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'flute',
                mapping: {
                    pitch: {
                        mapTo: 'y',
                        min: 'd5',
                        max: 'd6'
                    },
                    pan: 0,
                    noteDuration: 280,
                    volume: 0.72,
                    playDelay: -2
                }
            },
            tracks: [{
                // Default
            }, {
                // Delay 1
                mapping: {
                    volume: 0.2,
                    playDelay: 169,
                    pan: -0.3,
                    highpass: {
                        frequency: 300
                    }
                }
            }, {
                // Delay 2
                mapping: {
                    volume: 0.12,
                    playDelay: 338,
                    pan: 0.3,
                    highpass: {
                        frequency: 600
                    },
                    lowpass: {
                        frequency: 7000
                    }
                }
            }, {
                // Delay 3
                mapping: {
                    volume: 0.05,
                    playDelay: 676,
                    pan: -0.3,
                    highpass: {
                        frequency: 800
                    },
                    lowpass: {
                        frequency: 4000
                    }
                }
            }]
        },
        type: 'spline',
        dashStyle: 'Solid',
        color: '#E5F6E5',
        lineWidth: 3,
        shadow: {
            color: '#cfe',
            offsetY: 5,
            width: 5
        },
        marker: {
            enabled: false
        }
    }, {
        // Synth
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'sawsynth',
                mapping: {
                    pitch: {
                        mapTo: 'y',
                        min: 'd4',
                        max: 'e5'
                    },
                    lowpass: {
                        frequency: 8000
                    },
                    highpass: {
                        frequency: 800
                    },
                    pan: {
                        mapTo: 'y',
                        within: 'series',
                        min: -1,
                        max: 1
                    },
                    volume: {
                        mapTo: 'y',
                        within: 'series',
                        min: 0.03,
                        max: 0.1
                    },
                    playDelay: 4
                }
            },
            tracks: [{
                // Default
            }, {
                // Negative delay
                mapping: {
                    playDelay: -338,
                    volume: 0.07,
                    pan: -1,
                    pitch: {
                        min: 'd5',
                        max: 'e6'
                    }
                }
            }, {
                // Delay
                mapping: {
                    playDelay: 169,
                    volume: 0.05,
                    pan: -0.5,
                    pitch: {
                        min: 'd5',
                        max: 'e6'
                    }
                }
            }]
        },
        type: 'spline',
        color: '#42b862',
        marker: {
            symbol: 'circle',
            radius: 3,
            lineColor: '#408050',
            lineWidth: 2
        }
    }, {
        // Shaker 2
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'step',
                mapping: {
                    volume: 1,
                    pan: 1,
                    highpass: {
                        frequency: 250
                    }
                }
            },
            tracks: [{
                // Default
            }, {
                instrument: 'shaker',
                mapping: {
                    volume: 0.05,
                    pan: -1
                }
            }]
        },
        color: '#204020',
        marker: {
            symbol: 'square',
            radius: 3,
            lineColor: '#408050',
            lineWidth: 2
        }
    }, {
        // Pad
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'triangle',
                mapping: {
                    pitch: {
                        mapTo: 'y',
                        min: 'd3',
                        max: 'd4'
                    },
                    noteDuration: 1350,
                    lowpass: {
                        frequency: 1000
                    },
                    pan: {
                        mapTo: 'y',
                        within: 'series',
                        min: 0,
                        max: 1
                    },
                    volume: {
                        mapTo: 'y',
                        within: 'series',
                        min: 0.03,
                        max: 0.08
                    }
                }
            },
            tracks: [{
                // Default
            }, {
                mapping: {
                    pitch: {
                        min: 'd2',
                        max: 'd3'
                    },
                    playDelay: 6,
                    pan: -1
                }
            }, {
                mapping: {
                    pitch: {
                        min: 'd4',
                        max: 'd5'
                    },
                    playDelay: 9
                }
            }]
        },
        type: 'spline',
        connectNulls: true,
        color: '#42b862',
        marker: {
            symbol: 'circle',
            radius: 3,
            lineColor: '#408050',
            lineWidth: 2
        }
    }, {
        // Bass pad
        sonification: {
            defaultInstrumentOptions: {
                instrument: 'triangle',
                mapping: {
                    pitch: {
                        mapTo: 'y',
                        min: 'd1',
                        max: 'd2'
                    },
                    volume: 0.15,
                    noteDuration: 1300,
                    lowpass: {
                        frequency: 500
                    },
                    tremolo: {
                        speed: 0.23,
                        depth: 0.1
                    },
                    pan: 0,
                    playDelay: 15
                }
            }
        },
        type: 'spline',
        connectNulls: true,
        color: '#327862',
        marker: {
            symbol: 'square',
            radius: 4,
            lineColor: '#408050',
            lineWidth: 2
        }
    }]
});
