$(document).ready(function () {



    __ResetToAll();
});

var ___listenerValidatorLastCheck = 0;
var ___eventsToListen = 'textInput input change focus';

/**************************************** ******* ******* ******* 
         GET (all) ajax call (load data on #mastergrid)
******************************************* ******* ******* *****/
function GetAllEmployees(page, pageSize) {
    jQuery.support.cors = true;

    // Default values
    page = page || 1;
    pageSize = pageSize || 10;

    $(".colleft span.loading").addClass('spinner icon-loop2').show();

    $.ajax({
        url: '../api/employees?page=' + page + '&pageSize=' + pageSize,
        type: 'GET',
        dataType: 'json',
        success: function (data, status, xhr) {
            WriteResponses(data, status, xhr);
        },
        error: function (x, y, z) {
            ShowMessageDialog('Error', 'I couldn\'t retrieve the data from the server. Let\'s try again please. ');
        }
    });



    //Displays Employees in a <table> in #mastergrid
    function WriteResponses(employees, status, xhr) {
        var tr = "", strResult = "<table><th style='width:20%'></th><th style='width:30%'>First Name</th>" +
            "<th style='width:30%'>Last Name</th><th style='width:20%'>Age</th>";
        $.each(employees, function (index, employee) {

            tr = "<tr data-empid='" + employee.empID + "'>" +
                "<td class='rowbuttons'>" + $('.rowbuttons').html() + "</td>" +
                "<td>" + employee.empFirstName + "</td>" +
                "<td>" + employee.empLastName + "</td>" +
                "<td>" + employee.empAge + "</td></tr>";
            strResult += tr;
        });
        strResult += "</table>";

        $("#mastergrid").html(strResult);
        $(".colleft span.loading").removeClass('spinner icon-loop2').hide();

        // Select row listener
        $('#mastergrid td:not(:first-child').on('click', SelectEmployee);
        // Rowbuttons listeners
        $('#mastergrid .rowbuttons button').on('click', ClickOnActionButton);
        // ToolbarButtons [Employee] listener
        $('.master.toolbar button').on('click', ClickOnActionButton);

        var pagedata = $.parseJSON(xhr.getResponseHeader("X-Pagination"));


        if (pagedata != null) {
            __LoadPaginationDataOnPager($('.master.pager'), true,
                $('.master .btnnextpage'), $('.master .btnprevpage'),
                pagedata.actualPage, pagedata.totalPages, pagedata.pageSize);
        } else {
            __LoadPaginationDataOnPager($('.master.pager'), false,
                $('.master .btnnextpage'), $('.master .btnprevpage'), 1, 1, pageSize);
        }

        __SwitchWindowToNewStatus('read', null);



    }
}


/**************************************** ******* ******* ******* 
         GET (all) Address ajax call (load data on #slavegrid)
******************************************* ******* ******* *****/
function GetAllAddressesForEmp(empID, page, pageSize) {
    jQuery.support.cors = true;

    // Default values
    page = page || 1;
    pageSize = pageSize || 5;
    console.log("GetAllAddressesForEmp for EmpID ");
    $.ajax({
        url: '../api/addresses-employee/' + empID + '?page=' + page + '&pageSize=' + pageSize,
        type: 'GET',
        dataType: 'json',
        success: function (data, status, xhr) {
            WriteResponses(data, status, xhr);
        },
        error: function (x, y, z) {
            ShowMessageDialog('Error', 'I couldn\'t retrieve the data from the server. Let\'s try again please. ');
        }
    });

    function WriteResponses(data, status, xhr) {

        var pagedata = $.parseJSON(xhr.getResponseHeader("X-Pagination"));

        __LoadSlavegrid(data, pagedata);

        __SwitchAddressWindowToNewStatus('read', null);
    }
}

function __LoadPaginationDataOnPager(pager, flag, nextButton, prevButton, actualPage, totalPages, pageSize) {

    if (flag) {
        if (actualPage + 1 <= totalPages) {
            pager.data('nextpage', actualPage + 1)
            nextButton.removeClass('disabled').show();
        } else {
            pager.data('nextpage', '');
            nextButton.addClass('disabled').hide();
        }

        if (actualPage - 1 >= 1) {
            pager.data('prevpage', actualPage - 1);
            prevButton.removeClass('disabled').show();
        } else {
            pager.data('prevpage', '');
            prevButton.addClass('disabled').hide();
        }
    } else {
        pager.data('nextpage', '');
        nextButton.addClass('disabled').hide();

        pager.data('prevpage', '');
        prevButton.addClass('disabled').hide();
    }

    pager.data('totalpages', totalPages);
    pager.data('actualpage', actualPage);
    pager.data('pagesize', pageSize || pager.data('pagesize'));
}



