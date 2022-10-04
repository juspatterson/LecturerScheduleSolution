$(function () {
    loadInstanceTable()
    loadLecturesTable()


    $('#instances-table, #lectures-table').on('click', 'tr', function () {
        filterOnSelectedRow()
    })
})

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
                    {'data': 'StartMonth'},
                    {'data': 'EndMonth'},
                    {'data': 'NumberOfStudents'}
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

function filterOnSelectedRow() {
    var tables = $('.dataTable').DataTable();
    var instancesTable = tables.table( 0 );
    var lectureTable = tables.table( 1 );

    selectedRowFromInstancesTable()
    selectedRowFromLecturersTable()

    var instancesSelectedData =  $('#instances-selected-data').data()
    var lecturersSelectedData =  $('#lecturers-selected-data').data()

    if (instancesSelectedData != 0){
        console.log('dongs')
    }
    console.log("instancesSelectedData")
    console.log(instancesSelectedData)

    console.log("lecturersSelectedData")
    console.log(lecturersSelectedData)


    function selectedRowFromInstancesTable() {
        instancesTable
            .on('select', function (e, dt, type, indexes) {
                var rowData = instancesTable.rows({ selected: true}).data();
                $('#instances-selected-data').data(rowData)
            });
    }
    function selectedRowFromLecturersTable() {
        lectureTable
            .on('select', function (e, dt, type, indexes) {
                var lectureTable1 = lectureTable.rows({ selected: true}).data();
                $('#lecturers-selected-data').data(lectureTable1)
            });
    }

}