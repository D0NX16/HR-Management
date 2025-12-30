$(function () {
    "use strict";
    $('.counter').counterUp({
        delay: 10,
        time: 1000
    });

    function getRandomValues() {
        // data setup
        var values = new Array(20);

        for (var i = 0; i < values.length; i++) {
            values[i] = [5 + randomVal(), 10 + randomVal(), 15 + randomVal(), 20 + randomVal(), 30 + randomVal(),
            35 + randomVal(), 40 + randomVal(), 45 + randomVal(), 50 + randomVal()
            ];
        }

        return values;
    }
    function randomVal() {
        return Math.floor(Math.random() * 80);
    }

    // MINI BAR CHART
    var values2 = getRandomValues();
    var paramsBar = {
        type: 'bar',
        barWidth: 5,
        height: 25,
    };

    $('#mini-bar-chart1').sparkline(values2[0], paramsBar);
    paramsBar.barColor = '#6c757d';
    $('#mini-bar-chart2').sparkline(values2[1], paramsBar);
    paramsBar.barColor = '#6c757d';
    $('#mini-bar-chart3').sparkline(values2[2], paramsBar);
    paramsBar.barColor = '#6c757d';
    $('#mini-bar-chart4').sparkline(values2[3], paramsBar);
    paramsBar.barColor = '#6c757d';

});

