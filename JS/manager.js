$(function () {
    var managementOfTablesAndFunctions = new ManagementOfTablesAndFunctions();
    managementOfTablesAndFunctions.init();

})

function ManagementOfTablesAndFunctions(tables1) {

    var scheduleTable = null
    var instancesTable = null
    var lecturersTable = null

    this.init = function () {
        loadInstanceTable()
        loadLecturersTable()
        loadScheduleTable()
        filterOnSelectedRow()
        createScheduleAndAddToScheduleTable()
        removeSelected()

    }

    function loadInstanceTable() {
        $.ajax({

            type: "GET",
            //async: false,
            url: '../MockUpData/SubjectsTimeTable.json',
            dataType: 'json',
            data: '{}',
            success: createInstanceTable,
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    function loadLecturersTable() {
        $.ajax({

            type: "GET",
            url: '../MockUpData/lecturerSME.json',
            dataType: 'json',
            data: '{}',
            success: createLecturersTable,
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    function createLecturersTable(lectureInformation, textStatus) {
            lecturersTable = $('#lecturers-table').DataTable({
                    autoWidth: true,
                    scrollY: 610,
                    language: { search: "",searchPlaceholder: "Search..." },
                    data: lectureInformation.lectures,
                    dataSrc: lectureInformation.lectures,
                    serverSide: false,
                    processing: true,
                    responsive: true,
                    paging: false,
                    fixedHeader: true,
                    select: true,
                    "rowCallback": function( row, data, index ) {
                        if(index%2 == 0){
                            $(row).removeClass('myodd myeven');
                            $(row).addClass('myodd');
                        }else{
                            $(row).removeClass('myodd myeven');
                            $(row).addClass('myeven');
                        }
                    },
                    columnDefs: [
                        { targets: '_all', className: 'dt-left' }
                    ],
                    columns: [
                        {'data': 'name'},
                        {'data': 'load'},
                        {
                            'data': "subjectsLecturerCanTeach.subjectsCode",
                            "visible": false
                        }
                    ]
                });



            }


    function createInstanceTable(subjectsTimeTable, textStatus) {


        instancesTable = $('#instances-table').DataTable({
            autoWidth: true,
            language: { search: "",searchPlaceholder: "Search..." },
            sScrollY: 600,
            scrollCollapse: true,
            paging: false,
            data: subjectsTimeTable.instances,
            dataSrc: subjectsTimeTable.instances,
            serverSide: false,
            processing: true,
            fixedHeader: true,
            select: true,
            "rowCallback": function( row, data, index ) {
                if(index%2 == 0){
                    $(row).removeClass('myodd myeven');
                    $(row).addClass('myodd');
                }else{
                    $(row).removeClass('myodd myeven');
                    $(row).addClass('myeven');
                }
            },
            columnDefs: [
                { targets: '_all', className: 'dt-left' }
            ],
            columns: [
                {'data': 'SubjectCode'},
                {'data': 'SubjectName'},
                {'data': 'StartDate'},
                {'data': 'EndDate'},
                {'data': 'Load'}
            ],
            stateSave: true,
        });

    }

    function createScheduleTable(schedules, textStatus) {
        scheduleTable = $('#schedule-table').DataTable({
            dom: 'Bfrtip',
            // ajax: '/api/schedules',
            // ajax: {
            //     type: "GET",
            //     url: '/api/schedules',
            //     dataType: 'json',
            //     data: '{}',
            // },
            responsive: true,
            autoWidth: true,
            sScrollY: 600,
            language: {search: "", searchPlaceholder: "Search..."},
            data: schedules,
            dataSrc: schedules,
            // serverSide: false,
            processing: true,
            responsive: true,
            paging: false,
            fixedHeader: true,
            columns: [
                {
                    'data': 'id',
                    // "visible": false
                },
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        if (scheduleJson.Override === 'true') {
                            return "<img id='theImg' src='../Images/warning-sign-9760.png' height='40' width='40'/>"
                        } else {
                            return ""
                        }
                    }},
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
                        return scheduleJson.SubjectLoad
                    }},
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        return scheduleJson.LecturerName
                    }},
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        return scheduleJson.LecturerLoad
                    }},
                {'data': function(row) {
                        let schedule = row.schedule;
                        let scheduleJson = JSON.parse(schedule)
                        return scheduleJson.LecturersRole
                    }},

            ],
            select: true,
            "rowCallback": function (row, data, index) {
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
                    text: "Delete",
                    action: function (e, dt, node, config) {
                        if (window.confirm("Click OK to delete Schedule")) {
                            table
                                .rows('.selected')
                                .remove()
                                .draw();
                        }
                    }
                },
                {
                    text: "Edit",
                    action: function (e, dt, node, config) {
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

        // $('#schedule-table').DataTable().ajax.reload();
    }

    function loadScheduleTable() {
        $.ajax({

            type: "GET",
            url: '/api/schedules',
            dataType: 'json',
            data: '{}',
            success: createScheduleTable,
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    function filterOnSelectedRow() {
        var tables = $('.dataTable').DataTable();
        var instancesTable = tables.table( 0 );
        var lectureTable = tables.table( 1 );

        $('#instances-table, #lecturers-table').on('click', 'tr', function () {
            tables = $('.dataTable').DataTable();
            instancesTable = tables.table( 0 );
            lectureTable = tables.table( 1 );
            selectedRowFromInstancesTable()
            selectedRowFromLecturersTable()
        })

        function selectedRowFromInstancesTable() {
            instancesTable
                .on('select', function (e, dt, type, indexes) {
                    var instancesData = instancesTable.rows({ selected: true}).data().toArray();
                    var instancesDataJoin = instancesData[0].SubjectCode + " " + instancesData[0].SubjectName + " " + instancesData[0].StartDate + " " + instancesData[0].EndDate
                    $('#selected-instance').text(instancesDataJoin )
                    $('#close-x-instance').text("X")
                    $('#selected-instance-error-massage').css('visibility', 'hidden')

                    if (instancesData != null && !lectureTable.rows('.selected').any()){
                        lectureTable.column(2).search(instancesData[0].SubjectCode).draw()
                    } else {
                        lectureTable.columns().search('').draw()
                    }
                })
                .on('deselect', function (e, dt, type, indexes) {

                    $('#selected-instance').text("Nothing Selected")
                    lectureTable.columns().search('').draw()
                    $('#close-x-instance').text("")
                })
        }
        function selectedRowFromLecturersTable() {
            lectureTable
                .on('select', function (e, dt, type, indexes) {
                    var selectedLecturer = lectureTable.rows({ selected: true}).data();
                    $('#selected-lecturer').text(selectedLecturer[0].name)
                    $('#close-x-lecturer').text("X")
                    $('#selected-lecturer-error-massage').css('visibility', 'hidden')

                    var subjectCodes = $.map(selectedLecturer[0].subjectsLecturerCanTeach.subjectsCode,function (value) {
                        return value
                    }).join('|')

                    if (selectedLecturer != null && !instancesTable.rows('.selected').any()) {
                        instancesTable.column(0).search(subjectCodes,true,false,false).draw()
                    }
                })
                .on('deselect', function (e, dt, type, indexes) {
                    instancesTable.column(0).search('').draw()
                    $('#selected-lecturer').text("Nothing Selected")
                    $('#close-x-lecturer').text("")
                });
        }

    }

    function createScheduleAndAddToScheduleTable() {
        var errorDisplayCount = 0

        $('#choose-a-lecturer-role').on('change', function () {
            $('#choose-a-lecturer-role-error-massage').css('visibility', 'hidden')
        })

        $('#create-schedule').on('click', function() {
            var tables = $('.dataTable').DataTable();
            var instancesTable = tables.table( 0 );
            var lecturerTable = tables.table( 1 );
            var scheduleTable = tables.table( 2 );
            var instancesData = instancesTable.rows({ selected: true}).data().toArray()
            var lecturerData = lecturerTable.rows({ selected: true}).data().toArray()

            if ($('#selected-instance').text() == "Nothing Selected") {
                $('#selected-instance-error-massage').css('visibility', 'revert')
            }

            if ($('#selected-lecturer').text() == "Nothing Selected") {
                $('#selected-lecturer-error-massage').css('visibility', 'revert')
            }

            if ($('#choose-a-lecturer-role option:selected').text() == "Nothing Selected") {
                $('#choose-a-lecturer-role-error-massage').css('visibility', 'revert')
            }

            if (errorDisplayCount == 5 && $('#selected-instance').text() != "Nothing Selected" && $('#selected-lecturer').text() != "Nothing Selected" && $('#choose-a-lecturer-role option:selected').text() != "Nothing Selected") {
                if (window.confirm("Click OK to override maximum load")) {
                    addScheduleToDatabase('true')

                    $('#create-schedule-form').trigger('reset')
                    resetTablesAndForm()

                    showToasterMessage()
                }
            }

            else if ($('#selected-instance').text() != "Nothing Selected" && $('#selected-lecturer').text() != "Nothing Selected" && $('#choose-a-lecturer-role option:selected').text() != "Nothing Selected") {
                addScheduleToDatabase('true')

                $('#create-schedule-form').trigger('reset')
                showToasterMessage()
                resetTablesAndForm()
                errorDisplayCount += 1
            }
        })

        function showToasterMessage() {
            var x = document.getElementById("toaster-message");
            x.className = "show";
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
        }

        function resetTablesAndForm() {
            var tables = $('.dataTable').DataTable();
            var instancesTable = tables.table( 0 );
            var lectureTable = tables.table( 1 );
            $('#selected-instance').text("Nothing Selected")
            $('#close-x-instance').text("")
            lectureTable.columns().search('').draw()
            instancesTable.rows('.selected').deselect().draw()
            $('#selected-lecturer').text("Nothing Selected")
            $('#close-x-lecturer').text("")
            instancesTable.columns().search('').draw()
            lectureTable.rows('.selected').deselect()
        }
    }

    function addScheduleToDatabase(overloaded) {
        var tables = $('.dataTable').DataTable();
        var instancesTable = tables.table( 0 );
        var lecturerTable = tables.table( 1 );
        var scheduleTable = tables.table( 2 );
        var instancesData = instancesTable.rows({ selected: true}).data().toArray()
        var lecturerData = lecturerTable.rows({ selected: true}).data().toArray()


        var newSchedule = {};
        newSchedule ['Override'] = overloaded
        newSchedule ['SubjectCode'] = instancesData[0].SubjectCode
        newSchedule ['SubjectName'] = instancesData[0].SubjectName
        newSchedule ['SubjectStartDate'] = instancesData[0].StartDate
        newSchedule ['SubjectEndDate'] = instancesData[0].EndDate
        newSchedule ['SubjectLoad'] = '1'
        newSchedule ['LecturerName'] = lecturerData[0].name
        newSchedule ['LecturerLoad'] = lecturerData[0].load
        newSchedule ['LecturersRole'] = $('#choose-a-lecturer-role option:selected').text()
        var data = JSON.stringify(newSchedule)

        console.log(data)


        $.ajax({
            type: 'POST',
            // dataType: 'jsonp',
            url: '/api/schedules/create',
            async: true,
            data: {'data': data},
            success: function(newdata) {
                console.log('done');
                newdata = data
                scheduleTable.clear()
                scheduleTable.destroy()
                loadScheduleTable()


            },
            error: function (obj, textStatus) {
                console.log(obj.msg);
            }
        });
    }

    function removeSelected() {
        $('#selected-instance, #close-x-container-instance').on('click',function () {
            $('#selected-instance').text("Nothing Selected")
            $('#close-x-instance').text("")
            lecturersTable.columns().search('').draw()
            instancesTable.rows('.selected').deselect().draw()

        })

        $('#selected-lecturer, #close-x-container-lecturer').on('click',function () {
            $('#selected-lecturer').text("Nothing Selected")
            $('#close-x-lecturer').text("")
            instancesTable.columns().search('').draw()
            lecturersTable.rows('.selected').deselect()
        })

    }

}



