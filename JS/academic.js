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
                if (confirm === 'true') {
                } else {
                    window.location.replace('https://stick-dream.bnr.la')
                }
            },
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    this.init = function() {
        loadLectureScheduleTable()
        filterByDate()
        logout()
    }

    var lecturerScheduleTable = null

    function loadLectureScheduleTable () {
        $.ajax({

            type: "GET",
            url: '/api/lecturer/schedule',
            dataType: 'json',
            data: {'LecturerName': 'Cypress'},
            success: createLectureScheduleTable,
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    function createLectureScheduleTable(schedules, textStatus) {
        lecturerScheduleTable = $('#lecturers-schedule-table').DataTable({
            dom: 'Bfrtip',
            responsive: true,
            autoWidth: true,
            sScrollY: 600,
            language: {search: "", searchPlaceholder: "Search..."},
            data: schedules,
            dataSrc: schedules,
            processing: true,
            responsive: true,
            paging: false,
            fixedHeader: true,
            columns: [
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        return scheduleJson.SubjectCode
                    }},
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        return scheduleJson.SubjectName
                    }},
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        return scheduleJson.SubjectStartDate
                    }},
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        return scheduleJson.SubjectEndDate
                    }},
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        return scheduleJson.LecturersRole
                    }},
            ],
            rowCallback: function (row, data, index) {
                if (index % 2 == 0) {
                    $(row).removeClass('myodd myeven');
                    $(row).addClass('myodd');
                } else {
                    $(row).removeClass('myodd myeven');
                    $(row).addClass('myeven');
                }
            },
            columnDefs: [
                {targets: '_all', className: 'dt-left'}
            ],
            buttons: [
                {
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
                },
                {
                    extend: 'pdf',
                    text: 'Export as PDF'

                }
            ]
        })
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
            var startDate = date.getFullYear() + "-" + (date.getMonth()+1);
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
            window.location.replace('https://stick-dream.bnr.la')
        })
    }

}

