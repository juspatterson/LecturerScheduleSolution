$(function () {
    loadInstanceTable()
    loadLecturesTable()
})


function loadInstanceTable() {
    $.ajax({

        type: "GET",
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

                columns: [
                    {'data': 'SubjectCode'},
                    {'data': 'SubjectName'},
                    {'data': 'StartMonth'},
                    {'data': 'EndMonth'},
                    {'data': 'NumberOfStudents'}
                ]
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
            $('#lectures-table').DataTable({
                autoWidth: true,
                sScrollY: '80vh',
                data: lectureInformation.lectures,
                dataSrc: lectureInformation.lectures,
                serverSide: false,
                processing: true,
                responsive: true,
                paging: false,
                fixedHeader: true,

                columns: [
                    {'data': 'name'},
                    {'data': 'load'}
                ]
            });


        },
        error: function (obj, textStatus) {
            alert(obj.msg);
        }
    });
}