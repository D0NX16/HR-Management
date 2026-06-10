$(function () {
    "use strict";

    // Initialize Datepickers
    $('[data-provide="datepicker"]').datepicker({
        format: 'yyyy-mm-dd', // Ensure consistent date format for backend
        autoclose: true
    });

    // Initialize Counter and Sparkline (Visuals)
    $('.counter').counterUp({ delay: 10, time: 1000 });

    function getRandomValues() {
        var values = new Array(20);
        for (var i = 0; i < values.length; i++) {
            values[i] = [5 + randomVal(), 10 + randomVal(), 15 + randomVal(), 20 + randomVal(), 30 + randomVal(),
            35 + randomVal(), 40 + randomVal(), 45 + randomVal(), 50 + randomVal()];
        }
        return values;
    }
    function randomVal() { return Math.floor(Math.random() * 80); }

    var values2 = getRandomValues();
    var paramsBar = { type: 'bar', barWidth: 5, height: 25, barColor: '#6c757d' };

    $('#mini-bar-chart1').sparkline(values2[0], paramsBar);
    $('#mini-bar-chart2').sparkline(values2[1], paramsBar);
    $('#mini-bar-chart3').sparkline(values2[2], paramsBar);
    $('#mini-bar-chart4').sparkline(values2[3], paramsBar);
});

