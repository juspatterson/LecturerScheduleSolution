$(function () {
    var managementOfTablesAndFunctions = new ManagementOfTablesAndFunctions();
    managementOfTablesAndFunctions.confirmLogin()
    managementOfTablesAndFunctions.init();
})

function ManagementOfTablesAndFunctions() {
    this.confirmLogin = function () {
        $.ajax({
            type: "POST",
            url: '/api/login/confirm',
            dataType: '',
            data: {},
            success: function (confirm) {
                if (confirm === 'false') {
                  window.location.replace('/')
                }
            },
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    this.init = function() {
        logout()
        createLectureScheduleTable()
        filterByDate()


    }

    var lecturerScheduleTable = null

    function scheduleGetter(key) {
        return function(row) {
            let schedule = row.schedule;
            let scheduleJson = JSON.parse(schedule)
            return scheduleJson[key]
        }
    }

    function updateRowColour() {
        return function (row, data, index) {
            if (index % 2 == 0) {
                $(row).removeClass('myodd myeven');
                $(row).addClass('myodd');
            } else {
                $(row).removeClass('myodd myeven');
                $(row).addClass('myeven');
            }
        }
    }

    function createLectureScheduleTable() {
        lecturerScheduleTable = $('#lecturers-schedule-table').DataTable({
            ajax: {
                url: '/api/lecturer/schedule',
                dataSrc: ''
            },
            dom: 'Bfrtip',
            responsive: true,
            autoWidth: true,
            sScrollY: 600,
            language: {search: "", searchPlaceholder: "Search..."},
            processing: true,
            responsive: true,
            paging: false,
            fixedHeader: true,
            columns: [
                {'data': scheduleGetter('SubjectCode')},
                {'data': scheduleGetter('SubjectName')},
                {'data': scheduleGetter('SubjectStartDate')},
                {'data': scheduleGetter('SubjectEndDate')},
                {'data': scheduleGetter('LecturersRole')},
                {'data': scheduleGetter('LecturerLoad')}
            ],
            rowCallback: updateRowColour(),
            columnDefs: [
                {targets: '_all', className: 'dt-left'}
            ],
            buttons: [
                printButton(),
                {
                    extend: 'pdf',
                    text: 'Export as PDF'

                }
            ]

        })

        lecturerScheduleTable.on('xhr', function(event, settings, json, xhr) {
            if (json != null) {
                createGanttChart()
                //console.log(json)
            }

        })

        function printButton() {
            return {
                extend: 'print',
                text: 'Print',
                autoPrint: true,
                customize: function (win) {
                    $(win.document.body)
                        .css('font-size', '10pt')

                        .prepend(
                            '<img src="" style="position:absolute; top:0; left:0;" />'
                        );

                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                    $(win.document.body).find('h1').remove()
                    $(win.document.body).find('.dt-left').css('padding-left', '0px')

                }
            }
        }
    }

    function filterByDate() {
        $('#category-filter').on('change', function () {

            var selectedValue = $('#category-filter').val()
            let  threeMonths = createDateRangeForFilter(3)
            let  sixMonths = createDateRangeForFilter(6)
            let  twelveMonths = createDateRangeForFilter(12)

            switch (selectedValue) {
                case "":
                    lecturerScheduleTable.columns().search('').draw()
                    break
                case "3 Months":
                    lecturerScheduleTable.columns(2).search(threeMonths,true,false,false).draw()
                    break
                case "6 Months":
                    lecturerScheduleTable.columns(2).search(sixMonths,true,false,false).draw()
                    break
                case "12 Months":
                    lecturerScheduleTable.columns(2).search(twelveMonths,true,false,false).draw()
            }
        })

        function createDateRangeForFilter(numberOfMonths) {
            var date = new Date();
            var startDate = date.getFullYear() + "-" + leftPad((date.getMonth() + 1), 2);
            var year = date.getFullYear()
            var month = (date.getMonth()+1)
            var dateRange = [startDate]

            for (let i = 1; i < numberOfMonths; i++) {
                month = month + 1
                if (month === 13) {
                    month = month - 12
                    year = year + 1
                }
                dateRange.push(year + '-' + leftPad(month, 2))
            }
            return dateRange.join('|')
        }

        function leftPad(value, length) {
            return ('0'.repeat(length) + value).slice(-length);
        }
    }

    function logout() {
        $('.logout-link').on('click', function () {
          window.location.replace('/')
        })
    }

    function getScheduleDataObject(key, data) {
        let schedule = data.schedule;
        let scheduleJson = JSON.parse(schedule)
        return (scheduleJson[key])
    }

    function createGanttChart() {
        function drawChart() {
            var container = document.getElementById('chart_div');
            var chart = new google.visualization.Timeline(container);
            var dataTable = new google.visualization.DataTable();

            var colors = [];
            var colorMap = {
                // map of subject code -> color for every category
                CSE1ITX: '#FFFF00',
                CSE1PGX: '#F4B084',
                CSE1CFX: '#92D050',
                CSE1OFX: '#FF33CC',
                CSE1ISX: '#7030A0',
                CSE2NFX: '#00B0F0',
                CSE2NFX: '#FF0000',
                CSE1SPX: '#019900',
                CSE1SIX: '#92D050',
                CSE1IOX: '#003300',
                CSE2ICX: '#060d1a',
                CSE2CNX: '#800000',
                CSE2SDX: '#FFC000',
                BUS2PMX: '#FF99FF',
                CSE2VVX: '#CC0066',
                MAT2DMX: '#66CCFF',
                CSE2MAX: '#FFFF66',
                CSE2OSX: '#CCCC02',
                CSE2ADX: '#FF0000',
                CSE2CPX: '#00B04F',
                CSE2MLX: '#92D050',
                CSE2SAX: '#FF3300',
                CSE2ANX: '#CC0000',
                CSE2WDX: '#FFC000',
                CSE3BGX: '#FF0000',
                CSE3CIX: '#92D050',
                CSE3CSX: '#00B0F0',
                CSE3NWX: '#0070C0',
                CSE3OTX: '#7030A0',
                CSE3WSX: '#00B04F',
                CSE3PAX: '#C65911',
                CSE3PBX: '#B4C6E7',
                CSE3PEX: '#003300',
                CSE3ACX: '#FFC000',
                CSE3SOX: '#FF99FF',
                CSE3BDX: '#CC0000',
                CSE3BDX: '#FF33CC',
                CSE3PCX: '#CC0000',
                CSE3CAX: '#FF33CC',
                CSE3CBX: '#1F3764',
            }

            dataTable.addColumn({ type: 'string', id: 'SubjectName' });
            dataTable.addColumn({ type: 'string', id: 'subjectCode' });
            dataTable.addColumn({ type: 'string', id: 'subjectCode', role: 'style' });
            dataTable.addColumn({ type: 'date', id: 'Start' });
            dataTable.addColumn({ type: 'date', id: 'End' });


            let data = lecturerScheduleTable.data().toArray()


            function daysInMonth (month, year) {
                return new Date(year, month, 0).getDate();
            }




            data.forEach(function(schedule) {
                let subjectName = getScheduleDataObject('SubjectName', schedule)
                let startDate = getScheduleDataObject('SubjectStartDate', schedule).split('-')
                let endDate = getScheduleDataObject('SubjectEndDate', schedule).split('-')
                let role = getScheduleDataObject('LecturersRole', schedule)
                let load = getScheduleDataObject('LecturerLoad', schedule)
                let subjectCode = getScheduleDataObject('SubjectCode', schedule)

                //console.log(endDate)
                //console.log(parseInt(endDate[1]) - 1)

                dataTable.addRow( [
                        subjectCode + " - " + subjectName ,
                        'Role: ' + role  +'  /  Load: ' + load,
                        "color:" + colorMap[subjectCode] ,
                        new Date(parseInt(startDate[0]), parseInt(startDate[1]) - 1),
                        new Date(parseInt(endDate[0]), parseInt(endDate[1])),


                    ]
                )

            })

            dataTable.sort([{column: 3},{column: 4}]);


            console.log(lecturerScheduleTable.column(2).data().sort())
            let scheduleDates = lecturerScheduleTable.column(2).data().sort()

            let chartWidth = (scheduleDates.length * 250)

            if (chartWidth < 1143) {
                chartWidth = '100%'
            }

            let setEvenRowColor = ''
            let setOddRowColor = ''

            let setTextColor = ''
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {

                setEvenRowColor = '#29364D'
                setOddRowColor =  '#4B506A'
                setTextColor = '#FAFAFA'
            } else {
                setEvenRowColor = '#BDD9F2'
                setOddRowColor =  '#9FAFC7'
                setTextColor = '#000000'
            }

            var rowHeight = 50;
            var chartHeight = (dataTable.getNumberOfRows() + 1) * rowHeight;

            var observer = new MutationObserver(setBorderRadius);
            google.visualization.events.addListener(chart, 'ready', function () {
                setBorderRadius();
                observer.observe(container, {
                    childList: true,
                    subtree: true
                });

                //change h axis text colour
                var labels = container.getElementsByTagName('text');
                Array.prototype.forEach.call(labels, function(label) {
                    if (label.getAttribute('text-anchor') === 'middle') {
                        label.setAttribute('fill', setTextColor);
                    }
                })

            });

            function setBorderRadius() {
                Array.prototype.forEach.call(container.getElementsByTagName('rect'), function (rect, index) {
                    if (parseFloat(rect.getAttribute('x')) > 0) {
                        rect.setAttribute('rx', 10);
                        rect.setAttribute('ry', 10);
                    }
                });
            }

            google.visualization.events.addListener(chart, 'ready', function () {
                var rects = container.getElementsByTagName('rect');
                Array.prototype.forEach.call(rects, function(rect) {
                    // make sure rect is a background row
                    if ((rect.getAttribute('x') === '0') && (rect.getAttribute('stroke') === 'none')) {
                        // determine existing color
                        if (rect.getAttribute('fill') === '#ffffff') {
                            rect.setAttribute('fill', setOddRowColor);
                        } else {
                            rect.setAttribute('fill', setEvenRowColor);
                        }
                    }
                });
            });

            if (chartHeight > 723) {
                chartHeight = 723

            }

            var options = {
                timeline: {
                    colorByRowLabel: true,
                    showBarLabels: false,
                    groupByRowLabel: false,
                    rowLabelStyle: {
                        fontName: 'Nunito',
                        fontSize: 14,
                        color: setTextColor,
                        radius: 10

                    },
                    barLabelStyle: {
                        fontName: 'Nunito',
                        fontSize: 10,
                        color: setTextColor,
                        radius: 14,
                        height: 200
                    }
                },
                avoidOverlappingGridLines: true,
                height: chartHeight,
                width: chartWidth,
                tooltip: {isHtml: true},
            };

            var view = new google.visualization.DataView(dataTable);
            chart.draw(view, options);
        }
        google.load('visualization', '1', {packages:['timeline'], callback: drawChart});
    }
}