// Load #slavegrid with 'No addrreses' msg or <table> with values&buttons (pager inc)
function __LoadSlavegrid(addresses, pagedata) {
    var detalles = "";

    if ((addresses == null) || (addresses.length == 0)) {
        detalles = "This Employee has no Addresses registered."
    } else {

        // Get basic info from addresses list
        var totalCount = addresses.length;
        var pageSize = $('.slave.pager').data('pagesize') || 5;
        var totalPages = Math.ceil((totalCount / pageSize));


        // Read pagination from pagedata and load the data into the pager.
        if (pagedata != null) {
            pageSize = pagedata.pageSize;
            totalPages = pagedata.totalPages;
            actualPage = pagedata.actualPage;

            __LoadPaginationDataOnPager($('.slave.pager'),
                true, $('.slave .btnnextpage'), $('.slave .btnprevpage'),
                actualPage, totalPages, pageSize);
        } else {
            __LoadPaginationDataOnPager($('.slave.pager'), false,
                $('.slave .btnnextpage'), $('.slave .btnprevpage'), 1, totalPages, pageSize);
        }

        console.log("LONGITUD DE DIRECCIONES" + addresses.length);

        // Build table
        detalles = "<table><th style='width:18%'></th>" +
                          "<th style='width:33%'>Street</th>" +
                          "<th style='width:15%'>Zip</th>" +
                          "<th style='width:17%'>City</th>" +
                          "<th style='width:17%'>State</th>";

        // only the first 'pageSize' elements 0=>pageSize-1
        $.each($(addresses).slice(0, pageSize), function (i, elem) {
            detalles += "<tr data-addid='" + elem.addID + "'>" +
                "<td class='rowbuttons'>" + $('.rowbuttons').html() + "</td>" +
                "<td>" + elem.addStreet + "</td>" +
                "<td>" + elem.addZip + "</td>" +
                "<td>" + elem.addCity + "</td>" +
                "<td>" + elem.addState + "</td>" +
                "</tr>";
        });
        detalles += "</table>";
    }

    $('#slavegrid').html(detalles);

    // Listeners for Actionbuttons: toolbar & rowbuttons
    $('.slave.toolbar').on('click', 'button', ClickOnAddresActionButton);
    $('#slavegrid .rowbuttons button').on('click', ClickOnAddresActionButton);

}



/* ************** ************** ************** *************
    Listeners for action buttons
** ************** ************** ************** *************/

// Click listener for employees actionbuttons
function ClickOnActionButton() {

    var button = $(this);
    var actualstatus = $('#status').data('status');
    var empid = ___GetEmpIDForButton(button);

    button.addClass('disabled');

    // perform activities for actual status
    switch (actualstatus) {
        case 'create': {
            if (button.hasClass('btnaccept')) {

                if (__ValidateEmployee() == 0) {
                    __BlockInputs(); // sec
                    PostEmployee();
                }
            } else if (button.hasClass('btncancel')) {
                __ResetToAll();
            }
            break;
        }
        case 'read':
            {
                if (button.hasClass('btncreate')) {
                    // Doesn't need to retrieve data.
                    __SwitchWindowToNewStatus('create', null);
                } else if (button.hasClass('btnupdate')) {
                    if (empid == null) {
                        ShowMessageDialog('Warning', 'You have to select first a EmpID to update');
                    } else {
                        // Retrieve data into the form  and change status to update
                        GetEmployee(empid, 'update');
                    }
                } else if (button.hasClass('btndelete')) {
                    if (empid == null) {
                        ShowMessageDialog('Warning', 'You have to select first a EmpID to delete');
                    } else {

                        // ==========================================
                        // DELETE ===================================
                        // ==========================================

                        var partialemp = { empID: empid };

                        __SwitchWindowToNewStatus('delete', partialemp);
                        if ($('#empID').val() != null) {
                            ShowConfirmDialog('Confirmation', 'Are you sure you want to delete the selected Employee?', 200, 320,
                            [{
                                text: 'Yes, delete',
                                click: function () {
                                    __BlockInputs(); // sec
                                    if ($('#empID').val() != null) {
                                        var todel = "" + $('#empID').val();

                                        DeleteEmployee(todel);
                                    }


                                    $(this).dialog("close");
                                },
                                class: 'btnaccept modal'
                            }, {
                                text: 'No, cancel',
                                click: function () {
                                    $(this).dialog("close");

                                    __ResetToAll();
                                },
                                class: 'btncancel modal'
                            }]);
                        }
                    }

                } else if (button.hasClass('btnnextpage')) {
                    var np = button.parent('.pager').data('nextpage');
                    var ps = button.parent('.pager').data('pagesize');
                    GetAllEmployees(np, ps);
                } else if (button.hasClass('btnprevpage')) {
                    var pp = button.parent('.pager').data('prevpage');
                    var ps = button.parent('.pager').data('pagesize');
                    GetAllEmployees(pp, ps);
                }
                break;
            }
        case 'update':
            {
                if (button.hasClass('btnaccept')) {
                    if (__ValidateEmployee() == 0) {
                        __BlockInputs(); // sec
                        PutEmployee();
                    }
                } else if (button.hasClass('btncancel')) {
                    GetEmployee(empid, 'read');
                }
                break;
            }
    }


}

