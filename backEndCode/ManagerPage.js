$(function () {
    var managementOfTablesAndFunctions = new ManagementOfTablesAndFunctions();
    managementOfTablesAndFunctions.init();


})

function ManagementOfTablesAndFunctions(tables1) {

    this.init = function () {
        loadInstanceTable()
        loadLecturesTable()
        loadScheduleTable()

        $('#instances-table, #lectures-table').on('click', 'tr', function () {
            filterOnSelectedRow()
        })

        createScheduleAndAddToScheduleTable()
    }

    function loadInstanceTable() {
        $.ajax({

            type: "GET",
            //async: false,
            url: '../MockUpData/SubjectsTimeTable.json',
            dataType: 'json',
            data: '{}',
            success: function (subjectsTimeTable, textStatus) {


                $('#instances-table').DataTable({
                    autoWidth: true,
                    language: { search: "",searchPlaceholder: "Search..." },
                    sScrollY: '80vh',
                    sScrollX: '40vh',
                    //scrollCollapse: true,
                    data: subjectsTimeTable.instances,
                    dataSrc: subjectsTimeTable.instances,
                    serverSide: false,
                    processing: true,
                    responsive: true,
                    paging: false,
                    fixedHeader: true,
                    select: true,
                    columns: [
                        {'data': 'SubjectCode'},
                        {'data': 'SubjectName'},
                        {'data': 'StartDate'},
                        {'data': 'EndDate'},
                        {'data': 'Load'}
                    ],
                    stateSave: true,
                });

            },
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    function loadLecturesTable() {
        $.ajax({

            type: "GET",
            url: '../MockUpData/lecturerSME.json',
            dataType: 'json',
            data: '{}',
            success: function (lectureInformation, textStatus) {
                var table = $('#lectures-table').DataTable({
                    autoWidth: true,
                    sScrollY: '80vh',
                    language: { search: "",searchPlaceholder: "Search..." },
                    data: lectureInformation.lectures,
                    dataSrc: lectureInformation.lectures,
                    serverSide: false,
                    processing: true,
                    responsive: true,
                    paging: false,
                    fixedHeader: true,
                    select: true,

                    columns: [
                        {'data': 'name'},
                        {'data': 'load'},
                        {
                            'data': "subjectsLecturerCanTeach.subjectsCode",
                            "visible": false
                        }
                    ]
                });



            },
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    function loadScheduleTable() {
        var table = $('#schedule-table').DataTable({
            dom: 'Bfrtip',
            responsive: true,
            autoWidth: true,
            sScrollY: '80vh',
            language: {search: "", searchPlaceholder: "Search..."},
            //data:
            //dataSrc:
            serverSide: false,
            processing: true,
            responsive: true,
            paging: false,
            fixedHeader: true,
            select: true,
            buttons: [
                {
                    text: "Delete",
                    action: function ( e, dt, node, config ) {
                        if (window.confirm("Click OK to delete Schedule")) {
                            table
                                .rows( '.selected' )
                                .remove()
                                .draw();
                        }
                    }
                },
                {
                    text: "Edit",
                    action: function ( e, dt, node, config ) {
                        if (window.confirm("Click OK to Edit Schedule")) {
                            // table
                            //     .rows( '.selected' )
                            //     .remove()
                            //     .draw();
                        }
                    }
                }
            ]
        })
    }

    function filterOnSelectedRow() {
        var tables = $('.dataTable').DataTable();
        var instancesTable = tables.table( 0 );
        var lectureTable = tables.table( 1 );

        selectedRowFromInstancesTable()
        selectedRowFromLecturersTable()

        var instancesSelectedData =  $('#instances-selected-data').data()
        var lecturersSelectedData =  $('#lecturers-selected-data').data()

        function selectedRowFromInstancesTable() {
            instancesTable
                .on('select', function (e, dt, type, indexes) {
                    var rowData = instancesTable.rows({ selected: true}).data().toArray();
                    $('#instances-selected-data').data("instancesSelectedData",rowData)
                    console.log(rowData)
                    $('#selected-instance').text(rowData[0].SubjectCode)


                    if (rowData != null && !lectureTable.rows('.selected').any()){
                        console.log("dongs")
                        lectureTable.column(2).search(rowData[0].SubjectCode).draw()
                    } else {
                        console.log("dongssssss")
                        lectureTable.columns().search('').draw()
                    }
                })
                .on('deselect', function (e, dt, type, indexes) {
                    $('#instances-selected-data').removeData("instancesSelectedData")
                    $('#selected-instance').text("Nothing Selected")
                    lectureTable.columns().search('').draw()
                })
        }
        function selectedRowFromLecturersTable() {
            lectureTable
                .on('select', function (e, dt, type, indexes) {
                    var selectedLecturer = lectureTable.rows({ selected: true}).data();
                    $('#lecturers-selected-data').data(selectedLecturer)
                    $('#selected-lecturer').text(selectedLecturer[0].name)
                    console.log(selectedLecturer[0].subjectsLecturerCanTeach.subjectsCode)
                    var subjectCodes = $.map(selectedLecturer[0].subjectsLecturerCanTeach.subjectsCode,function (value) {
                        return value
                    }).join('|')
                    console.log(subjectCodes)

                    if (selectedLecturer != null && !instancesTable.rows('.selected').any()) {
                        instancesTable.column(0).search(subjectCodes,true,false,false).draw()
                    }
                })
                .on('deselect', function (e, dt, type, indexes) {
                    $('#lecturers-selected-data').removeData('lecturers-selected-data')
                    instancesTable.column(0).search('').draw()
                    $('#selected-lecturer').text("Nothing Selected")
                });
        }

    }

    function createScheduleAndAddToScheduleTable() {
        $('#create-schedule').on('click', function() {
            var tables = $('.dataTable').DataTable();
            var instancesTable = tables.table( 0 );
            var lecturerTable = tables.table( 1 );
            var scheduleTable = tables.table( 2 );
            console.log("clicked")
            console.log(instancesTable.rows({ selected: true}).data().toArray())

            var instancesData = instancesTable.rows({ selected: true}).data().toArray()
            var lecturerData = lecturerTable.rows({ selected: true}).data().toArray()

            console.log($('#choose-a-lecturer-roll option:selected').text())
            if ($('#selected-instance').text() != "Nothing Selected" && $('#selected-lecturer').text() != "Nothing Selected" && $('#choose-a-lecturer-roll option:selected').text() != "Nothing Selected") {
                scheduleTable.row.add([
                    "",
                    instancesData[0].SubjectCode,
                    instancesData[0].SubjectName,
                    instancesData[0].StartDate,
                    instancesData[0].EndDate,
                    instancesData[0].Load,
                    lecturerData[0].name,
                    lecturerData[0].load,
                    $('#choose-a-lecturer-roll option:selected').text(),
                    "",
                    "",

                ]).draw()
            }



        })
    }
}