document.addEventListener('DOMContentLoaded', function () {
    const addEmployeeModal = document.getElementById('exampleModal');
    const saveChangesBtn = addEmployeeModal.querySelector('.modal-footer .btn-primary');

    // Initialize datepickers
    $(function () {
        $('[data-provide="datepicker"]').datepicker({
            format: 'yyyy-mm-dd', // Ensure consistent date format for backend
            autoclose: true
        });
    });

    saveChangesBtn.addEventListener('click', async function () {
        // Collect form data using the new IDs
        const formData = {
            email: addEmployeeModal.querySelector('#employeeEmail').value,
            branch: addEmployeeModal.querySelector('#employeeBranch').value,
            employee_id: addEmployeeModal.querySelector('#employeeId').value,
            employee_name: addEmployeeModal.querySelector('#employeeName').value,
            caller_name: addEmployeeModal.querySelector('#callerName').value,
            date_of_joining: addEmployeeModal.querySelector('#dateOfJoining').value,
            dob: addEmployeeModal.querySelector('#employeeDob').value,
            designation: addEmployeeModal.querySelector('#designation').value,
            department: addEmployeeModal.querySelector('#department').value,
            marital_status: addEmployeeModal.querySelector('#maritalStatus').value,
            blood_group: addEmployeeModal.querySelector('#bloodGroup').value,
            contact_number: addEmployeeModal.querySelector('#contactNumber').value,
            alternate_phone_number: addEmployeeModal.querySelector('#alternatePhoneNumber').value,
            official_phone_number: addEmployeeModal.querySelector('#officialPhoneNumber').value,
            personal_mail_id: addEmployeeModal.querySelector('#personalMailId').value,
            official_mail_id: addEmployeeModal.querySelector('#officialMailId').value,
            permanent_address: addEmployeeModal.querySelector('#permanentAddress').value,
            temporary_address: addEmployeeModal.querySelector('#temporaryAddress').value,
            emergency_contact_person_name: addEmployeeModal.querySelector('#emergencyContactPersonName').value,
            relationship_with_employee: addEmployeeModal.querySelector('#emergencyRelationship').value, // Matches backend expected name
            emergency_contact_person_phone_number: addEmployeeModal.querySelector('#emergencyPhoneNumber').value,
            employee_nominee_name: addEmployeeModal.querySelector('#employeeNomineeName').value,
            nominee_dob: addEmployeeModal.querySelector('#nomineeDob').value,
            nominee_relationship_with_employee: addEmployeeModal.querySelector('#nomineeRelationship').value, // Matches backend expected name
            father_name: addEmployeeModal.querySelector('#fatherName').value,
            father_dob: addEmployeeModal.querySelector('#fatherDob').value,
            father_phone_number: addEmployeeModal.querySelector('#fatherPhoneNumber').value,
            mother_name: addEmployeeModal.querySelector('#motherName').value,
            mother_dob: addEmployeeModal.querySelector('#motherDob').value,
            mother_phone_number: addEmployeeModal.querySelector('#motherPhoneNumber').value,
            spouse_name: addEmployeeModal.querySelector('#spouseName').value,
            spouse_dob: addEmployeeModal.querySelector('#spouseDob').value,
            spouse_phone_number: addEmployeeModal.querySelector('#spousePhoneNumber').value,
            child1_name: addEmployeeModal.querySelector('#child1Name').value,
            child1_dob: addEmployeeModal.querySelector('#child1Dob').value,
            child2_name: addEmployeeModal.querySelector('#child2Name').value,
            child2_dob: addEmployeeModal.querySelector('#child2Dob').value,
            epf_no: addEmployeeModal.querySelector('#epfNo').value,
            esic_no: addEmployeeModal.querySelector('#esicNo').value,
            bank_name_branch: addEmployeeModal.querySelector('#bankNameBranch').value,
            account_number: addEmployeeModal.querySelector('#accountNumber').value,
            ifsc_number: addEmployeeModal.querySelector('#ifscNumber').value,
            net_take_home_salary: addEmployeeModal.querySelector('#netTakeHomeSalary').value,
            upload_documents: addEmployeeModal.querySelector('#uploadDocuments').value
        };

        // Improved Client-side validation for required fields
        const requiredFields = [
            'employee_id', 'employee_name', 'email', 'date_of_joining', 'dob',
            'branch', 'designation', 'department', 'contact_number', 'personal_mail_id',
            'permanent_address', 'temporary_address', 'emergency_contact_person_name',
            'relationship_with_employee', 'emergency_contact_person_phone_number',
            'employee_nominee_name', 'nominee_dob', 'nominee_relationship_with_employee',
            'father_name', 'father_dob', 'father_phone_number', 'mother_name',
            'mother_dob', 'mother_phone_number',
            'bank_name_branch', 'account_number', 'ifsc_number', 'net_take_home_salary',
            'marital_status', 'blood_group' // Added marital status and blood group
        ];

        for (const field of requiredFields) {
            if (!formData[field] || String(formData[field]).trim() === '' || formData[field] === 'Select') { // Check for 'Select' option
                alert(`Please fill in the required field: ${field.replace(/_/g, ' ')}.`);
                // Optionally, highlight the field
                addEmployeeModal.querySelector(`#${field.replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`).focus(); // Basic attempt to focus
                return; // Stop submission
            }
        }

        try {
            const response = await fetch('http://localhost:3000/api/employees', { // Adjust port if different
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                $('#exampleModal').modal('hide'); // Close the modal
                location.reload(); // Simple refresh to show changes
            } else {
                alert('Error: ' + (result.error || 'Something went wrong on the server.'));
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Failed to connect to the server. Please check your network connection and server status.');
        }
    });
});
$(function () {
    $('[data-provide="datepicker"]').datepicker({
        format: 'yyyy-mm-dd', // Crucial for database compatibility
        autoclose: true
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const addEmployeeModal = document.getElementById('exampleModal');
    const saveChangesBtn = addEmployeeModal.querySelector('.modal-footer .btn-primary');
    const employeeTableBody = document.querySelector('#Employee-list tbody'); // Ensure this ID/selector is correct

    // Variables to manage current employee being edited/viewed
    let currentEmployeeId = null;
    let isEditMode = false; // Flag to distinguish between add and edit

    // Initialize datepickers
    $(function () {
        $('[data-provide="datepicker"]').datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true
        });
    });

    // Function to fetch and render employees
    async function fetchAndRenderEmployees() {
        try {
            const response = await fetch('http://localhost:3000/api/employees');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const employees = await response.json();
            employeeTableBody.innerHTML = ''; // Clear existing rows

            employees.forEach((employee, index) => {
                const row = `
                        <tr>
                            <td class="d-flex">
                                <span class="avatar avatar-blue" data-toggle="tooltip" title="" data-original-title="${employee.employee_name}">${employee.employee_name.charAt(0).toUpperCase()}${employee.employee_name.split(' ').length > 1 ? employee.employee_name.split(' ')[1].charAt(0).toUpperCase() : ''}</span>
                                <div class="ml-3">
                                    <h6 class="mb-0">${employee.employee_name}</h6>
                                    <span class="text-muted">${employee.email}</span>
                                </div>
                            </td>
                            <td><span>${employee.employee_id}</span></td>
                            <td><span>${employee.phone}</span></td>
                            <td>${employee.role}</td>
                            <td>
                                <button type="button" class="btn btn-icon btn-sm view-employee" title="View" data-employee-id="${employee.employee_id}"><i class="fa fa-eye"></i></button>
                                <button type="button" class="btn btn-icon btn-sm edit-employee" title="Edit" data-employee-id="${employee.employee_id}"><i class="fa fa-edit"></i></button>
                                <button type="button" class="btn btn-icon btn-sm delete-employee js-sweetalert" title="Delete" data-type="confirm" data-employee-id="${employee.employee_id}"><i class="fa fa-trash-o text-danger"></i></button>
                            </td>
                        </tr>
                    `;
                employeeTableBody.insertAdjacentHTML('beforeend', row);
            });
        } catch (error) {
            console.error('Error fetching employees:', error);
            alert('Failed to load employee data.');
        }
    }

    // Load employees when the page loads
    fetchAndRenderEmployees();

    // Function to populate the modal with employee data
    function populateModal(employeeData) {
        document.getElementById('employeeEmail').value = employeeData.email || '';
        document.getElementById('employeeBranch').value = employeeData.branch || 'Select';
        document.getElementById('employeeId').value = employeeData.employee_id || '';
        document.getElementById('employeeName').value = employeeData.employee_name || '';
        document.getElementById('callerName').value = employeeData.caller_name || '';
        document.getElementById('dateOfJoining').value = employeeData.date_of_joining || '';
        document.getElementById('employeeDob').value = employeeData.dob || '';
        document.getElementById('designation').value = employeeData.designation || '';
        document.getElementById('department').value = employeeData.department || '';
        document.getElementById('maritalStatus').value = employeeData.marital_status || 'UnMarried'; // Default
        document.getElementById('bloodGroup').value = employeeData.blood_group || '';
        document.getElementById('contactNumber').value = employeeData.phone || ''; // Using 'phone' from joined data
        document.getElementById('alternatePhoneNumber').value = employeeData.alternate_phone_number || '';
        document.getElementById('officialPhoneNumber').value = employeeData.official_phone_number || '';
        document.getElementById('personalMailId').value = employeeData.personal_mail_id || '';
        document.getElementById('officialMailId').value = employeeData.official_mail_id || '';
        document.getElementById('permanentAddress').value = employeeData.permanent_address || '';
        document.getElementById('temporaryAddress').value = employeeData.temporary_address || '';
        document.getElementById('emergencyContactPersonName').value = employeeData.emergency_contact_person_name || '';
        document.getElementById('emergencyRelationship').value = employeeData.relationship_with_employee || '';
        document.getElementById('emergencyPhoneNumber').value = employeeData.emergency_contact_phone_number || '';
        document.getElementById('employeeNomineeName').value = employeeData.employee_nominee_name || '';
        document.getElementById('nomineeDob').value = employeeData.nominee_dob || '';
        document.getElementById('nomineeRelationship').value = employeeData.nominee_relationship_with_employee || '';
        document.getElementById('fatherName').value = employeeData.father_name || '';
        document.getElementById('fatherDob').value = employeeData.father_dob || '';
        document.getElementById('fatherPhoneNumber').value = employeeData.father_phone_number || '';
        document.getElementById('motherName').value = employeeData.mother_name || '';
        document.getElementById('motherDob').value = employeeData.mother_dob || '';
        document.getElementById('motherPhoneNumber').value = employeeData.mother_phone_number || '';
        document.getElementById('spouseName').value = employeeData.spouse_name || '';
        document.getElementById('spouseDob').value = employeeData.spouse_dob || '';
        document.getElementById('spousePhoneNumber').value = employeeData.spouse_phone_number || '';
        document.getElementById('child1Name').value = employeeData.child1_name || '';
        document.getElementById('child1Dob').value = employeeData.child1_dob || '';
        document.getElementById('child2Name').value = employeeData.child2_name || '';
        document.getElementById('child2Dob').value = employeeData.child2_dob || '';
        document.getElementById('epfNo').value = employeeData.epf_no || '';
        document.getElementById('esicNo').value = employeeData.esic_no || '';
        document.getElementById('bankNameBranch').value = employeeData.bank_name_branch || '';
        document.getElementById('accountNumber').value = employeeData.account_number || '';
        document.getElementById('ifscNumber').value = employeeData.ifsc_number || '';
        document.getElementById('netTakeHomeSalary').value = employeeData.net_take_home_salary || '';
        document.getElementById('uploadDocuments').value = employeeData.upload_documents || '';
    }

    // Function to clear modal fields
    function clearModal() {
        const inputs = addEmployeeModal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.tagName === 'SELECT') {
                input.value = input.options[0].value; // Reset select to first option
            } else {
                input.value = '';
            }
        });
        document.getElementById('employeeBranch').value = 'Select'; // Explicitly set for Branch
        document.getElementById('maritalStatus').value = 'UnMarried'; // Explicitly set for Marital Status
    }

    // Event listener for "Add" button to open modal in add mode
    document.querySelector('.header-action button[data-target="#exampleModal"]').addEventListener('click', function () {
        clearModal();
        isEditMode = false;
        currentEmployeeId = null;
        addEmployeeModal.querySelector('.modal-title').textContent = 'Add Employee';
        saveChangesBtn.textContent = 'Save changes';
        // Enable employee ID for new entry
        document.getElementById('employeeId').removeAttribute('readonly');
        // Make all fields editable for adding
        const inputs = addEmployeeModal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.removeAttribute('readonly'));
    });

    // Event listener for "View" buttons
    employeeTableBody.addEventListener('click', async function (event) {
        if (event.target.closest('.view-employee')) {
            const employeeId = event.target.closest('.view-employee').dataset.employeeId;
            try {
                const response = await fetch(`http://localhost:3000/api/employees`); // Fetch all to find the one
                if (!response.ok) throw new Error('Failed to fetch employee for viewing');
                const employees = await response.json();
                const employeeToView = employees.find(emp => emp.employee_id === employeeId);

                if (employeeToView) {
                    populateModal(employeeToView);
                    addEmployeeModal.querySelector('.modal-title').textContent = `View Employee: ${employeeToView.employee_name}`;
                    saveChangesBtn.style.display = 'none'; // Hide save button for view
                    // Make all fields read-only for view mode
                    const inputs = addEmployeeModal.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => input.setAttribute('readonly', 'readonly'));
                    $('#exampleModal').modal('show');
                } else {
                    alert('Employee not found!');
                }
            } catch (error) {
                console.error('Error viewing employee:', error);
                alert('Failed to retrieve employee details.');
            }
        }
    });

    // Event listener for "Edit" buttons
    employeeTableBody.addEventListener('click', async function (event) {
        if (event.target.closest('.edit-employee')) {
            const employeeId = event.target.closest('.edit-employee').dataset.employeeId;
            try {
                const response = await fetch(`http://localhost:3000/api/employees`); // Fetch all to find the one
                if (!response.ok) throw new Error('Failed to fetch employee for editing');
                const employees = await response.json();
                const employeeToEdit = employees.find(emp => emp.employee_id === employeeId);

                if (employeeToEdit) {
                    populateModal(employeeToEdit);
                    isEditMode = true;
                    currentEmployeeId = employeeId;
                    addEmployeeModal.querySelector('.modal-title').textContent = `Edit Employee: ${employeeToEdit.employee_name}`;
                    saveChangesBtn.textContent = 'Update changes';
                    saveChangesBtn.style.display = 'block'; // Show save button for edit
                    // Disable employee ID field when editing
                    document.getElementById('employeeId').setAttribute('readonly', 'readonly');
                    // Make all other fields editable
                    const inputs = addEmployeeModal.querySelectorAll('input:not(#employeeId), select, textarea');
                    inputs.forEach(input => input.removeAttribute('readonly'));
                    $('#exampleModal').modal('show');
                } else {
                    alert('Employee not found!');
                }
            } catch (error) {
                console.error('Error fetching employee for edit:', error);
                alert('Failed to retrieve employee details for editing.');
            }
        }
    });

    // Event listener for "Delete" buttons
    employeeTableBody.addEventListener('click', async function (event) {
        if (event.target.closest('.delete-employee')) {
            const employeeId = event.target.closest('.delete-employee').dataset.employeeId;
            if (confirm(`Are you sure you want to delete employee ID: ${employeeId}? This action cannot be undone.`)) {
                try {
                    const response = await fetch(`http://localhost:3000/api/employees/${employeeId}`, {
                        method: 'DELETE',
                    });

                    const result = await response.json();

                    if (response.ok) {
                        alert(result.message);
                        fetchAndRenderEmployees(); // Refresh the list
                    } else {
                        alert('Error: ' + (result.error || 'Failed to delete employee.'));
                    }
                } catch (error) {
                    console.error('Network error during delete:', error);
                    alert('Failed to connect to the server or network error.');
                }
            }
        }
    });

    // Event listener for modal's "Save/Update changes" button
    saveChangesBtn.addEventListener('click', async function () {
        const formData = {
            email: addEmployeeModal.querySelector('#employeeEmail').value,
            branch: addEmployeeModal.querySelector('#employeeBranch').value,
            employee_id: addEmployeeModal.querySelector('#employeeId').value,
            employee_name: addEmployeeModal.querySelector('#employeeName').value,
            caller_name: addEmployeeModal.querySelector('#callerName').value,
            date_of_joining: addEmployeeModal.querySelector('#dateOfJoining').value,
            dob: addEmployeeModal.querySelector('#employeeDob').value,
            designation: addEmployeeModal.querySelector('#designation').value,
            department: addEmployeeModal.querySelector('#department').value,
            marital_status: addEmployeeModal.querySelector('#maritalStatus').value,
            blood_group: addEmployeeModal.querySelector('#bloodGroup').value,
            contact_number: addEmployeeModal.querySelector('#contactNumber').value,
            alternate_phone_number: addEmployeeModal.querySelector('#alternatePhoneNumber').value,
            official_phone_number: addEmployeeModal.querySelector('#officialPhoneNumber').value,
            personal_mail_id: addEmployeeModal.querySelector('#personalMailId').value,
            official_mail_id: addEmployeeModal.querySelector('#officialMailId').value,
            permanent_address: addEmployeeModal.querySelector('#permanentAddress').value,
            temporary_address: addEmployeeModal.querySelector('#temporaryAddress').value,
            emergency_contact_person_name: addEmployeeModal.querySelector('#emergencyContactPersonName').value,
            relationship_with_employee: addEmployeeModal.querySelector('#emergencyRelationship').value,
            emergency_contact_person_phone_number: addEmployeeModal.querySelector('#emergencyPhoneNumber').value,
            employee_nominee_name: addEmployeeModal.querySelector('#employeeNomineeName').value,
            nominee_dob: addEmployeeModal.querySelector('#nomineeDob').value,
            nominee_relationship_with_employee: addEmployeeModal.querySelector('#nomineeRelationship').value,
            father_name: addEmployeeModal.querySelector('#fatherName').value,
            father_dob: addEmployeeModal.querySelector('#fatherDob').value,
            father_phone_number: addEmployeeModal.querySelector('#fatherPhoneNumber').value,
            mother_name: addEmployeeModal.querySelector('#motherName').value,
            mother_dob: addEmployeeModal.querySelector('#motherDob').value,
            mother_phone_number: addEmployeeModal.querySelector('#motherPhoneNumber').value,
            spouse_name: addEmployeeModal.querySelector('#spouseName').value,
            spouse_dob: addEmployeeModal.querySelector('#spouseDob').value,
            spouse_phone_number: addEmployeeModal.querySelector('#spousePhoneNumber').value,
            child1_name: addEmployeeModal.querySelector('#child1Name').value,
            child1_dob: addEmployeeModal.querySelector('#child1Dob').value,
            child2_name: addEmployeeModal.querySelector('#child2Name').value,
            child2_dob: addEmployeeModal.querySelector('#child2Dob').value,
            epf_no: addEmployeeModal.querySelector('#epfNo').value,
            esic_no: addEmployeeModal.querySelector('#esicNo').value,
            bank_name_branch: addEmployeeModal.querySelector('#bankNameBranch').value,
            account_number: addEmployeeModal.querySelector('#accountNumber').value,
            ifsc_number: addEmployeeModal.querySelector('#ifscNumber').value,
            net_take_home_salary: addEmployeeModal.querySelector('#netTakeHomeSalary').value,
            upload_documents: addEmployeeModal.querySelector('#uploadDocuments').value
        };

        // Client-side validation for required fields
        const requiredFields = [
            'employee_id', 'employee_name', 'email', 'date_of_joining', 'dob',
            'branch', 'designation', 'department', 'contact_number', 'personal_mail_id',
            'permanent_address', 'temporary_address', 'emergency_contact_person_name',
            'relationship_with_employee', 'emergency_contact_person_phone_number',
            'employee_nominee_name', 'nominee_dob', 'nominee_relationship_with_employee',
            'father_name', 'father_dob', 'father_phone_number', 'mother_name',
            'mother_dob', 'mother_phone_number', 'epf_no', 'esic_no',
            'bank_name_branch', 'account_number', 'ifsc_number', 'net_take_home_salary',
            'marital_status', 'blood_group'
        ];

        for (const field of requiredFields) {
            if (!formData[field] || String(formData[field]).trim() === '' || formData[field] === 'Select') {
                alert(`Please fill in the required field: ${field.replace(/_/g, ' ')}.`);
                // Attempt to focus the element
                const element = addEmployeeModal.querySelector(`#${field.replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`);
                if (element) element.focus();
                return;
            }
        }

        try {
            const url = isEditMode ? `http://localhost:3000/api/employees/${currentEmployeeId}` : 'http://localhost:3000/api/employees';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                $('#exampleModal').modal('hide');
                fetchAndRenderEmployees(); // Refresh the list
            } else {
                alert('Error: ' + (result.error || 'Something went wrong on the server.'));
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Failed to connect to the server. Please check your network connection and server status.');
        }
    });

    // Restore save button and clear readonly when modal closes
    $('#exampleModal').on('hidden.bs.modal', function () {
        saveChangesBtn.style.display = 'block'; // Ensure save button is visible by default
        const inputs = addEmployeeModal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.removeAttribute('readonly'));
    });
});