// Click listener for addresses actionbuttons
function ClickOnAddresActionButton() {

    var button = $(this);
    var actualstatus = $('#addressstatus').data('status');
    var empID = parseInt($('#empID').val(), 10);
    var addID = ___GetAddIDForButton(button);
    var title = "";

    console.log('Clicked ' + button.html() + "\n" + actualstatus + " " + empID + ", " + addID);

    if (actualstatus == 'read') {


        {
            if (button.hasClass('btncreate')) {
                // ==========================================
                // CREATE ===================================
                // ==========================================

                if (empID == null) {
                    __SwitchAddressWindowToNewStatus('read', null);
                    ShowMessageDialog('Error', 'There was no Employee selected');
                    return;
                } else {
                    title = __SwitchAddressWindowToNewStatus('create', null);
                }
                ShowAddressForm(title, 'Save Address', 'Cancel',
                    function () {
                        if (__ValidateAddress() == 0) {
                            PostAddress(empID)
                            console.log('CREATE ACCEPT POSTED EMPID=' + empID + " ADDID=" + addID);
                            $(this).dialog("close");
                        }
                    },
                    function () {
                        $(this).dialog("close");
                        __SwitchAddressWindowToNewStatus('read', null);
                    }
                    );
            } else if (button.hasClass('btnupdate')) {

                // ==========================================
                // UPDATE ===================================
                // ==========================================

                if (empID == null) {
                    __SwitchAddressWindowToNewStatus('read', null);
                    ShowMessageDialog('Error', 'There was no Employee selected');
                    return;
                }

                // Internally called inside GetAddress
                // title = __SwitchAddressWindowToNewStatus('update', null);

                GetAddress(addID, 'update');

                ShowAddressForm('Updating address', 'Save Address', 'Cancel',
                    function () {
                        if (__ValidateAddress() == 0) {
                            PutAddress(empID)
                            console.log('UPDATE ACCEPT POSTED EMPID=' + empID + " ADDID=" + addID);
                            $(this).dialog("close");
                        }
                    },
                    function () {
                        $(this).dialog("close");
                        __SwitchAddressWindowToNewStatus('read', null);
                    }
                    );

            } else if (button.hasClass('btndelete')) {

                // ==========================================
                // DELETE ===================================
                // ==========================================

                var partialadd = { addID: addID };

                title = __SwitchAddressWindowToNewStatus('delete', partialadd);

                if (empID != null) {
                    ShowConfirmDialog(title, 'Are you sure you want to delete the selected address?', 200, 320,
                    [{
                        text: 'Yes, delete',
                        click: function () {

                            if ((empID != null) && (addID != null)) {
                                DeleteAddress(addID);
                            }
                            $(this).dialog("close");
                        },
                        class: 'btnaccept modal'
                    }, {
                        text: 'No, cancel',
                        click: function () {
                            $(this).dialog("close");

                            GetAllAddressesForEmp(empID);
                        },
                        class: 'btncancel modal'
                    }]);
                }

            } else if (button.hasClass('btnnextpage')) {
                var np = button.parent('.pager').data('nextpage');
                var ps = button.parent('.pager').data('pagesize');
                GetAllAddressesForEmp(empID, np, ps);
            } else if (button.hasClass('btnprevpage')) {
                var pp = button.parent('.pager').data('prevpage');
                var ps = button.parent('.pager').data('pagesize');
                GetAllAddressesForEmp(empID, pp, ps);
            }

        }

    }

}

// Reset Form to initial: #inputs disabled, status=read
function __ResetToAll() {
    __BlockInputs();
    var pagesize = $('.pager.master').data('pagesize');
    var page = $('.pager.master').data('actualpage');

    GetAllEmployees(page, pagesize);
    // Inside call after loading: __UpdateAllButtons('read');
}


/* *********************************************************
                HELPER FUNCTIONS 
***********************************************************/

// Update: #status, #inputs, buttons, detailsform
function __SwitchWindowToNewStatus(newStatus, employee) {

    // Avoid strange flashes because of the fadeOut properties
    $('.detailsform .error').stop().hide();

    switch (newStatus) {
        case 'create':
            __SwitchToNewStatus('create');
            __ConfigureInputsOnStatus('create', null);
            __UpdateAllButtons('create');
            __ShowEmployeeDetails(true);
            break;

        case 'read':
            __SwitchToNewStatus('read');
            __ConfigureInputsOnStatus('read', employee); // >> employee==null ? val('') : val(employee)
            __UpdateAllButtons('read');
            __ShowEmployeeDetails(employee); // >> if (employee) show();
            break;

        case 'update':

            __SwitchToNewStatus('update');
            __ConfigureInputsOnStatus('update', employee);
            __UpdateAllButtons('update');
            __ShowEmployeeDetails(true);
            break;

        case 'delete':
            // TODO
            __SwitchToNewStatus('delete');
            __ConfigureInputsOnStatus('delete', employee);
            __UpdateAllButtons('delete');
            __ShowEmployeeDetails(true);

            // Showdialog('You want to save the changes?',{accept: function(){}, cancel: function() {}})
            break;
        default: {

        }
    }
}

// Update: #status, #inputs, buttons, detailsform
function __SwitchAddressWindowToNewStatus(newStatus, address) {

    console.log('Nuevo estado: ' + newStatus + " con un address? " + (address != null) + ", I see: " + $('#addressstatus').data('status'));

    var title = __SwitchAddressFormToNewStatusGetTitle(newStatus);
    __ConfigureAddressInputsOnStatus(newStatus, address);

    switch (newStatus) {
        case 'read': {
            __UpdateAllButtons('read');
            $('#addressform').dialog("close");
            break;
        }
        case 'create':
        case 'update': {
            __UpdateAllButtons('address');

            break;
        }
        case 'delete': {
            __UpdateAllButtons('read');
            break;
        }
    }
    return title;
}

// Disable #inputs - sec method
function __BlockInputs() {
    $('#empID').attr('disabled', '');
    $('#empFirstName').attr('disabled', '');
    $('#empLastName').attr('disabled', '');
    $('#empAge').attr('disabled', '');
}



