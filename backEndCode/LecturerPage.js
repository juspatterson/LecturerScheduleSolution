$(document).ready(function () {
    var data = loadDataForSubjectsTimeTable()

    console.log("loaded data")
    console.log(data)


    console.log("loaded instances")
    console.log(instances)



    $.ajax({

        type: "GET",
        url: '../MockUpData/SubjectsTimeTable.json',
        dataType: 'json',
        data: '{}',
        success: function (subjectsTimeTable, textStatus) {
            console.log("dsfdfsfgsdg")
            console.log(subjectsTimeTable.instances[0])

            $('#table_id').DataTable({
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


    // $('#table_id').DataTable( {
    //     data: data.instance,
    //     dataSrc: data.instance,
    //     serverSide: false,
    //     processing: true,
    //     responsive: true,
    //     columns: [
    //
    //         { data: 'subjectCode' },
    //         { data: 'subjectName' },
    //         { data: 'startMonth' },
    //         { data: 'endMonth' },
    //         { data: 'numberOfStudents' },
    //     ]
    // })

})