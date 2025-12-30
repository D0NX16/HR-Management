// hr-users.js

$(document).ready(function() {
    const API_BASE_URL = 'http://localhost:3000/api'; // Adjust if your server runs on a different port/domain

    // Function to fetch and render users
    async function fetchUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            renderUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'Failed to load users.', 'error');
        }
    }

    // Function to render users into the table
    function renderUsers(users) {
        const userListBody = $('#userListBody');
        userListBody.empty(); // Clear existing rows

        if (users.length === 0) {
            userListBody.append('<tr><td colspan="6" class="text-center">No users found.</td></tr>');
            return;
        }

        users.forEach(user => {
            const row = `
                <tr data-id="${user.id}">
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="tag tag-blue">${user.role}</span></td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-icon edit-user-btn" data-id="${user.id}" title="Edit"><i class="fa fa-edit"></i></button>
                        <button class="btn btn-sm btn-icon delete-user-btn" data-id="${user.id}" title="Delete"><i class="fa fa-trash-o text-danger"></i></button>
                    </td>
                </tr>
            `;
            userListBody.append(row);
        });
    }

    // --- Add New User (Registration) ---
    // Assuming you have input fields with these IDs in your "Add New" tab
    const addUserIdInput = $('#add-employee-id'); // Assuming this input is for Employee ID, not User ID
    const addUserNameInput = $('#add-user-name');
    const addUserEmailInput = $('#add-user-email');
    const addUserPasswordInput = $('#add-user-password');
    const addUserConfirmPasswordInput = $('#add-user-confirm-password');
    const addUserRoleSelect = $('#add-user-role-type'); // Assuming the select has this ID

    // Listen for form submission on the "Add New" tab
    $('#user-add .card-body button.btn-primary').on('click', async function() {
        // Collect data from your "Add New" tab input fields
        const name = addUserNameInput.val().trim();
        const email = addUserEmailInput.val().trim();
        const password = addUserPasswordInput.val().trim();
        const confirmPassword = addUserConfirmPasswordInput.val().trim();
        const role = addUserRoleSelect.val();

        if (!name || !email || !password || !confirmPassword || role === 'Select Role Type') {
            Swal.fire('Validation Error', 'Please fill in all required fields.', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire('Password Mismatch', 'Password and Confirm Password do not match.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire('Success', result.message, 'success');
                // Clear the form
                addUserNameInput.val('');
                addUserEmailInput.val('');
                addUserPasswordInput.val('');
                addUserConfirmPasswordInput.val('');
                addUserRoleSelect.val('Select Role Type');
                // Refresh the user list
                fetchUsers();
                // Switch back to the list tab
                $('a[href="#user-list"]').tab('show');
            } else {
                Swal.fire('Error', result.error || 'Failed to add user.', 'error');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            Swal.fire('Error', 'An unexpected error occurred while adding user.', 'error');
        }
    });

    // --- Delete User ---
    $(document).on('click', '.delete-user-btn', function() {
        const userId = $(this).data('id');
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                        method: 'DELETE'
                    });

                    const resultData = await response.json();

                    if (response.ok) {
                        Swal.fire('Deleted!', resultData.message, 'success');
                        fetchUsers(); // Refresh the list
                    } else {
                        Swal.fire('Error', resultData.error || 'Failed to delete user.', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    Swal.fire('Error', 'An unexpected error occurred during deletion.', 'error');
                }
            }
        });
    });

    // --- Edit User (Display data in the "Add New" form for editing) ---
    $(document).on('click', '.edit-user-btn', async function() {
        const userId = $(this).data('id');

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const user = await response.json();

            // Populate the "Add New" form fields with user data for editing
            addUserNameInput.val(user.name);
            addUserEmailInput.val(user.email);
            addUserRoleSelect.val(user.role);
            // Passwords are not usually pre-filled for security reasons
            addUserPasswordInput.val('');
            addUserConfirmPasswordInput.val('');

            // Change the Add button to Update and store user ID
            const addUpdateButton = $('#user-add .card-body button.btn-primary');
            addUpdateButton.text('Update User').data('user-id', userId);

            // Switch to the "Add New" tab
            $('a[href="#user-add"]').tab('show');

        } catch (error) {
            console.error('Error fetching user for edit:', error);
            Swal.fire('Error', 'Failed to load user data for editing.', 'error');
        }
    });

    // Handle Update User when the "Update User" button is clicked
    $('#user-add .card-body button.btn-primary').on('click', async function() {
        const userId = $(this).data('user-id'); // Get the stored user ID

        // If no user ID is stored, it means it's an "Add" operation
        if (!userId) {
            // Your existing add user logic will run from the first click handler
            return;
        }

        const name = addUserNameInput.val().trim();
        const email = addUserEmailInput.val().trim();
        const password = addUserPasswordInput.val().trim();
        const confirmPassword = addUserConfirmPasswordInput.val().trim();
        const role = addUserRoleSelect.val();

        if (!name || !email || role === 'Select Role Type') {
            Swal.fire('Validation Error', 'Please fill in all required fields (Name, Email, Role).', 'warning');
            return;
        }

        if (password && password !== confirmPassword) {
            Swal.fire('Password Mismatch', 'New Password and Confirm Password do not match.', 'error');
            return;
        }

        const userData = { name, email, role };
        if (password) { // Only send password if it's being updated
            userData.password = password;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire('Success', result.message, 'success');
                // Reset the form and button
                addUserNameInput.val('');
                addUserEmailInput.val('');
                addUserPasswordInput.val('');
                addUserConfirmPasswordInput.val('');
                addUserRoleSelect.val('Select Role Type');

                const addUpdateButton = $('#user-add .card-body button.btn-primary');
                addUpdateButton.text('Add').removeData('user-id'); // Remove stored ID

                fetchUsers(); // Refresh the user list
                $('a[href="#user-list"]').tab('show'); // Switch back to the list
            } else {
                Swal.fire('Error', result.error || 'Failed to update user.', 'error');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            Swal.fire('Error', 'An unexpected error occurred while updating user.', 'error');
        }
    });

    // Reset form and button text when switching to "Add New" tab manually or after an operation
    $('a[href="#user-add"]').on('shown.bs.tab', function (e) {
        const addUpdateButton = $('#user-add .card-body button.btn-primary');
        if (!addUpdateButton.data('user-id')) { // If no user ID is set (meaning it's a fresh add)
            addUserNameInput.val('');
            addUserEmailInput.val('');
            addUserPasswordInput.val('');
            addUserConfirmPasswordInput.val('');
            addUserRoleSelect.val('Select Role Type');
            addUpdateButton.text('Add');
        }
    });

    // Initial fetch of users when the page loads
    fetchUsers();
});