// Switch the #status field to New Status
function __SwitchToNewStatus(newStatus) {
    var status = $('#status');
    $('#status').data('status', newStatus);
    switch (newStatus) {
        case 'create':
            status.html('[Creating a new Employee...]');
            break;
        case 'update':
            status.html('[Updating an Employee...]');
            break;
        case 'delete':
            status.html('[Deleting an Employee...]');
            break;
        case 'read':
            status.html('');
            break;
        default:
            status.html('');
    }
}

// Switch status of the AddressForm and get title
function __SwitchAddressFormToNewStatusGetTitle(newStatus) {

    $('#addressstatus').data('status', newStatus);

    switch (newStatus) {
        case 'create':
            return "Create new address";
        case 'update':
            return "Update an address";
        case 'delete':
            return "Deleting an address";
        case 'read':
            return "I'm an Address";
        default:
            return "I'm an Address";
    }
}



// Dis/Enable, ValidListener, call LoadSlaveGrid and fill #fields on Status/Employee
function __ConfigureInputsOnStatus(status, employee) {
    switch (status) {
        case 'create':

            // Inputs - enabled, novalue, on('textInput input change focus', Validate)
            $('#empID').attr('disabled', '').val('').on(___eventsToListen, __ValidateEmployee);
            $('#empFirstName').removeAttr('disabled').val('').on(___eventsToListen, __ValidateEmployee);
            $('#empLastName').removeAttr('disabled').val('').on(___eventsToListen, __ValidateEmployee);
            $('#empAge').removeAttr('disabled').val('').on(___eventsToListen, __ValidateEmployee);

            // No Addresses
            __LoadSlavegrid(null);
            break;
        case 'update':
            // Inputs - enabled, filled with employee, onFocusOut(Validate)
            $('#empID').attr('disabled', '').val(employee.empID).on(___eventsToListen, __ValidateEmployee);
            $('#empFirstName').removeAttr('disabled').val(employee.empFirstName).on(___eventsToListen, __ValidateEmployee);
            $('#empLastName').removeAttr('disabled').val(employee.empLastName).on(___eventsToListen, __ValidateEmployee);
            $('#empAge').removeAttr('disabled').val(employee.empAge).on(___eventsToListen, __ValidateEmployee);

            // His addresses
            __LoadSlavegrid(employee.addresses);
            break;
        case 'delete':
            if (employee == null) {
                ShowMessageDialog('Error', 'There was no employee selected');
            } else {
                $('#empID').attr('disabled', '').off(___eventsToListen).val(employee.empID);
                $('#empFirstName').attr('disabled', '').off(___eventsToListen).val('');
                $('#empLastName').attr('disabled', '').off(___eventsToListen).val('');
                $('#empAge').attr('disabled', '').off(___eventsToListen).val('');
            }
            break;
        case 'read':
            if (employee == null) {
                // No Employee selected:: Inputs - disabled, noNewvalue
                $('#empID').attr('disabled', '').off(___eventsToListen);
                $('#empFirstName').attr('disabled', '').off(___eventsToListen);
                $('#empLastName').attr('disabled', '').off(___eventsToListen);
                $('#empAge').attr('disabled', '').off(___eventsToListen);

                __LoadSlavegrid(null);
            } else {
                // An Employee selected:: Inputs - disabled, filled with employee
                $('#empID').attr('disabled', '').val(employee.empID).off(___eventsToListen);
                $('#empFirstName').attr('disabled', '').val(employee.empFirstName).off(___eventsToListen);
                $('#empLastName').attr('disabled', '').val(employee.empLastName).off(___eventsToListen);
                $('#empAge').attr('disabled', '').val(employee.empAge).off(___eventsToListen);

                // His addresses
                __LoadSlavegrid(employee.addresses);
            }
            break;

    }

}

// Dis/Enable, ValidListener, call LoadSlaveGrid and fill #addressfields on Status/Address
function __ConfigureAddressInputsOnStatus(status, address) {

    switch (status) {
        case 'create':
            // Inputs - enabled, novalue, onFocusOut(Validate)
            $('#addID').attr('disabled', '').val('').on(___eventsToListen, __ValidateAddress);
            $('#addStreet').removeAttr('disabled').val('').on(___eventsToListen, __ValidateAddress)
            $('#addZip').removeAttr('disabled').val('').on(___eventsToListen, __ValidateAddress)
            $('#addCity').removeAttr('disabled').val('').on(___eventsToListen, __ValidateAddress)
            $('#addState').removeAttr('disabled').val('').on(___eventsToListen, __ValidateAddress)

            break;
        case 'update':
            // Inputs - enabled, filled with address, onFocusOut(Validate)
            $('#addID').attr('disabled', '').val(address.addID).on(___eventsToListen, __ValidateAddress);
            $('#addStreet').removeAttr('disabled').val(address.addStreet).on(___eventsToListen, __ValidateAddress)
            $('#addZip').removeAttr('disabled').val(address.addZip).on(___eventsToListen, __ValidateAddress)
            $('#addCity').removeAttr('disabled').val(address.addCity).on(___eventsToListen, __ValidateAddress)
            $('#addState').removeAttr('disabled').val(address.addState).on(___eventsToListen, __ValidateAddress)

            break;
        case 'read':
            $('#addID').attr('disabled', '').val('').on(___eventsToListen, __ValidateAddress);
            $('#addStreet').attr('disabled', '').val('').on(___eventsToListen, __ValidateAddress)
            $('#addZip').attr('disabled', '').val('').on(___eventsToListen, __ValidateAddress)
            $('#addCity').attr('disabled', '').val('').on(___eventsToListen, __ValidateAddress)
            $('#addState').attr('disabled', '').val('').on(___eventsToListen, __ValidateAddress)
            break;
        case 'delete':
            //TODO
            $('#addID').attr('disabled', '').val(address.addID).on(___eventsToListen, __ValidateAddress);

            // 
            break;

    }

}




