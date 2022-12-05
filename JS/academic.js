$(function () {
    var managementOfTablesAndFunctions = new ManagementOfTablesAndFunctions();
    managementOfTablesAndFunctions.init();
})

function ManagementOfTablesAndFunctions() {
    this.init = function() {
        loadLectureScheduleTable()
        filterByDate()
    }

    var lectureScheduleTable = null

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
        console.log(schedules)
        lectureScheduleTable = $('#lecturers-schedule-table').DataTable({
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
            select: true,
            select: {
                style: 'single'
            },
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
            var tables = $('.dataTable').DataTable();
            var lecturesScheduleTable = tables.table( 0 );

            var selectedValue = $('#category-filter').val()
            console.log(selectedValue)
            console.log(lecturesScheduleTable.rows(0).data())

            if (selectedValue == "") {
                lecturesScheduleTable.columns().search('').draw()

            }

            if (selectedValue == "3 Months") {
                var dates = ['2023-01','2023-02','2023-03']
                console.log(dates.join('|'))
                lecturesScheduleTable.columns(2).search(dates.join('|'),true,false,false).draw()

            }

            if (selectedValue == "6 Months") {
                var dates = ['2023-01','2023-02','2023-03','2023-04','2023-05','2023-06']
                console.log(dates.join('|'))
                lecturesScheduleTable.columns(2).search(dates.join('|'),true,false,false).draw()

            }

            if (selectedValue == "12 Months") {
                var dates = ['2023-01','2023-02','2023-03','2023-04','2023-05','2023-06','2023-07','2023-08','2023-09','2023-10','2023-11','2023-12']
                console.log(dates.join('|'))
                lecturesScheduleTable.columns(2).search(dates.join('|'),true,false,false).draw()

            }

        })
    }

    function logout() {
        $('.logout-link').on('click', function () {
            window.location.replace('https://stick-dream.bnr.la')
        })
    }

}

