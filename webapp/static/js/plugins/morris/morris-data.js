// Morris.js Charts sample data for SB Admin template

$(function() {

    // Area Chart
    Morris.Area({
        element: 'morris-area-chart',
        data: [{
            period: '2015-06-01',
            patients: 35,
            delivered: 20,
            critical: 10,
            referred: 5
        }, {
            period: '2015-06-02',
            patients: 42,
            delivered: 23,
            critical: 15,
            referred: 4
        }, {
            period: '2015-06-03',
            patients: 33,
            delivered: 20,
            critical: 3,
            referred: 10
        }, {
            period: '2015-06-04',
            patients: 38,
            delivered: 29,
            critical: 5,
            referred: 4
        }, {
            period: '2015-06-05',
            patients: 41,
            delivered: 32,
            critical: 1,
            referred: 8
        }, {
            period: '2015-06-06',
            patients: 46,
            delivered: 29,
            critical: 10,
            referred: 7
        }, {
            period: '2015-06-07',
            patients: 43,
            delivered: 40,
            critical: 1,
            referred: 2
        }, {
            period: '2015-06-08',
            patients: 44,
            delivered: 34,
            critical: 5,
            referred: 5
        }],
        xkey: 'period',
        ykeys: ['patients', 'delivered', 'critical', 'referred'],
        labels: ['Patients Registered', 'Successfully Delivered', 'Under Critical Scrutiny', 'Referred to Higher Hospital'],
        pointSize: 2,
        xLabelFormat: function(x){
            return new Date(x).toString().slice(8,10) + ' ' + new Date(x).toString().slice(4,7);
        },
        behaveLikeLine : true,
        parseTime : true,   
        hideHover: 'auto',
        resize: true
    });

    // Donut Chart
    // Morris.Donut({
    //     element: 'morris-donut-chart',
    //     data: [{
    //         label: "Download Sales",
    //         value: 12
    //     }, {
    //         label: "In-Store Sales",
    //         value: 30
    //     }, {
    //         label: "Mail-Order Sales",
    //         value: 20
    //     }],
    //     resize: true
    // });

    // // Line Chart
    // Morris.Line({
    //     // ID of the element in which to draw the chart.
    //     element: 'morris-line-chart',
    //     // Chart data records -- each entry in this array corresponds to a point on
    //     // the chart.
    //     data: [{
    //         d: '2012-10-01',
    //         visits: 802
    //     }, {
    //         d: '2012-10-02',
    //         visits: 783
    //     }, {
    //         d: '2012-10-03',
    //         visits: 820
    //     }, {
    //         d: '2012-10-04',
    //         visits: 839
    //     }, {
    //         d: '2012-10-05',
    //         visits: 792
    //     }, {
    //         d: '2012-10-06',
    //         visits: 859
    //     }, {
    //         d: '2012-10-07',
    //         visits: 790
    //     }, {
    //         d: '2012-10-08',
    //         visits: 1680
    //     }, {
    //         d: '2012-10-09',
    //         visits: 1592
    //     }, {
    //         d: '2012-10-10',
    //         visits: 1420
    //     }, {
    //         d: '2012-10-11',
    //         visits: 882
    //     }, {
    //         d: '2012-10-12',
    //         visits: 889
    //     }, {
    //         d: '2012-10-13',
    //         visits: 819
    //     }, {
    //         d: '2012-10-14',
    //         visits: 849
    //     }, {
    //         d: '2012-10-15',
    //         visits: 870
    //     }, {
    //         d: '2012-10-16',
    //         visits: 1063
    //     }, {
    //         d: '2012-10-17',
    //         visits: 1192
    //     }, {
    //         d: '2012-10-18',
    //         visits: 1224
    //     }, {
    //         d: '2012-10-19',
    //         visits: 1329
    //     }, {
    //         d: '2012-10-20',
    //         visits: 1329
    //     }, {
    //         d: '2012-10-21',
    //         visits: 1239
    //     }, {
    //         d: '2012-10-22',
    //         visits: 1190
    //     }, {
    //         d: '2012-10-23',
    //         visits: 1312
    //     }, {
    //         d: '2012-10-24',
    //         visits: 1293
    //     }, {
    //         d: '2012-10-25',
    //         visits: 1283
    //     }, {
    //         d: '2012-10-26',
    //         visits: 1248
    //     }, {
    //         d: '2012-10-27',
    //         visits: 1323
    //     }, {
    //         d: '2012-10-28',
    //         visits: 1390
    //     }, {
    //         d: '2012-10-29',
    //         visits: 1420
    //     }, {
    //         d: '2012-10-30',
    //         visits: 1529
    //     }, {
    //         d: '2012-10-31',
    //         visits: 1892
    //     }, ],
    //     // The name of the data record attribute that contains x-visitss.
    //     xkey: 'd',
    //     // A list of names of data record attributes that contain y-visitss.
    //     ykeys: ['visits'],
    //     // Labels for the ykeys -- will be displayed when you hover over the
    //     // chart.
    //     labels: ['Visits'],
    //     // Disables line smoothing
    //     smooth: false,
    //     resize: true
    // });

    // // Bar Chart
    // Morris.Bar({
    //     element: 'morris-bar-chart',
    //     data: [{
    //         device: 'iPhone',
    //         geekbench: 136
    //     }, {
    //         device: 'iPhone 3G',
    //         geekbench: 137
    //     }, {
    //         device: 'iPhone 3GS',
    //         geekbench: 275
    //     }, {
    //         device: 'iPhone 4',
    //         geekbench: 380
    //     }, {
    //         device: 'iPhone 4S',
    //         geekbench: 655
    //     }, {
    //         device: 'iPhone 5',
    //         geekbench: 1571
    //     }],
    //     xkey: 'device',
    //     ykeys: ['geekbench'],
    //     labels: ['Geekbench'],
    //     barRatio: 0.4,
    //     xLabelAngle: 35,
    //     hideHover: 'auto',
    //     resize: true
    // });


});