// If showform hide detailsmsg and show form (and viceversa)
function __ShowEmployeeDetails(showform) {
    if (showform) {
        $('.detailsmsg').hide();
        $('.detailsform').show();
    } else {
        $('.detailsmsg').show();
        $('.detailsform').hide();
    }

}

// Update the visibility & enable of every button in the screen
function __UpdateAllButtons(newState) {

    newState = newState || $('#status').data('status');

    switch (newState) {

        case 'create':
        case 'update':
            // C&U: Hide Detailsform buttons, show Accept[disabled]&Cancel&Error, disable rest
            $('.detailsform .master button.btncreate').hide();
            $('.detailsform .master button.btnupdate').hide();
            $('.detailsform .master button.btndelete').hide();
            $('.btncreate').addClass('disabled');
            $('.btnupdate').addClass('disabled');
            $('.btndelete').addClass('disabled');
            $('.btnnextpage').addClass('disabled');
            $('.btnprevpage').addClass('disabled');

            $('.detailsform .master button.btnaccept').addClass('disabled').show();
            $('.detailsform .master button.btncancel').removeClass('disabled').show();
            $('#errorfield').show();

            break;
        case 'read':
            // R: Show Detailsform buttons, hide Accept&Cancel&Error, enable rest
            $('.detailsform .master button.btncreate').show();
            $('.detailsform .master button.btnupdate').show();
            $('.detailsform .master button.btndelete').show();
            $('.btncreate').removeClass('disabled');
            $('.btnupdate').removeClass('disabled');
            $('.btndelete').removeClass('disabled');
            $('.btnnextpage').removeClass('disabled');
            $('.btnprevpage').removeClass('disabled');

            $('.detailsform .master button.btnaccept').hide();
            $('.detailsform .master button.btncancel').hide();
            $('#errorfield').hide();
            break;

        case 'address':
        case 'delete':
            $('.detailsform .master button.btncreate').show();
            $('.detailsform .master button.btnupdate').show();
            $('.detailsform .master button.btndelete').show();
            $('.btncreate').addClass('disabled');
            $('.btnupdate').addClass('disabled');
            $('.btndelete').addClass('disabled');
            $('.btnnextpage').addClass('disabled');
            $('.btnprevpage').addClass('disabled');

            // just in case: detailsform accept, cancel and error hidden
            $('.detailsform .master button.btnaccept').hide();
            $('.detailsform .master button.btncancel').hide();
            $('#errorfield').hide();

            // The modal will have a .btnaccept and a .btncancel so, care.
            // TODO
            break;
    }
}

// Retrieve the closest empID related to this button (if exists):
function ___GetEmpIDForButton(button) {
    if (button.hasClass('btncreate')) {
        return '';
    } else {
        if (button.parent(':first').hasClass('rowbuttons')) {
            return button.parents('tr').data('empid');
        } else {
            return $('#empID').val();
        }
    }
}

// Retrieve the closest addID related to this button (if exists):
function ___GetAddIDForButton(button) {
    if (button.hasClass('btncreate')) {
        return '';
    } else {
        if (button.parent(':first').hasClass('rowbuttons')) {
            return button.parents('tr').data('addid');
        } else {
            // new feature maybe?
            return $('#addID').val();
        }
    }
}



/**************************************** 
                Validators 
*****************************************/

// Validates employee #fields, ifNoError enable OkButton, return 0
function __ValidateEmployee() {

    // only once per X sec
    if (Date.now() - ___listenerValidatorLastCheck > 15) {

        var errorfield = $('#errorfield');
        var errorWindow = errorfield.parents('.detailsform .error');
        var durErrorWindow = 8000;
        var status = $('#status').data('status');

        errorWindow.on('click', '', errorWindow, function () { $(this).stop().hide(); });
        errorfield.html('');

        var showErrorWin = function (msg) {
            errorWindow.removeClass('gone');
            console.log('Solicitado un show con: ' + msg);
            $('.detailsform .master button.btnaccept').addClass('disabled');

            if (msg.trim().length > 0) {               
                errorfield.html(msg);
                errorWindow.show().fadeOut(durErrorWindow);
            }
        }

        var id = "" + $('#empID').val();
        if ((id === '') && (status == 'create')) {
            id = 0;
            errorWindow.stop().hide();
        }

        var firstname = "" + $('#empFirstName').val();
        if ((typeof (firstname) != 'string') || (firstname.length <= 1)) {
            showErrorWin('Firstname is not a valid string');

            return -1;
        } else if ((firstname.length > 20)) {
            showErrorWin('I\'m sorry, but Firstname maximum length is 20.');

            return -1;
        }
        var lastname = "" + $('#empLastName').val();
        if ((typeof (lastname) != 'string') || (lastname.length <= 1)) {
            showErrorWin('Lastname is not a valid string');
            return -1;
        } else if ((lastname.length > 20)) {
            showErrorWin('I\'m sorry, but Lastname maximum length is 20.');
            return -1;
        }

        var age = $('#empAge').val();
        if (age.length <= 1) {
            showErrorWin('Age is not a valid number of years (16-100)');
            return -1;
        }
        age = parseInt(age, 10);
        if ((typeof (age) != 'number') || (age < 16) || (age > 100)) {
            showErrorWin('Age is not a valid number of years (16-100)');
            return -1;
        }

        if (errorfield.html() == "") {
            $('.detailsform .master button.btnaccept').removeClass('disabled');
            errorWindow.stop().hide();
            return 0;
        } else {
            // Error status, but another sec step.
            
            $('.detailsform .master button.btnaccept').addClass('disabled');
            return -1;
        }
        ___listenerValidatorLastCheck = Date.now();
    }
}

