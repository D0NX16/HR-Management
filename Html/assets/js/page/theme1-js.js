
$(function() {
    "use strict";

    // SALARY STATISTICS
    var options = {
        series: [{
            name: 'Design',
            data: [58, 55, 57, 56, 61, 58, 63, 60, 66, 80, 54, 67]
        }, {
            name: 'Development',
            data: [76, 85, 70, 98, 87, 105, 91, 110, 94, 98, 65, 52]
        }, {
            name: 'Marketing',
            data: [62, 61, 56, 86, 65, 78, 107, 85, 84, 87, 85, 70]
        }],
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false,
            },
        },
        colors: ['#3d78e3', '#29badb', '#2d6187'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '65%',
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            labels: {
                style: {
                    colors: ['var(--text-body)'],
                    fontSize: '12px',
                    fontFamily: 'var(--font-family)',
                }
            }
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            show: true,
            fontSize: '14px',
            fontFamily: 'var(--font-family)',
            markers: {
                width: 12,
                height: 12,
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            },
            labels: {
                colors: 'var(--text-body)',
                useSeriesColors: false
            },
        },
        fill: {
            opacity: 1
        },
        yaxis: {
            labels: {
                style: {
                    colors: ['var(--text-body)'],
                    fontSize: '12px',
                    fontFamily: 'var(--font-family)',
                },
                formatter: (val) => {
                    return '$' + val
                }
            }
        },
        tooltip: {
            y: [{
                title: {
                    formatter: function(val) {
                        return "$ " + val + " thousands"
                    }
                }
            }]
        },
    };
    var chart = new ApexCharts(document.querySelector("#chart-bar-theme1"), options);
    chart.render();

    // Sales Revenue
    $('.theme1-chart_3').sparkline('html', {
        type: 'bar',
        height: '57px',
        barSpacing: 8,
        barWidth: 10,
        barColor: '#878A99',        
    });

    // Employee Structure
    var chart = c3.generate({
        bindto: '#chart-bar-stacked', // id of chart wrapper
        data: {
            columns: [
                // each columns data
                ['data1', 11, 8, 15, 18, 19, 17,34,23],
                ['data2', 7, 7, 5, 7, 9, 12,22,12]
            ],
            type: 'bar', // default type of chart
            groups: [
                [ 'data1', 'data2']
            ],
            colors: {
                'data1': '#3d78e3',
                'data2': '#2d6187',
            },
            names: {
                // name of each serie
                'data1': 'Male',
                'data2': 'Female'
            }
        },
        axis: {
            x: {
                type: 'category',
                // name of each category
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug']
            },
        },
        bar: {
            width: 14
        },
        legend: {
            show: false, //hide legend
        },
        padding: {
            bottom: -20,
            top: 0,
            left: -6,
        },
    });
    // GROWTH
    var chart = c3.generate({
        bindto: '#GROWTH', // id of chart wrapper
        data: {
            columns: [
                // each columns data
                ['data1', 65],
                ['data2', 35]
                ],
                type: 'donut', // default type of chart
                colors: {
                    'data1': '#2d6187',
                    'data2': '#67b173',
                },
                names: {
                    // name of each serie
                    'data1': 'Last Year',
                    'data2': 'This Year'
                }
            },
            axis: {
            },
            legend: {
                show: false, //hide legend
            },
            padding: {
                bottom: 20,
                top: 0
            },
    });

});

// sparklines
$(document).ready(function() {
   
    var randomizeArray = function (arg) {
        var array = arg.slice();
        var currentIndex = array.length,
        temporaryValue, randomIndex;
  
        while (0 !== currentIndex) {  
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
    
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }  
        return array;
    }

    // data for the sparklines that appear below header area
    var sparklineData = [47, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46];

    // topb big chart    
    var spark1 = {
        chart: {
            type: 'area',
            height: 108,
            sparkline: {
            enabled: true
            },
        },
        stroke: {
            width: 2
        },
        series: [{
            data: randomizeArray(sparklineData)
        }],
        colors: ['#2d6187'],
    }
    var spark1 = new ApexCharts(document.querySelector("#theme-apexspark1"), spark1);
    spark1.render();    
});