// Your existing sparkline and counterup initialization should remain,
// ensure it's outside the DOMContentLoaded if it's not dependent on other fetched data.
$(function () {
    "use strict";
    $('.counter').counterUp({
        delay: 10,
        time: 1000
    });

    function getRandomValues() {
        var values = new Array(20);
        for (var i = 0; i < values.length; i++) {
            values[i] = [5 + randomVal(), 10 + randomVal(), 15 + randomVal(), 20 + randomVal(), 30 + randomVal(),
            35 + randomVal(), 40 + randomVal(), 45 + randomVal(), 50 + randomVal()
            ];
        }
        return values;
    }
    function randomVal() {
        return Math.floor(Math.random() * 80);
    }

    var values2 = getRandomValues();
    var paramsBar = {
        type: 'bar',
        barWidth: 5,
        height: 25,
    };

    $('#mini-bar-chart1').sparkline(values2[0], paramsBar);
    paramsBar.barColor = '#6c757d';
    $('#mini-bar-chart2').sparkline(values2[1], paramsBar);
    paramsBar.barColor = '#6c757d';
    $('#mini-bar-chart3').sparkline(values2[2], paramsBar);
    paramsBar.barColor = '#6c757d';
    $('#mini-bar-chart4').sparkline(values2[3], paramsBar);
    paramsBar.barColor = '#6c757d';
});
