// Funciones para manejar las notas
function addNote() {
    const modal = document.getElementById('modal');
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalFooter = document.querySelector('.modal-footer');

    modalTitle.textContent = 'Agregar Nueva Nota';
    modalBody.innerHTML = `
        <textarea class="form-control note-textarea" id="noteContent" placeholder="Escribe tu nota aquí..."></textarea>
    `;
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="saveNote()">Guardar Nota</button>
    `;

    modal.style.display = 'block';
}

function saveNote() {
    const noteContent = document.getElementById('noteContent').value.trim();
    if (!noteContent) {
        alert('Por favor, escribe una nota antes de guardar.');
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) return;

    if (!users[userIndex].notes) {
        users[userIndex].notes = [];
    }

    const newNote = {
        id: Date.now(),
        content: noteContent,
        date: new Date().toLocaleString('es-CL')
    };

    users[userIndex].notes.unshift(newNote);
    localStorage.setItem('users', JSON.stringify(users));
    closeModal();
    displayUserNotes();
}

function deleteNote(noteId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta nota?')) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) return;

    users[userIndex].notes = users[userIndex].notes.filter(note => note.id !== noteId);
    localStorage.setItem('users', JSON.stringify(users));
    displayUserNotes();
}

function editNote(noteId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) return;

    const note = users[userIndex].notes.find(n => n.id === noteId);
    if (!note) return;

    const modal = document.getElementById('modal');
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalFooter = document.querySelector('.modal-footer');

    modalTitle.textContent = 'Editar Nota';
    modalBody.innerHTML = `
        <textarea class="form-control note-textarea" id="noteContent">${note.content}</textarea>
    `;
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="updateNote(${noteId})">Actualizar Nota</button>
    `;

    modal.style.display = 'block';
}

function updateNote(noteId) {
    const noteContent = document.getElementById('noteContent').value.trim();
    if (!noteContent) {
        alert('Por favor, escribe una nota antes de guardar.');
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) return;

    const noteIndex = users[userIndex].notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;

    users[userIndex].notes[noteIndex].content = noteContent;
    users[userIndex].notes[noteIndex].editedDate = new Date().toLocaleString('es-CL');
    
    localStorage.setItem('users', JSON.stringify(users));
    closeModal();
    displayUserNotes();
}

function displayUserNotes() {
    const notesContainer = document.getElementById('userNotes');
    const currentUser = getCurrentUser();
    
    if (!currentUser || !notesContainer) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user || !user.notes || user.notes.length === 0) {
        notesContainer.innerHTML = '<p class="text-muted">No hay notas registradas.</p>';
        return;
    }

    notesContainer.innerHTML = user.notes.map(note => `
        <div class="note-item">
            <div class="note-header">
                <div class="note-date">
                    ${note.date}
                    ${note.editedDate ? `<br><small>(Editado: ${note.editedDate})</small>` : ''}
                </div>
                <div class="note-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="editNote(${note.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteNote(${note.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="note-content">${note.content}</div>
        </div>
    `).join('');
}

// Actualizar la función displayUserInfo para incluir las notas
function displayUserInfo(user) {
    // ... existing code ...
    displayUserNotes();
}

// ... rest of existing code ... 