document.addEventListener('DOMContentLoaded', function () {
    const addEmployeeModal = document.getElementById('exampleModal');
    const saveChangesBtn = addEmployeeModal.querySelector('.modal-footer .btn-primary');
    const employeeTableBody = document.querySelector('#Employee-list tbody');

    // Variables to manage current employee being edited/viewed
    let currentEmployeeId = null;
    let isEditMode = false; 

    // 1. Fetch and Render Employees
    async function fetchAndRenderEmployees() {
        try {
            const response = await fetch('https://kgpl.net/api/employees');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const employees = await response.json();
            employeeTableBody.innerHTML = ''; // Clear existing rows
  const role = (localStorage.getItem('loggedInUserRole') || '').toUpperCase().trim();

            employees.forEach((employee) => {
                

                     let actionButtons = '';

         if (role !== 'GENERAL MANAGER' && role !== 'VP' && role !== 'CEO') {
        actionButtons = `
            <button type="button" class="btn btn-icon btn-sm edit-employee" title="Edit" data-employee-id="${employee.employee_id}"><i class="fa fa-edit text-info"></i></button>
            <button type="button" class="btn btn-icon btn-sm delete-employee js-sweetalert" title="Delete" data-type="confirm" data-employee-id="${employee.employee_id}"><i class="fa fa-trash-o text-danger"></i></button>
        `;
    }              
                const row = `
                
                        <tr>
                            <td class="d-flex">
                                <span class="avatar avatar-blue" data-toggle="tooltip" title="${employee.employee_name}">
                                    ${employee.employee_name.charAt(0).toUpperCase()}
                                </span>
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
                               ${actionButtons}
                            </td>
                        </tr>
                    `;
                employeeTableBody.insertAdjacentHTML('beforeend', row);
            });
        } catch (error) {
            console.error('Error fetching employees:', error);
            // alert('Failed to load employee data.'); // Optional: uncomment if you want alerts on load
        }
    }

    // Load employees on page load
    fetchAndRenderEmployees();

    // 2. Populate Modal (For View/Edit)
    function populateModal(employeeData) {
        // --- Core Details ---
        document.getElementById('employeeEmail').value = employeeData.email || '';
        document.getElementById('companyLocation').value = employeeData.company || 'Select'; // FIXED: Added Company
        document.getElementById('employeeBranch').value = employeeData.branch || 'Select';
        document.getElementById('employeeId').value = employeeData.employee_id || '';
        document.getElementById('employeeName').value = employeeData.employee_name || '';
        document.getElementById('callerName').value = employeeData.caller_name || '';
        document.getElementById('dateOfJoining').value = employeeData.join_date ? formatDateForInput(employeeData.join_date) : ''; // Handle date formatting
        document.getElementById('employeeDob').value = employeeData.dob || '';
        document.getElementById('employeement').value = employeeData.employment_type || 'Select'; // FIXED: Added Employment Type
        document.getElementById('designation').value = employeeData.role || ''; // Note: API returns 'role', HTML ID is 'designation'
        document.getElementById('department').value = employeeData.department || '';

        // --- Personal ---
        document.getElementById('maritalStatus').value = employeeData.marital_status || 'UnMarried';
        document.getElementById('bloodGroup').value = employeeData.blood_group || '';
        document.getElementById('contactNumber').value = employeeData.phone || ''; 
        document.getElementById('alternatePhoneNumber').value = employeeData.alternate_phone_number || '';
        document.getElementById('officialPhoneNumber').value = employeeData.official_phone_number || '';
        document.getElementById('personalMailId').value = employeeData.personal_mail_id || '';
        document.getElementById('officialMailId').value = employeeData.official_mail_id || '';
        document.getElementById('permanentAddress').value = employeeData.permanent_address || '';
        document.getElementById('temporaryAddress').value = employeeData.temporary_address || '';

        // --- Emergency ---
        document.getElementById('emergencyContactPersonName').value = employeeData.emergency_contact_person_name || '';
        document.getElementById('emergencyRelationship').value = employeeData.relationship_with_employee || '';
        document.getElementById('emergencyPhoneNumber').value = employeeData.emergency_contact_phone_number || '';
        
        // --- Family ---
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

        // --- Financial ---
        document.getElementById('epfNo').value = employeeData.epf_no || '';
        document.getElementById('esicNo').value = employeeData.esic_no || '';
        document.getElementById('bankNameBranch').value = employeeData.bank_name_branch || '';
        document.getElementById('accountNumber').value = employeeData.account_number || '';
        document.getElementById('ifscNumber').value = employeeData.ifsc_number || '';
        document.getElementById('netTakeHomeSalary').value = employeeData.net_take_home_salary || '';
        // document.getElementById('uploadDocuments').value = ''; // File inputs cannot be pre-populated securely
    }

    // Helper to handle date formats if API returns "20 May, 2023" but input needs "2023-05-20"
    function formatDateForInput(dateString) {
        if(!dateString) return '';
        // If it's already yyyy-mm-dd
        if(dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
        
        const date = new Date(dateString);
        if(isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    }

    // 3. Clear Modal
    function clearModal() {
        const inputs = addEmployeeModal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.tagName === 'SELECT') {
                input.value = 'Select'; 
            } else {
                input.value = '';
            }
        });
        document.getElementById('maritalStatus').value = 'UnMarried'; 
    }

    // 4. "Add" Button Click
    document.querySelector('.header-action button[data-target="#exampleModal"]').addEventListener('click', function () {
        clearModal();
        isEditMode = false;
        currentEmployeeId = null;
        addEmployeeModal.querySelector('.modal-title').textContent = 'Add Employee';
        saveChangesBtn.textContent = 'Save changes';
        saveChangesBtn.style.display = 'block';
        
        document.getElementById('employeeId').removeAttribute('readonly');
        const inputs = addEmployeeModal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.removeAttribute('readonly'));
    });

    // 5. "View" Button Click
    employeeTableBody.addEventListener('click', async function (event) {
        if (event.target.closest('.view-employee')) {
            const employeeId = event.target.closest('.view-employee').dataset.employeeId;
            try {
                // Fetch specific employee (better than fetching all) if your API supports it, 
                // otherwise fetch all and find:
                const response = await fetch('https://kgpl.net/api/employees'); 
                const employees = await response.json();
                const employeeToView = employees.find(emp => emp.employee_id === employeeId);

                if (employeeToView) {
                    populateModal(employeeToView);
                    addEmployeeModal.querySelector('.modal-title').textContent = `View Employee: ${employeeToView.employee_name}`;
                    saveChangesBtn.style.display = 'none'; 
                    
                    const inputs = addEmployeeModal.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => input.setAttribute('readonly', 'readonly'));
                    // Selects technically don't support readonly, use disabled
                    addEmployeeModal.querySelectorAll('select').forEach(select => select.setAttribute('disabled', 'true'));

                    $('#exampleModal').modal('show');
                }
            } catch (error) {
                console.error('Error viewing employee:', error);
            }
        }
    });

    // 6. "Edit" Button Click
    employeeTableBody.addEventListener('click', async function (event) {
        if (event.target.closest('.edit-employee')) {
            const employeeId = event.target.closest('.edit-employee').dataset.employeeId;
            try {
                const response = await fetch('https://kgpl.net/api/employees'); 
                const employees = await response.json();
                const employeeToEdit = employees.find(emp => emp.employee_id === employeeId);

                if (employeeToEdit) {
                    populateModal(employeeToEdit);
                    isEditMode = true;
                    currentEmployeeId = employeeId;
                    addEmployeeModal.querySelector('.modal-title').textContent = `Edit Employee: ${employeeToEdit.employee_name}`;
                    saveChangesBtn.textContent = 'Update changes';
                    saveChangesBtn.style.display = 'block'; 

                    document.getElementById('employeeId').setAttribute('readonly', 'readonly');
                    const inputs = addEmployeeModal.querySelectorAll('input:not(#employeeId), select, textarea');
                    inputs.forEach(input => input.removeAttribute('readonly'));
                    addEmployeeModal.querySelectorAll('select').forEach(select => select.removeAttribute('disabled'));

                    $('#exampleModal').modal('show');
                }
            } catch (error) {
                console.error('Error editing employee:', error);
            }
        }
    });

    // 7. "Delete" Button Click
    employeeTableBody.addEventListener('click', async function (event) {
        if (event.target.closest('.delete-employee')) {
            const employeeId = event.target.closest('.delete-employee').dataset.employeeId;
            if (confirm(`Are you sure you want to delete employee ID: ${employeeId}?`)) {
                try {
                    const response = await fetch(`https://kgpl.net/api/employees/${employeeId}`, {
                        method: 'DELETE',
                    });
                    const result = await response.json();
                    if (response.ok) {
                        alert(result.message);
                        fetchAndRenderEmployees();
                    } else {
                        alert('Error: ' + (result.error || 'Failed to delete.'));
                    }
                } catch (error) {
                    alert('Network error during delete.');
                }
            }
        }
    });

    // 8. SAVE / UPDATE Button Logic (THE FIX IS HERE)
    saveChangesBtn.addEventListener('click', async function () {
        
        // Collect Data
        const formData = {
            email: document.getElementById('employeeEmail').value,
            company: document.getElementById('companyLocation').value, // FIXED: Added
            branch: document.getElementById('employeeBranch').value,
            employee_id: document.getElementById('employeeId').value,
            employee_name: document.getElementById('employeeName').value,
            caller_name: document.getElementById('callerName').value,
            date_of_joining: document.getElementById('dateOfJoining').value,
            dob: document.getElementById('employeeDob').value,
            employment_type: document.getElementById('employeement').value, // FIXED: Added (ID in HTML is 'employeement')
            designation: document.getElementById('designation').value,
            department: document.getElementById('department').value,
            marital_status: document.getElementById('maritalStatus').value,
            blood_group: document.getElementById('bloodGroup').value,
            contact_number: document.getElementById('contactNumber').value,
            alternate_phone_number: document.getElementById('alternatePhoneNumber').value,
            official_phone_number: document.getElementById('officialPhoneNumber').value,
            personal_mail_id: document.getElementById('personalMailId').value,
            official_mail_id: document.getElementById('officialMailId').value,
            permanent_address: document.getElementById('permanentAddress').value,
            temporary_address: document.getElementById('temporaryAddress').value,
            emergency_contact_person_name: document.getElementById('emergencyContactPersonName').value,
            relationship_with_employee: document.getElementById('emergencyRelationship').value,
            emergency_contact_person_phone_number: document.getElementById('emergencyPhoneNumber').value,
            employee_nominee_name: document.getElementById('employeeNomineeName').value,
            nominee_dob: document.getElementById('nomineeDob').value,
            nominee_relationship_with_employee: document.getElementById('nomineeRelationship').value,
            father_name: document.getElementById('fatherName').value,
            father_dob: document.getElementById('fatherDob').value,
            father_phone_number: document.getElementById('fatherPhoneNumber').value,
            mother_name: document.getElementById('motherName').value,
            mother_dob: document.getElementById('motherDob').value,
            mother_phone_number: document.getElementById('motherPhoneNumber').value,
            spouse_name: document.getElementById('spouseName').value,
            spouse_dob: document.getElementById('spouseDob').value,
            spouse_phone_number: document.getElementById('spousePhoneNumber').value,
            child1_name: document.getElementById('child1Name').value,
            child1_dob: document.getElementById('child1Dob').value,
            child2_name: document.getElementById('child2Name').value,
            child2_dob: document.getElementById('child2Dob').value,
            epf_no: document.getElementById('epfNo').value,
            esic_no: document.getElementById('esicNo').value,
            bank_name_branch: document.getElementById('bankNameBranch').value,
            account_number: document.getElementById('accountNumber').value,
            ifsc_number: document.getElementById('ifscNumber').value,
            net_take_home_salary: document.getElementById('netTakeHomeSalary').value,
            // upload_documents: document.getElementById('uploadDocuments').value 
        };

        // Client-side Validation
        const requiredFields = [
            'email', 'company', 'branch', 'employee_id', 'employee_name', 'date_of_joining', 'dob',
            'employment_type', 'designation', 'department', 'marital_status', 'blood_group',
            'contact_number', 'personal_mail_id', 'permanent_address', 'temporary_address',
            'emergency_contact_person_name', 'relationship_with_employee', 'emergency_contact_person_phone_number',
            'employee_nominee_name', 'nominee_dob', 'nominee_relationship_with_employee',
            'father_name', 'father_dob', 'father_phone_number', 
            'mother_name', 'mother_dob', 'mother_phone_number', 
            'bank_name_branch', 'account_number', 'ifsc_number', 'net_take_home_salary'
        ];

        for (const field of requiredFields) {
            if (!formData[field] || String(formData[field]).trim() === '' || formData[field] === 'Select') {
                alert(`Please fill in the required field: ${field.replace(/_/g, ' ')}.`);
                return;
            }
        }

        try {
            const url = isEditMode 
                ? `https://kgpl.net/api/employees/${currentEmployeeId}` 
                : 'https://kgpl.net/api/employees/add';    
            
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                $('#exampleModal').modal('hide');
                fetchAndRenderEmployees(); 
            } else {
                alert('Error: ' + (result.error || 'Server Error'));
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Failed to connect to server.');
        }
    });

    // Reset readonly/disabled when modal hides to avoid UI bugs
    $('#exampleModal').on('hidden.bs.modal', function () {
        const inputs = addEmployeeModal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.removeAttribute('disabled');
        });
        saveChangesBtn.style.display = 'block';
    });
});


        $('#uploadForm').on('submit', function (e) {
            e.preventDefault();
            const fileInput = document.getElementById('excelFile');
            const file = fileInput.files[0];

            if (!file) {
                alert("Please select a file");
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            $.ajax({
                url: 'https://kgpl.net/api/employees/upload-excel',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    alert(response.message);
                    $('#uploadModal').modal('hide');
                    $('#uploadForm')[0].reset();
                    loadData();
                },
                error: function (xhr) {
                    console.log(xhr);
                    alert('Error uploading file: ' + (xhr.responseJSON?.error || xhr.statusText));
                }
            });
        });