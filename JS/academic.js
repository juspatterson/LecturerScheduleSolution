$(function () {
    var managementOfTablesAndFunctions = new ManagementOfTablesAndFunctions();
    managementOfTablesAndFunctions.init();
})

function ManagementOfTablesAndFunctions(tables1) {
    this.init = function() {
        //loadLectureScheduleTable()
        prototypeData()
        filterByDate()
    }
    
    function prototypeData() {
        var table = $('#lecturers-schedule-table').DataTable({
            dom: 'Bfrtip',
            responsive: true,
            sScrollY: 600,
            language: {search: "", searchPlaceholder: "Search..."},
            //data:
            //dataSrc:
            serverSide: false,
            processing: true,
            paging: false,
            fixedHeader: true,
            columnDefs: [
                { targets: '_all', className: 'dt-left' }
            ],
            "rowCallback": function( row, data, index ) {
                if(index%2 == 0){
                    $(row).removeClass('myodd myeven');
                    $(row).addClass('myodd');
                }else{
                    $(row).removeClass('myodd myeven');
                    $(row).addClass('myeven');
                }
            },
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



            //columns: []
        });
        addData()
        //Take the category filter drop down and append it to the datatables_filter div.
        //You can use this same idea to move the filter anywhere withing the datatable that you want.

        function addData() {
            var mainLecturer = "Main Lecturer"
            var supportLiveDemo = "Support - Live Demo"
            var supportSupport = "Support - Support"
            var supportMarking = "Support - Marking"

            addRow("CSE3CSX",
                "Cybersecurity Fundamentals (Elective)",
                "2023-01",
                "2023-03",
                mainLecturer)

            addRow("CSE1ITX",
                "Information Technology Fundamentals",
                "2023-01",
                "2023-03",
                supportSupport)

            addRow("CSE1ITX",
                "Big Data on the Cloud",
                "2023-02",
                "2023-04",
                supportLiveDemo)

            addRow("CSE1ITX",
                "System Operations on the Cloud",
                "2023-03",
                "2023-05",
                supportSupport)

            addRow("CSE1ITX",
                "Architecting on the Cloud",
                "2023-04",
                "2023-06",
                mainLecturer)

            addRow("CSE1ITX",
                "Profesional Environment",
                "2023-05",
                "2023-07",
                supportMarking)

            addRow("CSE1ITX",
                "Industry Project 3B",
                "2023-06",
                "2023-08",
                supportLiveDemo)

            addRow("CSE1ITX",
                "Industry Project 3A",
                "2023-07",
                "2023-09",
                supportSupport)

            addRow("CSE1ITX",
                "Wireless Network Engineering (Elective)",
                "2023-08",
                "2023-10",
                mainLecturer)

            addRow("CSE1ITX",
                "Internet of Things (Elective)",
                "2023-09",
                "2023-11",
                supportMarking)


            addRow("CSE1ITX",
                "Web Development",
                "2023-10",
                "2023-12",
                supportLiveDemo)

            addRow("CSE1ITX",
                "Operating Systems Administration",
                "2023-11",
                "2024-01",
                supportSupport)

            addRow("CSE1ITX",
                "Managing Projects in the Cloud",
                "2023-12",
                "2024-02",
                mainLecturer)

            addRow("CSE1ITX",
                "Operating Systems Administration",
                "2024-01",
                "2024-03",
                supportSupport)

            function addRow(code,name,start,end,roll) {
                table.row.add([
                    code,
                    name,
                    start,
                    end,
                    roll
                ]).draw()
            }
        }
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

    //this needed to be updated once we have our database set up
    function loadLectureScheduleTable () {
        //this needed to be updated once we have our database set up
        $.ajax({

            type: "GET",
            url: '../MockUpData/SubjectsTimeTable.json',
            dataType: 'json',
            data: '{}',
            success: function (subjectsTimeTable, textStatus) {


                $('#lecturers-schedule-table').DataTable({
                    data: subjectsTimeTable.instances,
                    dataSrc: subjectsTimeTable.instances,
                    serverSide: false,
                    processing: true,
                    responsive: true,
                    paging: false,
                    fixedHeader: true,

                    //columns: []
                });


            },
            error: function (obj, textStatus) {
                alert(obj.msg);
            }
        });
    }
}

