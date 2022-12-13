$(function () {
    var managementOfTablesAndFunctions = new ManagementOfTablesAndFunctions();
    //managementOfTablesAndFunctions.confirmLogin();
    managementOfTablesAndFunctions.init();

})

function ManagementOfTablesAndFunctions() {

    var scheduleTable = null
    var instancesTable = null
    var lecturersTable = null

    this.confirmLogin = function () {
        $.ajax({
            type: "POST",
            url: '/api/login/confirm',
            dataType: '',
            data: {},
            success: function (confirm) {
                if (confirm === 'false') {
                    window.location.replace('https://stick-dream.bnr.la')
                }
            },
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }

    this.init = function () {
        logout()
        createInstanceTable()
        createLecturersTable()
        createScheduleTable()
        filterOnSelectedRow()
        createScheduleAndAddToScheduleTable()
        removeSelectedRowsFromTablesResetForm()
        cancelButton()

    }

    function cancelButton() {
        $('#cancel-button').on('click', function() {
            resetTablesAndForm()

        })
    }

    function logout() {
        $('.logout-link').on('click', function () {
            window.location.replace('https://stick-dream.bnr.la')
        })
    }

    function createLecturersTable() {
        lecturersTable = $('#lecturers-table').DataTable({
            ajax: {
                dataSrc: '',
                url: 'MockUpData/lecturerSME.json',
            },
            autoWidth: true,
            scrollY: 610,
            language: { search: "",searchPlaceholder: "Search..." },
            processing: true,
            responsive: true,
            paging: false,
            fixedHeader: true,
            select: true,
            select: {
                style: 'single'
            },
            "rowCallback": updateRowColour(),
            columnDefs: [
                { targets: '_all', className: 'dt-left' }
            ],
            columns: [
                {'data': 'name'},
                {'data': 'load'},
                {
                    'data': "subjectsLecturerCanTeach.subjectsCode",
                    "visible": false
                },
                {'data': 'MaximumLoad', "width": "10%"},
                {'data': 'CurrentLoad',"width": "10%"}
            ]
        });
    }

    function createInstanceTable() {
        instancesTable = $('#instances-table').DataTable({
            ajax: {
                dataSrc: '',
                url: '/MockUpData/SubjectsTimeTable.json',
            },
            autoWidth: true,
            language: { search: "",searchPlaceholder: "Search..." },
            sScrollY: 600,
            scrollCollapse: true,
            paging: false,
            processing: true,
            fixedHeader: true,
            select: true,
            select: {
                style: 'single'
            },
            "rowCallback": updateRowColour(),
            columnDefs: [
                { targets: '_all', className: 'dt-left' },
            ],
            columns: [
                {'data': 'SubjectCode'},
                {'data': 'SubjectName'},
                {'data': 'StartDate'},
                {'data': 'EndDate'},
                {'data': 'Load'},
                {'data': 'CurrentLoad'},
                {'data': 'index', "visible": false}
            ],
            stateSave: true,

        });

        instancesTable.on('xhr', function(event, settings, json, xhr) {
            filterByDate('#instances-filter', instancesTable, 2);
        });

    }

    function scheduleGetter(key) {
        return function(row) {
            let schedule = row.schedule;
            let scheduleJson = JSON.parse(schedule)
            return scheduleJson[key]
        }
    }

    function createScheduleTable() {
        scheduleTable = $('#schedule-table').DataTable( {
            ajax: {
                dataSrc: '',
                url: '/api/schedules',
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
                {
                    'data': 'id',
                    // "visible": false
                },
                {'data': overrideColumn('Override')},
                {'data': scheduleGetter("SubjectCode")},
                {'data': scheduleGetter("SubjectName")},
                {'data': scheduleGetter("SubjectStartDate")},
                {'data': scheduleGetter("SubjectEndDate")},
                {'data': scheduleGetter("SubjectLoad")},
                {'data': scheduleGetter("LecturerName")},
                {'data': scheduleGetter("LecturerLoad")},
                {'data': scheduleGetter("LecturersRole")},
            ],
            select: true,
            select: {
                style: 'single'
            },
            "rowCallback": updateRowColour(),
            columnDefs: [
                {targets: '_all', className: 'dt-left'}
            ],
            buttons: [ deleteButton(), editButton() ]

        } )

        //do things once table and data are loaded
        scheduleTable.on('xhr', function(event, settings, json, xhr) {
            filterByDate('#schedule-filter', scheduleTable, 4);
            updateCurrentLoadOnInstancesTable(json)
        });

        function updateCurrentLoadOnInstancesTable(allScheduleData) {

            instancesTable.rows( function ( idx, data, node ) {
                instancesTable
                    .cell({row:idx, column:5})
                    .data(0)
            })

            let keyValuePairsArray = []
            allScheduleData.forEach(function(value, _) {
                let code = getScheduleDataObject('SubjectCode', value)
                let startDate = getScheduleDataObject('SubjectStartDate', value)
                let load = getScheduleDataObject('LecturerLoad', value)

                keyValuePairsArray.push([[code, startDate].join(","), load])
            })

            let combinedLoads = {}
            keyValuePairsArray.forEach(function(keyValuePairArray, _) {
                let key = keyValuePairArray[0]
                let newLoad = keyValuePairArray[1]
                let existingLoad = combinedLoads[key]

                if (existingLoad === undefined) {
                    combinedLoads[key] = newLoad
                } else {
                    combinedLoads[key] = parseFloat(existingLoad) + parseFloat(newLoad)
                }
            })

            Object.keys(combinedLoads).forEach(function(key) {
                let splitKey = key.split(',')

                instancesTable.rows( function ( idx, data, node ) {
                    if(data['SubjectCode'] === splitKey[0] && data['StartDate'] === splitKey[1]){
                        instancesTable
                            .cell({row:idx, column:5})
                            .data((parseFloat(combinedLoads[key])).toFixed(1))
                    }
                })
            })

            filterScheduleLoadsHaveNotBeenMeet()

        }

        function deleteButton() {
            return {
                text: "Delete",
                action: function (e, dt, node, config) {
                    if (scheduleTable.rows('.selected').any()) {
                        if (window.confirm("Click OK to delete Schedule")) {
                            let selectRow = scheduleTable.rows('.selected').data()
                            deleteFromDataBase(selectRow[0].id)

                        }
                    } else {
                        window.alert('Please select a schedule to delete.')
                    }
                }
            }
        }



        function editButton() {
            return {
                text: "Edit",
                action: function (e, dt, node, config) {
                    if(scheduleTable.rows('.selected').any()) {
                        if (window.confirm("Click OK to Edit Schedule")) {
                            let selectRow = scheduleTable.rows('.selected').data()
                            loadDataIntoTablesAndFormForEditingSchedule(selectRow)


                        }
                    } else {
                        window.alert('Please select a schedule to edit.')
                    }
                }
            }
        }

        function overrideColumn(key) {
            return function(row) {
                let schedule = row.schedule;
                let scheduleJson = JSON.parse(schedule)
                if (scheduleJson[key] === 'true') {
                    return "<img id='theImg' src='../Images/warning-sign-9760.png' height='40' width='40'/>"
                } else {
                    return ""
                }
            }
        }

    }

    function getScheduleDataObject(key, data) {
        let schedule = data.schedule;
        let scheduleJson = JSON.parse(schedule)
        return (scheduleJson[key])
    }

    function filterScheduleLoadsHaveNotBeenMeet() {
        var scheduleLoadsHaveNotBeenMeet = []
        instancesTable.data()
            .filter(function (value, index) {
                if (parseFloat(value['CurrentLoad']) < parseFloat(value['Load'])) {
                    scheduleLoadsHaveNotBeenMeet.push('^' + value['index'] + '$')
                }
            }).toArray()

        let scheduleIndex = scheduleLoadsHaveNotBeenMeet.join('|')
        instancesTable
            .column(6)
            .search( scheduleIndex,true,false,false )
            .draw()

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

    function filterOnSelectedRow() {
        $('#instances-table, #lecturers-table').on('click', 'tr', function () {
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

                    if (instancesData != null){
                        lecturersTable.column(2).search(instancesData[0].SubjectCode).draw()
                    } else {
                        lecturersTable.columns().search('').draw()
                    }
                })
                .on('deselect', function (e, dt, type, indexes) {

                    $('#selected-instance').text("Nothing Selected")
                    lecturersTable.columns().search('').draw()
                    $('#close-x-instance').text("")
                })
        }
        function selectedRowFromLecturersTable() {
            lecturersTable
                .on('select', function (e, dt, type, indexes) {
                    var selectedLecturer = lecturersTable.rows({ selected: true}).data();
                    $('#selected-lecturer').text(selectedLecturer[0].name)
                    $('#close-x-lecturer').text("X")
                    $('#selected-lecturer-error-massage').css('visibility', 'hidden')

                    var subjectCodes = $.map(selectedLecturer[0].subjectsLecturerCanTeach.subjectsCode,function (value) {
                        return value
                    }).join('|')

                    if (selectedLecturer != null) {
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
                    addOrEditSchedule('true')

                    $('#create-schedule-form').trigger('reset')
                    $('#schedule-filter').trigger("change")

                }
            }

            else if ($('#selected-instance').text() != "Nothing Selected" && $('#selected-lecturer').text() != "Nothing Selected" && $('#choose-a-lecturer-role option:selected').text() != "Nothing Selected") {
                addOrEditSchedule('false')

                $('#create-schedule-form').trigger('reset')
                $('#schedule-filter').trigger("change")
                errorDisplayCount += 1
            }
        })

        function addOrEditSchedule(override) {
            if ($('#create-schedule').val() === 'Create Schedule') {
                addScheduleToDatabase(override)
            } else  {
                editScheduleOnDatabase(override)
            }

        }
    }

    function editScheduleOnDatabase(override) {
        var scheduleData = scheduleTable.rows({ selected: true}).data().toArray()
        console.log(scheduleData)
        var id = scheduleData[0].id

        $.ajax({
            type: 'POST',
            // dataType: 'jsonp',
            url: '/api/schedules/edit',
            async: true,
            data: {'id': id, 'data': dataForSchedule(override)},
            success: function() {
                console.log('editing done');
                scheduleTable.ajax.reload();
                showToasterMessage('Edited Schedule')
                resetTablesAndForm()

            },
            error: function (obj, textStatus) {
                console.log(obj.msg);
            }
        });


    }

    function showToasterMessage(text) {
        var x = document.getElementById("toaster-message");
        x.className = "show";
        $('#toaster-message').text(text)
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }

    function resetTablesAndForm() {
        $('#selected-instance').text("Nothing Selected")
        $('#close-x-instance').text("")
        lecturersTable.columns().search('').draw()
        instancesTable.rows('.selected').deselect().draw()
        $('#selected-lecturer').text("Nothing Selected")
        $('#close-x-lecturer').text("")
        instancesTable.columns().search('').draw()
        lecturersTable.rows('.selected').deselect()
        $('#choose-a-lecturer-role').val('Nothing Selected')
        $('#create-schedule').val('Create Schedule')
    }

    function dataForSchedule(override) {
        var instancesData = instancesTable.rows({ selected: true}).data().toArray()
        var lecturerData = lecturersTable.rows({ selected: true}).data().toArray()

        var newSchedule = {};
        newSchedule ['Override'] = override
        newSchedule ['SubjectCode'] = instancesData[0].SubjectCode
        newSchedule ['SubjectName'] = instancesData[0].SubjectName
        newSchedule ['SubjectStartDate'] = instancesData[0].StartDate
        newSchedule ['SubjectEndDate'] = instancesData[0].EndDate
        newSchedule ['SubjectLoad'] = instancesData[0].Load
        newSchedule ['LecturerName'] = lecturerData[0].name
        newSchedule ['LecturerLoad'] = lecturerData[0].load
        newSchedule ['LecturersRole'] = $('#choose-a-lecturer-role option:selected').text()
        var data = JSON.stringify(newSchedule)

        return data
    }

    function addScheduleToDatabase(override) {
        $.ajax({
            type: 'POST',
            // dataType: 'jsonp',
            url: '/api/schedules/create',
            async: true,
            data: {'data': dataForSchedule(override)},
            success: function() {
                console.log('done');
                scheduleTable.ajax.reload();
                showToasterMessage('Schedule Created')
                resetTablesAndForm()
            },
            error: function (obj, textStatus) {
                console.log(obj.msg);
            }
        });
    }

    function loadDataIntoTablesAndFormForEditingSchedule(selectRow) {
        let schedule = JSON.parse(selectRow[0].schedule)
        let subjectCode = schedule.SubjectCode
        let startDate = schedule.SubjectStartDate
        let lecturersName = schedule.LecturerName
        let lecturersRole = schedule.LecturersRole

        instancesTable.rows(function (idx, data, node) {
            if (data.SubjectCode === subjectCode && data.StartDate === startDate) {
                return idx
            }
        }).select()

        console.log(lecturersName)

        lecturersTable.row(':contains('+ lecturersName +')').select()


        filterLecturersTableFillFormWithInstanceInformation()
        filterInstancesTableFillFormWithLecturerInformation()
        calculateLecturersCurrentLoad()

        switch (lecturersRole) {
            case "Main Lecturer" :
                $('#choose-a-lecturer-role').prop('selectedIndex', 1)
                break
            case "Support - Live Demo" :
                $('#choose-a-lecturer-role').prop('selectedIndex', 2)
                break
            case "Support - Support" :
                $('#choose-a-lecturer-role').prop('selectedIndex', 3)
                break
            case "Support - Marking" :
                $('#choose-a-lecturer-role').prop('selectedIndex', 4)
                break
            default:
                $('#choose-a-lecturer-role').prop('selectedIndex', 0)
                break
        }

        $('#create-schedule').val('Edit Schedule')

        $('html, body').animate({
            'scrollTop' : $(".heading").position().top
        });

        function filterLecturersTableFillFormWithInstanceInformation() {
            var instancesData = instancesTable.rows({ selected: true }).data().toArray();
            var instancesDataJoin = instancesData[0].SubjectCode + " " + instancesData[0].SubjectName + " " + instancesData[0].StartDate + " " + instancesData[0].EndDate
            lecturersTable.column(2).search(instancesData[0].SubjectCode).draw()

            $('#selected-instance').text(instancesDataJoin )
            $('#close-x-instance').text("X")
            $('#selected-instance-error-massage').css('visibility', 'hidden')
        }

        function filterInstancesTableFillFormWithLecturerInformation() {
            var selectedLecturer = lecturersTable.rows({ selected: true}).data();
            var subjectCodes = $.map(selectedLecturer[0].subjectsLecturerCanTeach.subjectsCode,function (value) {
                return value
            }).join('|')
            instancesTable.column(0).search(subjectCodes,true,false,false).draw()

            $('#selected-lecturer').text(selectedLecturer[0].name)
            $('#close-x-lecturer').text("X")
            $('#selected-lecturer-error-massage').css('visibility', 'hidden')
        }
    }

    function deleteFromDataBase(id) {
        console.log(id)
        $.ajax({
            type: 'POST',
            // dataType: 'jsonp',
            url: '/api/schedules/delete',
            async: true,
            data: {'id': id},
            success: function() {
                console.log('deleting done');
                showToasterMessage('Schedule Deleted')
                scheduleTable.ajax.reload()
            },
            error: function (obj, textStatus) {
                console.log(obj.msg);
            }
        })
    }

    function removeSelectedRowsFromTablesResetForm() {
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

    function filterByDate(filterID, table, columnIndex) {
        $(filterID).on('change', function () {

            var selectedValue = $(filterID).val()
            let  threeMonths = createDateRange(3, "string")
            let  sixMonths = createDateRange(6, "string")
            let  twelveMonths = createDateRange(12, "string")

            switch (selectedValue) {
                case "":
                    table.columns().search('').draw()
                    filterScheduleLoadsHaveNotBeenMeet()
                    break
                case "3 Months":
                    table.columns(columnIndex).search(threeMonths,true,false,false).draw()
                    break
                case "6 Months":
                    table.columns(columnIndex).search(sixMonths,true,false,false).draw()
                    break
                case "12 Months":
                    table.columns(columnIndex).search(twelveMonths,true,false,false).draw()
            }
        })

    }

    function createDateRange(numberOfMonths, arrayOrString, startDate) {
            var date = new Date();
        var startDate = startDate ?? date.getFullYear() + "-" + (date.getMonth());
        let startDateSpilt = startDate.split('-')
        var year = parseInt(startDateSpilt[0])
        var month = parseInt(startDateSpilt[1])
            var dateRange = [startDate]

            for (let i = 1; i < numberOfMonths; i++) {
                month = month + 1
                if (month === 13) {
                    month = month - 12
                    year = year + 1
                }
                dateRange.push(year + '-' + leftPad(month, 2))
            }
        if (arrayOrString === "string") {
            return dateRange.join('|')
        }
        else if (arrayOrString === "array") {
            return dateRange
        }

        function leftPad(value, length) {
            return ('0'.repeat(length) + value).slice(-length);
        }
    }

}