// TODO
//  Validates the addreses Fields
function __ValidateAddress() {
    if (Date.now() - ___listenerValidatorLastCheck > 50) {

        var errorfield = $('#erraddmsg');
        var errorWindow = errorfield.parents('.addressform .error');
        var durErrorWindow = 5000;

        errorWindow.on('click', '', errorWindow, function () { $(this).stop().hide(); });
        errorfield.html('');

        var showErrorWin = function (msg) {
            $('button.btnaccept.modal').addClass('disabled');
            console.log('mostrando' + msg + '!');
            if (msg.length > 0) {
                
                errorfield.html(msg);
                errorWindow.stop(false,true).show().fadeOut(msg.length >0 ? durErrorWindow: 1);
            }
        }

        var empID = "" + $('#empID').val();
        if ((empID === '') && ($('#status').data('status') == 'create')) {
            empID = -1;
        }

        $('#erraddmsg').html('');

        var addID = $('#addID').val();
        var addStreet = $('#addStreet').val();
        var addZip = parseInt($('#addZip').val(), 10);
        var addCity = $('#addCity').val();
        var addState = $('#addState').val();

        if ((addID === '') && ($('#addressstatus').data('status') == 'create')) {
            addID = 0;
        } else if ((addID === '') && ($('#addressstatus').data('status') == 'update')) {
            showErrorWin('You have to select valid employee-address values.');
            return -1;
        } else {
            addID = parseInt(addID, 10);
        }


        if ((typeof (addStreet) != 'string') || (addStreet.length <= 1)) {
            showErrorWin('Street is not a valid string');
            return -1;
        } else if ((addStreet.length > 60)) {
            showErrorWin('I\'m sorry, but Street maximum length is 60.');
            return -1;
        }



        if (isNaN(addZip)) {
            showErrorWin('Zip should be a number.');
            return -1;
        }
        if (addZip.toString().length < 3) {
            showErrorWin('Zip is supposed to be at least 3 numbers long');
            return -1;
        }


        if ((typeof (addCity) != 'string') || (addCity.length <= 1)) {
            showErrorWin('City is not a valid string');
            return -1;
        } else if ((addCity.length > 60)) {
            showErrorWin('I\'m sorry, but City maximum length is 15.');
            return -1;
        }



        if ((typeof (addState) != 'string') || (addState.length <= 1)) {
            showErrorWin('State is not a valid string');
            return -1;
        } else if ((addState.length > 15)) {
            showErrorWin('I\'m sorry, but State maximum length is 15.');
            return -1;
        }


        if (errorfield.html() == "") {
            $('button.btnaccept.modal').removeClass('disabled');
            errorWindow.stop(true,true).hide();
            return 0;
        } else {
            // Error status, but another sec step.
            $('button.btnaccept.modal').addClass('disabled');
            
            return -1;
        }
        ___listenerValidatorLastCheck = Date.now();
    }
}



/**************************************** ******* ******* ******* 
    SELECT an employee from the Grid and get his info
******************************************* ******* ******* *****/

// Call via a EmployeeRowEvent! Select visually and retrieve its data
function SelectEmployee() {
    var row = $(this).parent('tr');

    if ($('#status').data('status') != 'read') {

        // NO read mode
        if (row.data('empid') != undefined) {
            if (row.data('empid') == $('#empID').val()) {

                row.addClass('selected');
                __ShowEmployeeDetails(true);
                return;
            } else {
                // Showdialog('You want to save the changes?',{accept: function(){}, cancel: function() {}})
            }
        }


        return;
    } else {

        // READ MODE
        if (row.hasClass('selected')) {
            row.toggleClass('selected');
            __ShowEmployeeDetails(false);

        } else {
            row.siblings('.selected').removeClass('selected');
            row.addClass('selected');
            GetEmployee(row.data('empid'), 'read');
        }
    }


}


/**************************************** ******* ******* ******* 
          GET ajax call (need empID, default status: read)
******************************************* ******* ******* *****/
function GetEmployee(empID, status) {
    status = status || "read";

    jQuery.support.cors = true;

    $.ajax({
        url: '../api/employees/' + empID,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            WriteResponse(data);
            $('#slavegrid .rowbuttons button').on('click', ClickOnAddresActionButton);
        },
        error: function (x, y, z) {
            ShowMessageDialog('Warning', 'I could not find the solicited employee.');
        }
    });

    function WriteResponse(employee) {

        __SwitchWindowToNewStatus(status, employee);
    }
}


