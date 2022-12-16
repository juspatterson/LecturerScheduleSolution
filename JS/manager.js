$(function () {
    var managementOfTablesAndFunctions = new ManagementOfTablesAndFunctions();
    managementOfTablesAndFunctions.confirmLogin();
    managementOfTablesAndFunctions.init();

})

function ManagementOfTablesAndFunctions() {

    var scheduleTable = null
    var instancesTable = null
    var lecturersTable = null
    var editingSchdule = false

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
            editingSchdule = false

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
            processing: true,
            responsive: true,
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
            columnDefs: [{
                targets: '_all',
                className: 'dt-left',
            }],
            columns: [
                {'data': 'SubjectCode', "width": "10%"},
                {'data': 'SubjectName', "width": "10%"},
                {'data': 'StartDate', "width": "10%"},
                {'data': 'EndDate', "width": "10%"},
                {'data': 'Load',"width": "8%"},
                {'data': 'CurrentLoad',"width": "8%"},
                {'data': 'index', "visible": false}
            ],
            stateSave: true,

        });

        instancesTable.on('xhr', function(event, settings, json, xhr) {

        });

        filterByDate('#instances-filter', instancesTable, 2);

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

            updateCurrentLoadOnInstancesTable(json)
        });

        filterByDate('#schedule-filter', scheduleTable, 4);

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
                            editingSchdule = true
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
                if (parseFloat(value['CurrentLoad']) != parseFloat(value['Load'])) {
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
        selectedRowFromInstancesTable()
        selectedRowFromLecturersTable()

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
                        if (!editingSchdule) {
                            removeLecturesThatAreAssingedToInstance(instancesData)
                        }


                    } else {
                        lecturersTable.columns().search('').draw()
                    }

                    calculateLecturersCurrentLoad()
                })

                .on('deselect', function (e, dt, type, indexes) {

                    $('#selected-instance').text("Nothing Selected")
                    lecturersTable.columns().search('').draw()
                    $('#close-x-instance').text("")
                    resetLecturersCurrentLoad()
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

        function removeLecturesThatAreAssingedToInstance(instancesData) {
            let excludeLeturers = []
            scheduleTable.data().filter(function (value, index) {
                let SubjectCode = getScheduleDataObject('SubjectCode', value)
                let subjectStartDate = getScheduleDataObject('SubjectStartDate', value)

                if (instancesData[0].SubjectCode === SubjectCode && instancesData[0].StartDate === subjectStartDate) {
                    let lecturersName = getScheduleDataObject('LecturerName', value)
                    excludeLeturers.push('^(?!' + lecturersName + '$)')
                }
            })
            //test to see which lecturers should be excluded
            // console.log(excludeLeturers)
            lecturersTable.column(0).search(excludeLeturers.join('|'), true, false).draw()
        }
    }

    function resetLecturersCurrentLoad() {
        lecturersTable.rows( function ( idx, data, node ) {
            lecturersTable
                .cell({row:idx, column:4})
                .data('0.0')

        })

    }

    function calculateLecturersCurrentLoad() {
        resetLecturersCurrentLoad()

        let lecturersData = lecturersTable.data().toArray()
        let scheduleData =  scheduleTable.data()
        let selectedInstance = instancesTable.rows({ selected: true}).data()
        let instancesStartDate = selectedInstance[0]['StartDate']
        let dateRange = createDateRange(6, "array", instancesStartDate)

        lecturersData.forEach(function(lecturer) {
            let lecturersName = lecturer['name']
            instancesDatesAndLoads = []

            scheduleData
                .filter(function (value, index) {
                    let scheduleStartDate = getScheduleDataObject('SubjectStartDate', value)
                    let scheduleLecturersName = getScheduleDataObject('LecturerName', value)
                    if (scheduleLecturersName === lecturersName) {
                        let subjectStartDate = getScheduleDataObject('SubjectStartDate', value)
                        let lecturersLoad = getScheduleDataObject('LecturerLoad', value)
                        instancesDatesAndLoads.push( [subjectStartDate, lecturersLoad] )
                    }
                })

            let calculatedLoadForLecturer = 0
            dateRange.forEach(function(outterDate) {
                instancesDatesAndLoads.forEach(function(instanceDateAndLoad) {
                    // console.log(instanceDateAndLoad)
                    if (outterDate === instanceDateAndLoad[0]) {
                        calculatedLoadForLecturer = parseFloat(calculatedLoadForLecturer) + parseFloat(instanceDateAndLoad[1])
                    }
                })
            })

            // print out values for testing
            // console.log(dateRange)
            // console.log(lecturersName, instancesDatesAndLoads)
            // console.log(numberOfinstancesWithinDateRange)

            lecturersTable.rows( function ( idx, data, node ) {
                // console.log(data)
                if (data['name'] === lecturersName) {
                    let newLoad = calculatedLoadForLecturer
                    lecturersTable
                        .cell({row:idx, column:4})
                        .data((newLoad).toFixed(1))
                }
            })
        })
    }

    function createScheduleAndAddToScheduleTable() {

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

            if ($('#selected-instance').text() != "Nothing Selected" &&
                $('#selected-lecturer').text() != "Nothing Selected" &&
                $('#choose-a-lecturer-role option:selected').text() != "Nothing Selected")
            {
                ValidationAndCreateSchedule()
            }

        })

        function ValidationAndCreateSchedule() {
            let selectedInstanceData = instancesTable.rows({ selected: true}).data().toArray()
            let instanceSubjectCode = selectedInstanceData[0]['SubjectCode']
            let instanceSubjectStartDate = selectedInstanceData[0]['StartDate']
            let instanceCurrentLoad = selectedInstanceData[0]['CurrentLoad']

            let lecturersData = lecturersTable.rows({ selected: true}).data().toArray()
            let lecturerCurrentLoad = lecturersData[0]['CurrentLoad']
            let lecturerMaximumLoad = lecturersData[0]['MaximumLoad']
            let lecturerLoad = lecturersData[0]['load']

            let potentialNewCurrentLoad = ((parseFloat(lecturerCurrentLoad) + parseFloat(lecturerLoad)) - parseFloat(instanceCurrentLoad)).toFixed(1)

            var roleValidation = checkRoll(instanceSubjectCode, instanceSubjectStartDate)


            if (potentialNewCurrentLoad > lecturerMaximumLoad && roleValidation) {
                if (window.confirm("Click OK to override maximum load")) {
                    addOrEditSchedule('true')
                }
            }
            else if(potentialNewCurrentLoad <= lecturerMaximumLoad && roleValidation) {
                addOrEditSchedule('false')
            }
        }

        function checkRoll(instanceSubjectCode, instanceSubjectStartDate) {
            let roleValidation = true
            let scheduleData = scheduleTable.rows().data().toArray()
            scheduleData.forEach(function(schedule) {
                let subjectCode = getScheduleDataObject('SubjectCode', schedule)
                let subjectStartDate = getScheduleDataObject('SubjectStartDate', schedule)
                let lecturersRole = getScheduleDataObject('LecturersRole',schedule)

                if( subjectCode === instanceSubjectCode &&
                    subjectStartDate === instanceSubjectStartDate &&
                    lecturersRole === 'Main Lecturer' &&
                    $('#choose-a-lecturer-role option:selected').text() === 'Main Lecturer') {

                    roleValidation = false

                    window.alert('This instance already has a \'Main Lecturer\' \n please select a different role')
                }

            })
            return roleValidation
        }

        function addOrEditSchedule(override) {
            if ($('#create-schedule').val() === 'Create Schedule') {
                addScheduleToDatabase(override)
            } else  {
                editScheduleOnDatabase(override)
            }

        }
    }

    function addScheduleToDatabase(override) {
        $.ajax({
            type: 'POST',
            // dataType: 'jsonp',
            url: '/api/schedules/create',
            async: true,
            data: {'data': dataForSchedule(override, false)},
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

    function editScheduleOnDatabase(override) {
        var scheduleData = scheduleTable.rows({ selected: true}).data().toArray()
        console.log(scheduleData)
        var id = scheduleData[0].id

        $.ajax({
            type: 'POST',
            // dataType: 'jsonp',
            url: '/api/schedules/edit',
            async: true,
            data: {'id': id, 'data': dataForSchedule(override, true)},
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

    function dataForSchedule(override, editing) {
        var instancesData = instancesTable.rows({ selected: true}).data().toArray()
        var lecturerData = lecturersTable.rows({ selected: true}).data().toArray()

        let assignedLoad = calulateLoadNeededForSchedule()

        var newSchedule = {};
        newSchedule ['Override'] = override
        newSchedule ['SubjectCode'] = instancesData[0].SubjectCode
        newSchedule ['SubjectName'] = instancesData[0].SubjectName
        newSchedule ['SubjectStartDate'] = instancesData[0].StartDate
        newSchedule ['SubjectEndDate'] = instancesData[0].EndDate
        newSchedule ['SubjectLoad'] = instancesData[0].Load
        newSchedule ['LecturerName'] = lecturerData[0].name
        newSchedule ['LecturerLoad'] = assignedLoad
        newSchedule ['LecturersRole'] = $('#choose-a-lecturer-role option:selected').text()
        var data = JSON.stringify(newSchedule)

        return data

        function calulateLoadNeededForSchedule() {
            let currentLoad = instancesData[0]['CurrentLoad']

            //if editing remove the current lectures load from the instances current load.
            if (editing) {
                let scheduleData = scheduleTable.rows({ selected: true}).data().toArray()
                let scheduleDataLecturerLoad = getScheduleDataObject('LecturerLoad', scheduleData[0])
                currentLoad = currentLoad - scheduleDataLecturerLoad
            }


            let instancesLoad = instancesData[0]['Load']
            let neededLoad = (instancesLoad - currentLoad).toFixed(1)
            let lecturersLoad = lecturerData[0]['load']
            let assignedLoad = 0

            if (neededLoad >= lecturersLoad) {
                assignedLoad = lecturersLoad
            } else {
                assignedLoad = neededLoad
            }

            return assignedLoad
        }
    }

    function showToasterMessage(text) {
        var x = document.getElementById("toaster-message");
        x.className = "show";
        $('#toaster-message').text(text)
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }

    function resetTablesAndForm() {
        $('#schedule-filter').find(":selected").val();
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
        editingSchdule = false
        resetLecturersCurrentLoad()
        filterScheduleLoadsHaveNotBeenMeet()
        $('#create-schedule-form').trigger('reset')
        $('#instances-filter').trigger('change')
        $('#schedule-filter').trigger('change')



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