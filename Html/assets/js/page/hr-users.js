$(document).ready(function() {
    // 1. Configuration
    const API_BASE_URL = 'http://localhost:3000/api'; 
    
    // Selectors mapped to your HTML IDs
    const $nameInput = $('#add-user-name');
    const $emailInput = $('#add-user-email');
    const $roleSelect = $('#add-user-role-type');
    const $passInput = $('#add-user-password');
    const $confPassInput = $('#add-user-confirm-password');
    const $saveBtn = $('#btn-save-user');

    // --- 1. INITIAL LOAD ---
    fetchUsers();

    // --- 2. FETCH & RENDER USERS ---
    async function fetchUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const users = await response.json();
            renderUserTable(users);
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error', 'Could not load users.', 'error');
        }
    }

    function renderUserTable(users) {
        const $tbody = $('#userListBody'); // ID added to <tbody> in HTML
        $tbody.empty();

        if (!users || users.length === 0) {
            $tbody.html('<tr><td colspan="5" class="text-center">No users found.</td></tr>');
            return;
        }

        users.forEach(user => {
            // Format Date
            const createdDate = user.created_at 
                ? new Date(user.created_at).toLocaleDateString() 
                : 'N/A';

            // Role Badge Color
            let badgeClass = 'badge-default';
            if (user.role === 'Super Admin') badgeClass = 'badge-danger';
            else if (user.role === 'Admin') badgeClass = 'badge-warning';
            else if (user.role === 'Employee') badgeClass = 'badge-success';

            const row = `
                <tr>
                    <td><h6 class="mb-0">${user.name}</h6></td>
                    <td>${user.email}</td>
                    <td><span class="badge ${badgeClass}">${user.role}</span></td>
                    <td>${createdDate}</td>
                    <td>
                        <button type="button" class="btn btn-icon btn-sm delete-btn" 
                            data-id="${user.id}" 
                            title="Delete">
                            <i class="fa fa-trash text-danger"></i>
                        </button>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    // --- 3. HANDLE SAVE (ADD / UPDATE) ---
    $saveBtn.on('click', async function() {
        const userId = $(this).data('id'); // Get ID if in Edit Mode
        const isEdit = !!userId;

        const userData = {
            name: $nameInput.val().trim(),
            email: $emailInput.val().trim(),
            role: $roleSelect.val(),
            password: $passInput.val().trim()
        };

        const confirmPass = $confPassInput.val().trim();

        // VALIDATION
        if (!userData.name || !userData.email) {
            showNotification('Required', 'Name and Email are required.', 'warning');
            return;
        }
        if (userData.role === 'Select Role Type') {
            showNotification('Required', 'Please select a Role.', 'warning');
            return;
        }

        // Password Validation
        if (isEdit) {
            // In edit mode, password is optional. 
            // If user typed one, we validate match. If empty, we remove it from payload.
            if (userData.password && userData.password !== confirmPass) {
                showNotification('Error', 'Passwords do not match.', 'error');
                return;
            }
            if (!userData.password) delete userData.password; // Don't send empty password
        } else {
            // In Add mode, password is required
            if (!userData.password) {
                showNotification('Required', 'Password is required for new users.', 'warning');
                return;
            }
            if (userData.password !== confirmPass) {
                showNotification('Error', 'Passwords do not match.', 'error');
                return;
            }
        }

        // API CALL
        try {
            const url = isEdit ? `${API_BASE_URL}/users/${userId}` : `${API_BASE_URL}/users`;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Success', isEdit ? 'User updated!' : 'User created!', 'success');
                resetForm();
                fetchUsers();
                // Switch tab back to list
                $('.nav-tabs a[href="#user-list"]').tab('show');
            } else {
                showNotification('Error', result.error || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error', 'Server connection failed.', 'error');
        }
    });

    // --- 4. HANDLE EDIT CLICK ---
    $(document).on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        const email = $(this).data('email');
        const role = $(this).data('role');

        // Populate Form
        $nameInput.val(name);
        $emailInput.val(email);
        $roleSelect.val(role);
        $passInput.val(''); // Clear password fields
        $confPassInput.val('');

        // Change Button State
        $saveBtn.text('Update User').data('id', id); // Attach ID to button
        
        // Switch to Add/Edit Tab
        $('.nav-tabs a[href="#user-add"]').tab('show');
    });

    // --- 5. HANDLE DELETE CLICK ---
    $(document).on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        
        // Using standard SweetAlert (v1) syntax which is common in templates
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this user!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, async function() {
            try {
                const response = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    swal("Deleted!", "User has been deleted.", "success");
                    fetchUsers();
                } else {
                    swal("Error", "Failed to delete user.", "error");
                }
            } catch (error) {
                swal("Error", "Server connection failed.", "error");
            }
        });
    });

    // --- 6. HELPER: RESET FORM ---
    function resetForm() {
        $nameInput.val('');
        $emailInput.val('');
        $roleSelect.val('Select Role Type'); // Reset to default option
        $passInput.val('');
        $confPassInput.val('');
        $saveBtn.text('Add').removeData('id'); // Remove ID
    }

    // --- 7. HELPER: NOTIFICATION WRAPPER ---
    // Handles difference between SweetAlert v1 and v2 just in case
    function showNotification(title, text, type) {
        if (typeof swal === 'function') {
            swal(title, text, type);
        } else {
            alert(`${title}: ${text}`);
        }
    }

    // Detect manual tab click to reset form if canceling an edit
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if ($(e.target).attr('href') === '#user-add') {
            // If we clicked the tab manually (not via Edit button), check if we need to reset
            // We check if the button has an ID attached. If NOT, it's a fresh add.
            // If it DOES have an ID, we leave it (user might be navigating back and forth)
            // Or you can choose to always reset on manual click:
            // if (!$saveBtn.data('id')) resetForm();
        } else {
            // Leaving the add tab, reset form
            resetForm();
        }
    });
});