/**************************************** ******* ******* ******* 
             POST ajax call (take info from form)
******************************************* ******* ******* *****/
function PostEmployee() {
    if (__ValidateEmployee() != 0)
        return;

    var employee = {
        empFirstName: $('input#empFirstName').val(),
        empLastName: $('input#empLastName').val(),
        empAge: parseInt($('input#empAge').val(), 10)
    };

    // Clean inputs just in case it gets stuck
    $('input#empFirstName').off(___eventsToListen).val('');
    $('input#empLastName').off(___eventsToListen).val('');
    $('input#empAge').off(___eventsToListen).val('');

    $.ajax({
        url: '../api/employees',
        type: 'POST',
        data: JSON.stringify(employee),
        contentType: "application/json",
        success: function (data) {
            if (data != null) {
                ShowMessageDialog('Information', 'Employee added succesfully.');
                GetEmployee(data.empID, 'read');
            }
        },
        error: function (xhr, error) {

            __SwitchWindowToNewStatus('create', null);
            // Restore fields
            $('input#empFirstName').val(employee.empFirstName);
            $('input#empLastName').val(employee.empLastName);
            $('input#empAge').val(employee.empAge);

            ShowMessageDialog('Warning', 'Employee couldn\'t be added. Something went wrong. Let\'s try again please.');
        }
    });
}


/**************************************** ******* ******* ******* 
                    PUT ajax call (take info from form)
******************************************* ******* ******* *****/
function PutEmployee() {
    if (__ValidateEmployee() != 0)
        return;

    var employee = {
        empID: parseInt($('input#empID').val(), 10),
        empFirstName: $('input#empFirstName').val(),
        empLastName: $('input#empLastName').val(),
        empAge: parseInt($('input#empAge').val(), 10)
    };

    // Clean inputs just in case it gets stuck
    $('input#empID').off(___eventsToListen).val('');
    $('input#empFirstName').off(___eventsToListen).val('');
    $('input#empLastName').off(___eventsToListen).val('');
    $('input#empAge').off(___eventsToListen).val('');

    $.ajax({
        url: '../api/employees/' + employee.empID,
        type: 'PUT',
        data: JSON.stringify(employee),
        contentType: "application/json",
        success: function (data) {
            ShowMessageDialog('Information', 'Employee updated succesfully.');
            __ResetToAll();

            setTimeout(function () {
                GetEmployee(employee.empID, 'read');
            }, 500);
        },
        error: function (xhr, error) {
            ShowMessageDialog('Warning', 'Employee couldn\'t be updated. Something went wrong. Let\'s try again please.');

            // Restore fields
            $('input#empID').val(employee.empID);
            $('input#empFirstName').val(employee.empFirstName);
            $('input#empLastName').val(employee.empLastName);
            $('input#empAge').val(employee.empAge);

        }
    });
}


/**************************************** ******* ******* ******* 
            DELETE ajax call (need an empID)
******************************************* ******* ******* *****/
function DeleteEmployee(entID) {

    jQuery.support.cors = true;

    $.ajax({
        url: '../api/employees/' + parseInt(entID, 10),
        type: 'DELETE',
        dataType: 'json',
        success: function (data) {
            ShowMessageDialog('Information', 'Employee was deleted.');
            __ResetToAll();
        },
        error: function (x, y, z) {
            ShowMessageDialog('Warning', 'Employee couldn\'t be deleted. Maybe he wasn\'t there on the first place? Let\'s try again please.');
            __ResetToAll();
        }
    });

}






/**************************************** ******* ******* ******* 
          Address GET ajax call (need addID, default status: read)
******************************************* ******* ******* *****/
function GetAddress(addID, status) {
    status = status || "read";

    jQuery.support.cors = true;

    $.ajax({
        url: '../api/addresses/' + addID,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            WriteResponse(data);
        },
        error: function (x, y, z) {
            ShowMessageDialog('Warning', 'I could not find the solicited address.');
            __SwitchAddressWindowToNewStatus('read', null);
        }
    });

    function WriteResponse(address) {
        // GetEmployee(parseInt($('#empID').val(), 10), 'read');
        __SwitchAddressWindowToNewStatus(status, address);
    }
}



/**************************************** ******* ******* ******* 
             POST address ajax call (take info from form)
******************************************* ******* ******* *****/
function PostAddress(empID) {
    if (__ValidateAddress() != 0)
        return;

    var address = {
        addStreet: $('input#addStreet').val(),
        addZip: parseInt($('input#addZip').val(), 10),
        addCity: $('input#addCity').val(),
        addState: $('input#addState').val(),
        empID: empID
    };

    // Clean inputs just in case it gets stuck
    $('input#addStreet').off(___eventsToListen).val('');
    $('input#addZip').off(___eventsToListen).val('');
    $('input#addCity').off(___eventsToListen).val('');
    $('input#addState').off(___eventsToListen).val('');

    $.ajax({
        url: '../api/addresses',
        type: 'POST',
        data: JSON.stringify(address),
        contentType: "application/json",
        success: function (data) {
            if (data != null) {
                ShowMessageDialog('Information', 'Address added succesfully.');

                setTimeout(function () {
                    GetAllAddressesForEmp(empID);
                }, 100);
            }
        },

        error: function (xhr, error) {
            setTimeout(function () {
                __SwitchAddressWindowToNewStatus('create', null);

                // Restore fields
                $('input#addStreet').val(address.addStreet);
                $('input#addZip').val(address.addZip);
                $('input#addCity').val(address.addCity);
                $('input#addState').val(address.addState);

                ShowMessageDialog('Warning', 'Address couldn\'t be added. Something went wrong. Let\'s try again please.');
            }, 100);


        }
    });
}


