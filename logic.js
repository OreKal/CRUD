let users = [];

let currentSort = {
    column: null,
    direction: 'asc'
};

const form = document.getElementById('userForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const roleInput = document.getElementById('role');
const regDateInput = document.getElementById('regDate');

const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const tableBody = document.querySelector('#usersTable tbody');
const emptyState = document.getElementById('emptyState');
const totalUsersBadge = document.getElementById('totalUsers');
const editIndexInput = document.getElementById('editIndex');

document.addEventListener('DOMContentLoaded', () => {
    regDateInput.valueAsDate = new Date();
    renderTable();
});


//Συνάρτηση μετατροπής (Ελληνικά κεφαλαία χωρίς τόνους)
const toGreekUppercase = (text) => {
    const map = {
        'ά': 'Α', 'έ': 'Ε', 'ή': 'Η', 'ί': 'Ι', 'ό': 'Ο', 'ύ': 'Υ', 'ώ': 'Ω',
        'ϊ': 'Ι', 'ϋ': 'Υ', 'ΐ': 'Ι', 'ΰ': 'Υ',
        'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ό': 'Ο', 'Ύ': 'Υ', 'Ώ': 'Ω'
    };
    
    return text.split('').map(char => map[char] || char).join('').toUpperCase();
};

//Error/Success μήνυμα
const setStatus = (input, message, type) => {
    const group = input.parentElement;
    const msgSmall = group.querySelector('.msg');
    
    group.classList.remove('success', 'error');
    
    if (type === 'error') {
        group.classList.add('error');
        msgSmall.innerText = message;
        return false;
    } else if (type === 'success') {
        group.classList.add('success');
        msgSmall.innerText = message || 'Έγκυρο';
        return true;
    } else {
        msgSmall.innerText = ''; 
        return false;
    }
};

//Επικύρωση email 
const validateEmail = (email, currentIndex) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Μη έγκυρη μορφή email";
    }
    
    //Έλεγχος μοναδικότητας (εξαιρώντας τον τρέχοντα χρήστη αν κάνουμε edit)
    const exists = users.some((user, idx) => user.email === email && idx !== currentIndex);
    if (exists) {
        return "Το email χρησιμοποιείται ήδη";
    }
    
    return null;
};



[firstNameInput, lastNameInput].forEach(input => {
    input.addEventListener('input', (e) => {
        const originalVal = e.target.value;
        const upperVal = toGreekUppercase(originalVal);
        
        // Αν χρειάζεται αλλαγή (π.χ. έγραψε μικρό ή τόνο), το αλλάζουμε
        if (originalVal !== upperVal) {
            e.target.value = upperVal;
        }

        if (upperVal.trim().length < 2) {
            setStatus(input, "Τουλάχιστον 2 χαρακτήρες", 'error');
        } else {
            setStatus(input, "Έγκυρο", 'success');
        }
    });
});

emailInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    const currentIndex = parseInt(editIndexInput.value);
    
    const error = validateEmail(val, currentIndex);
    if (error) {
        setStatus(emailInput, error, 'error');
    } else {
        setStatus(emailInput, "Έγκυρο", 'success');
    }
});

roleInput.addEventListener('change', () => {
    if (roleInput.value) setStatus(roleInput, "Έγκυρο", 'success');
});



//Προσθήκη / Ενημέρωση Χρήστη
form.addEventListener('submit', (e) => {
    e.preventDefault();

    //Τελικός έλεγχος πριν την υποβολή
    const fName = firstNameInput.value.trim();
    const lName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleInput.value;
    const date = regDateInput.value;
    const editIdx = parseInt(editIndexInput.value);

    //Γρήγορο check αν όλα είναι valid
    if (!fName || !lName || !role || !date || validateEmail(email, editIdx)) {
        alert("Παρακαλώ διορθώστε τα σφάλματα στη φόρμα.");
        return;
    }

    const userData = {
        firstName: fName,
        lastName: lName,
        email: email,
        role: role,
        regDate: date
    };

    if (editIdx === -1) {
        //Create
        users.push(userData);
    } else {
        //Update
        users[editIdx] = userData;
        resetForm(); //Επαναφορά φόρμας για νέα προσθήκη
    }

    renderTable();
    form.reset();
    regDateInput.valueAsDate = new Date();
    document.querySelectorAll('.input-group').forEach(g => g.classList.remove('success', 'error'));
});

//Delete
window.deleteUser = (index) => {
    if (confirm("Είστε σίγουρος ότι θέλετε να διαγράψετε αυτόν τον χρήστη;")) {
        users.splice(index, 1);
        renderTable();
        //Αν διαγράψαμε αυτόν που επεξεργαζόμασταν, κάνουμε reset
        if (parseInt(editIndexInput.value) === index) {
            resetForm();
        }
    }
};

//Προετοιμασία Επεξεργασίας
window.editUser = (index) => {
    const user = users[index];
    
    firstNameInput.value = user.firstName;
    lastNameInput.value = user.lastName;
    emailInput.value = user.email;
    roleInput.value = user.role;
    regDateInput.value = user.regDate;
    
    editIndexInput.value = index;

    //UI αλλαγές
    submitBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Ενημέρωση';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-warning'); 
    cancelBtn.classList.remove('hidden');
    
    [firstNameInput, lastNameInput, emailInput, roleInput].forEach(el => {
        setStatus(el, "Σε επεξεργασία", 'success');
    });
};

//Ακύρωση Επεξεργασίας
cancelBtn.addEventListener('click', () => {
    resetForm();
    form.reset();
    regDateInput.valueAsDate = new Date();
    document.querySelectorAll('.input-group').forEach(g => g.classList.remove('success', 'error'));
});

function resetForm() {
    editIndexInput.value = "-1";
    submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Αποθήκευση';
    submitBtn.classList.add('btn-primary');
    submitBtn.classList.remove('btn-warning');
    cancelBtn.classList.add('hidden');
}


function renderTable() {
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="badge" style="background-color: ${user.role === 'Admin' ? '#4f46e5' : '#64748b'}">${user.role}</span></td>
                <td>${user.regDate}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editUser(${index})" title="Επεξεργασία">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteUser(${index})" title="Διαγραφή">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
    
    totalUsersBadge.innerText = `Σύνολο: ${users.length}`;
}

//Ταξινόμηση
window.sortTable = (column) => {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    users.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        //Ειδική μεταχείριση για strings για σωστή αλφαβητική σειρά
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable();
};