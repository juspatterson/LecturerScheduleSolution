$(document).ready(function () {
    loadLectureScheduleTable()
})

function loadLectureScheduleTable () {
    //this needed to be updated once we have our database set up
    $.ajax({

        type: "GET",
        url: '../MockUpData/SubjectsTimeTable.json',
        dataType: 'json',
        data: '{}',
        success: function (subjectsTimeTable, textStatus) {


            $('#lectures-schedule-table').DataTable({
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