/**************************************** ******* ******* ******* 
            PUT Address ajax call (take info from form)
******************************************* ******* ******* *****/
function PutAddress(empID) {
    if (__ValidateAddress() != 0)
        return;

    var address = {
        addID: parseInt($('input#addID').val(), 10),
        addStreet: $('input#addStreet').val(),
        addZip: parseInt($('input#addZip').val(), 10),
        addCity: $('input#addCity').val(),
        addState: $('input#addState').val(),
        empID: empID
    };



    // Clean inputs just in case it gets stuck
    $('input#addID').off(___eventsToListen).val('');
    $('input#addStreet').off(___eventsToListen).val('');
    $('input#addZip').off(___eventsToListen).val('');
    $('input#addCity').off(___eventsToListen).val('');
    $('input#addState').off(___eventsToListen).val('');


    $.ajax({
        url: '../api/addresses/' + address.addID,
        type: 'PUT',
        data: JSON.stringify(address),
        contentType: "application/json",
        success: function (data) {

            ShowMessageDialog('Information', 'Address updated succesfully.');

            setTimeout(function () {
                GetAllAddressesForEmp(empID);
            }, 100);
        },
        error: function (xhr, error) {
            ShowMessageDialog('Warning', 'Employee couldn\'t be updated. Something went wrong. Let\'s try again please.');

            // Restore fields
            $('input#addID').val(address.addID);
            $('input#addStreet').val(address.addStreet);
            $('input#addZip').val(address.addZip);
            $('input#addCity').val(address.addCity);
            $('input#addState').val(address.addState);

        }
    });
}



/**************************************** ******* ******* ******* 
            DELETE address ajax call (need an empID)
******************************************* ******* ******* *****/
function DeleteAddress(addID) {

    jQuery.support.cors = true;

    $.ajax({
        url: '../api/addresses/' + parseInt(addID, 10),
        type: 'DELETE',
        dataType: 'json',
        success: function (data) {
            ShowMessageDialog('Information', 'Address was deleted.');
            GetAllAddressesForEmp(parseInt($('#empID').val(), 10));
        },
        error: function (x, y, z) {
            ShowMessageDialog('Warning', 'Address couldn\'t be deleted. Maybe he wasn\'t there on the first place? Let\'s try again please.');
            GetAllAddressesForEmp(parseInt($('#empID').val(), 10));
        }
    });

}






/**************************************** ******* ******* ******* 
            MODAL WINDOWS (using jQuery UI)
******************************************* ******* ******* *****/



function ShowConfirmDialog(title, message, height, width, buttons) {
    var dialog = $("#dialog-confirm");

    dialog.prop('title', title);
    dialog.find('.message').html(message);
    dialog.dialog({
        resizable: false,
        height: height,
        width: width,
        modal: true,
        closeOnEscape: false,
        beforeclose: function (event, ui) { return false; },
        dialogClass: "noclose",
        buttons: buttons
    });
    dialog.dialog("open");
}

// ShowMessageDialog('Information','Something');
function ShowMessageDialog(title, message, height, width, buttons) {
    var dialog = $("#dialog-confirm");
    height = height || 200;
    width = width || 320;
    buttons = buttons || [{
        text: 'ok',
        click: function () {
            $(this).dialog("close");
        },
        class: 'modal'
    }];

    //ShowConfirmDialog('Prueba1', 'Message', 300, 500,
    //[{
    //    text: 'ok',
    //    click: function () {
    //        $(this).dialog("close");
    //    },
    //    class: 'btnaccept modal'
    //}]
    //);


    dialog.prop('title', title);
    dialog.find('.message').html(message);
    dialog.dialog({
        resizable: false,
        height: height,
        width: width,
        modal: true,
        buttons: buttons
    });
    dialog.dialog("open");
}

// Create address
// Update address
// Delete >>>> confirm
function ShowAddressForm(title, buttonAccept, buttonCancel, functionAccept, functionCancel) {
    var dialog = $(".addressform");

    dialog.prop('title', title);


    // Give an ID attribute to the 'Ok' Button.
    $('.ui-dialog-buttonpane button:contains(Ok)').attr("id", "dialog-confirm_ok-button");

    dialog.dialog({
        resizable: false,
        height: 350,
        width: 320,
        modal: true,
        closeOnEscape: false,
        beforeclose: function (event, ui) { return false; },
        dialogClass: "noclose",

        buttons: [{
            text: buttonAccept,
            class: 'btnaccept modal disabled',
            click: functionAccept
        }, {
            text: buttonCancel,
            class: 'modal btncancel',
            click: functionCancel
        }]
    });
    //console.log('Listeners preparados.');
    //console.log($('.ui-dialog-buttonpane button.btnaccept.modal:contains(' + buttonAccept + ')').html());
    //var btnaccept = $('.ui-dialog-buttonpane button.btnaccept.modal:contains(' + buttonAccept + ')');
    //btnaccept.on('masterclick', ClickOnAddresActionButton).on('click', function () { btnaccept.modal.dialog('close'); console.log('acpt click'); btnaccept.trigger('masterclick'); });
    //var btncancel = $('.ui-dialog-buttonpane button.btncancel.modal:contains(' + buttonCancel + ')');
    //btncancel.on('masterclick', ClickOnAddresActionButton).on('click', function () { console.log(btncancel); btncancel.modal.dialog('close'); console.log('Cancel click'); $(this).trigger('masterclick'); });
    //console.log('Listeners fijados.');

    dialog.dialog("open");

}

$('.master.toolbar button').on('click', ClickOnActionButton);