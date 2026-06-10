document.addEventListener('DOMContentLoaded', () => {
    loadBillNotifications();
});

async function loadBillNotifications() {
    // Tweaked API Endpoints with specific icons and colors
    const apiEndpoints = [
        { url: 'https://kgpl.net/api/eb-bills', name: 'EB Bill', icon: 'fa-bolt', color: 'text-warning' },
        { url: 'https://kgpl.net/api/internet-bills', name: 'Internet Bill', icon: 'fa-wifi', color: 'text-info' },
        { url: 'https://kgpl.net/api/mobile-recharges', name: 'Mobile Recharge', icon: 'fa-mobile-alt', color: 'text-primary' },
        { url: 'https://kgpl.net/api/rent-payments', name: 'Rent Payment', icon: 'fa-home', color: 'text-success' },
        { url: 'https://kgpl.net/api/vendor-payments', name: 'Vendor Payment', icon: 'fa-user-tie', color: 'text-secondary' },
        { url: 'https://kgpl.net/api/petrol-allowances', name: 'Petrol Allowance', icon: 'fa-gas-pump', color: 'text-danger' }
    ];

    let notifications = [];
    let hasOverdue = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const endpoint of apiEndpoints) {
        try {
            const res = await fetch(endpoint.url);
            if (!res.ok) continue;
            const data = await res.json();
            
            data.forEach(bill => {
                const billDueDate = bill.due_date || bill.next_bill_date;
                if (billDueDate) {
                    const dueDate = new Date(billDueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    
                    const diffTime = dueDate.getTime() - today.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    
                    // Show notification if overdue, due today, or due within 7 days
                    if (diffDays <= 7) {
                        let statusText = '';
                        let badgeClass = '';
                        let textClass = '';
                        
                        if (diffDays < 0) {
                            hasOverdue = true;
                            statusText = `Overdue by ${Math.abs(diffDays)} Days!`;
                            badgeClass = 'bg-danger';
                            textClass = 'text-danger font-weight-bold';
                        } else if (diffDays === 0) {
                            statusText = "Due Today!";
                            badgeClass = 'bg-warning text-dark';
                            textClass = 'text-warning font-weight-bold';
                        } else {
                            statusText = `Due in ${diffDays} Days`;
                            badgeClass = 'bg-info';
                            textClass = 'text-muted';
                        }

                        // Determine a representative name for the bill
                        const billIdentifier = bill.bill_number || bill.account_holder || bill.paid_by || bill.branch || bill.name || 'Bill';
                        const formattedDate = dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                        notifications.push(`
                            <li>
                                <a href="javascript:void(0)" style="border-left: 3px solid ${diffDays < 0 ? 'red' : (diffDays === 0 ? 'orange' : '#17a2b8')}; margin-bottom: 5px;">
                                    <div class="feeds-left"><i class="fa ${endpoint.icon} ${badgeClass} text-white"></i></div>
                                    <div class="feeds-body">
                                        <h4 class="title ${endpoint.color}">${endpoint.name} <small class="float-right ${textClass}">${formattedDate}</small></h4>
                                        <small class="${textClass}">${billIdentifier} - ${statusText}</small>
                                    </div>
                                </a>
                            </li>
                        `);
                    }
                }
            });
        } catch (error) {
            console.error(`Failed to fetch from ${endpoint.url}`, error);
        }
    }

    const notificationList = document.getElementById('notification_list');
    const notificationBadge = document.getElementById('notification_badge');

    if (notificationList && notificationBadge) {
        if (notifications.length > 0) {
            notificationBadge.textContent = notifications.length;
            notificationList.innerHTML = notifications.join('');
            
            // Add visual emphasis if there are overdue bills
            if (hasOverdue) {
                notificationBadge.classList.remove('badge-primary');
                notificationBadge.classList.add('badge-danger');
                notificationBadge.classList.add('pulse'); // If pulse animation exists
                
                const bellIcon = notificationBadge.parentElement.querySelector('svg');
                if(bellIcon) {
                    bellIcon.style.stroke = '#dc3545'; // red stroke
                    bellIcon.style.animation = 'pulse 2s infinite';
                }
                
                // Add simple inline style for pulse if class not available
                if(!document.getElementById('bell-pulse-style')) {
                    const style = document.createElement('style');
                    style.id = 'bell-pulse-style';
                    style.innerHTML = '@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }';
                    document.head.appendChild(style);
                }
            } else {
                notificationBadge.classList.remove('badge-danger');
                notificationBadge.classList.add('badge-primary');
                const bellIcon = notificationBadge.parentElement.querySelector('svg');
                if(bellIcon) {
                    bellIcon.style.stroke = 'currentColor';
                    bellIcon.style.animation = 'none';
                }
            }
        } else {
            notificationBadge.textContent = '';
            notificationBadge.classList.remove('badge-danger');
            notificationBadge.classList.add('badge-primary');
            const bellIcon = notificationBadge.parentElement.querySelector('svg');
            if(bellIcon) {
                bellIcon.style.stroke = 'currentColor';
                bellIcon.style.animation = 'none';
            }
            notificationList.innerHTML = '<li><a href="javascript:void(0)"><div class="feeds-body"><h4 class="title text-success"><i class="fa fa-check-circle mr-2"></i>All caught up!</h4><small>No pending bills due soon</small></div></a></li>';
        }
    }
}
