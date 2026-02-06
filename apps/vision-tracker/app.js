// Family Vision Tracker App
// Data stored in localStorage

const STORAGE_KEY = 'familyVisionData';

// Relation labels
const RELATION_LABELS = {
    child: '孩子',
    spouse: '配偶',
    parent: '父母',
    self: '本人',
    other: '其他'
};

// Relation icons
const RELATION_ICONS = {
    child: '👧',
    spouse: '💑',
    parent: '👴',
    self: '🙋',
    other: '👤'
};

let data = {
    members: [],
    selectedMemberId: null
};

let visionChart = null;

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        data = JSON.parse(saved);
    }
    render();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Calculate age from birthday
function calculateAge(birthday) {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Render the app
function render() {
    renderMembers();
    renderDetails();
    updateEmptyState();
}

// Render members grid
function renderMembers() {
    const grid = document.getElementById('membersGrid');
    
    if (data.members.length === 0) {
        grid.innerHTML = '';
        return;
    }
    
    grid.innerHTML = data.members.map(member => {
        const age = calculateAge(member.birthday);
        const isActive = member.id === data.selectedMemberId;
        const icon = RELATION_ICONS[member.relation] || '👤';
        
        return `
            <div class="member-card ${isActive ? 'active' : ''}" onclick="selectMember('${member.id}')">
                <div class="member-avatar">${icon}</div>
                <h3>${member.name}</h3>
                <div class="relation">${RELATION_LABELS[member.relation] || member.relation}</div>
                ${age !== null ? `<div class="age">${age} 歲</div>` : ''}
            </div>
        `;
    }).join('');
}

// Render member details
function renderDetails() {
    const section = document.getElementById('detailsSection');
    
    if (!data.selectedMemberId) {
        section.style.display = 'none';
        return;
    }
    
    const member = data.members.find(m => m.id === data.selectedMemberId);
    if (!member) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    document.getElementById('memberName').textContent = `📊 ${member.name} 的視力紀錄`;
    
    renderRecordsTable(member);
    renderChart(member);
}

// Render records table
function renderRecordsTable(member) {
    const tbody = document.getElementById('recordsBody');
    const records = member.records || [];
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-light); padding: 40px;">
                    尚無紀錄，點擊「新增紀錄」開始記錄
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date descending
    const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(record => {
        const formatValue = (val) => {
            if (val === null || val === undefined || val === '') return '-';
            const num = parseFloat(val);
            if (num < 0) return `<span class="value-negative">${num.toFixed(2)}</span>`;
            if (num > 0) return `<span class="value-positive">+${num.toFixed(2)}</span>`;
            return num.toFixed(2);
        };
        
        return `
            <tr>
                <td>${record.date}</td>
                <td>${formatValue(record.odSphere)}</td>
                <td>${formatValue(record.osSphere)}</td>
                <td>${formatValue(record.odCylinder)}</td>
                <td>${formatValue(record.osCylinder)}</td>
                <td>${record.note || '-'}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecord('${record.id}')">刪除</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Render vision chart
function renderChart(member) {
    const ctx = document.getElementById('visionChart').getContext('2d');
    const records = member.records || [];
    
    if (visionChart) {
        visionChart.destroy();
    }
    
    if (records.length === 0) {
        return;
    }
    
    // Sort by date ascending for chart
    const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sorted.map(r => r.date);
    const odData = sorted.map(r => parseFloat(r.odSphere) || null);
    const osData = sorted.map(r => parseFloat(r.osSphere) || null);
    
    visionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '右眼 (OD)',
                    data: odData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: false
                },
                {
                    label: '左眼 (OS)',
                    data: osData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '視力度數變化趨勢'
                }
            },
            scales: {
                y: {
                    reverse: true,
                    title: {
                        display: true,
                        text: '度數 (D)'
                    }
                }
            }
        }
    });
}

// Update empty state visibility
function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const hasMembers = data.members.length > 0;
    
    emptyState.style.display = hasMembers ? 'none' : 'block';
    document.querySelector('.members-section').style.display = hasMembers ? 'block' : 'none';
}

// Select a member
function selectMember(id) {
    data.selectedMemberId = id;
    saveData();
    render();
}

// Show modal
function showModal(id) {
    document.getElementById(id).classList.add('active');
}

// Close modal
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Show add member modal
function showAddMemberModal() {
    document.getElementById('memberNameInput').value = '';
    document.getElementById('memberBirthday').value = '';
    document.getElementById('memberRelation').value = 'child';
    showModal('addMemberModal');
}

// Add member
function addMember(e) {
    e.preventDefault();
    
    const name = document.getElementById('memberNameInput').value.trim();
    const birthday = document.getElementById('memberBirthday').value;
    const relation = document.getElementById('memberRelation').value;
    
    if (!name) return;
    
    const member = {
        id: generateId(),
        name: name,
        birthday: birthday || null,
        relation: relation,
        records: []
    };
    
    data.members.push(member);
    data.selectedMemberId = member.id;
    saveData();
    
    closeModal('addMemberModal');
    render();
}

// Delete member
function deleteMember() {
    if (!data.selectedMemberId) return;
    
    const member = data.members.find(m => m.id === data.selectedMemberId);
    if (!confirm(`確定要刪除「${member.name}」的所有資料嗎？`)) return;
    
    data.members = data.members.filter(m => m.id !== data.selectedMemberId);
    data.selectedMemberId = data.members.length > 0 ? data.members[0].id : null;
    saveData();
    render();
}

// Show add record modal
function showAddRecordModal() {
    document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('odSphere').value = '';
    document.getElementById('osSphere').value = '';
    document.getElementById('odCylinder').value = '';
    document.getElementById('osCylinder').value = '';
    document.getElementById('recordNote').value = '';
    showModal('addRecordModal');
}

// Add record
function addRecord(e) {
    e.preventDefault();
    
    if (!data.selectedMemberId) return;
    
    const member = data.members.find(m => m.id === data.selectedMemberId);
    if (!member) return;
    
    const record = {
        id: generateId(),
        date: document.getElementById('recordDate').value,
        odSphere: document.getElementById('odSphere').value || null,
        osSphere: document.getElementById('osSphere').value || null,
        odCylinder: document.getElementById('odCylinder').value || null,
        osCylinder: document.getElementById('osCylinder').value || null,
        note: document.getElementById('recordNote').value.trim()
    };
    
    if (!member.records) member.records = [];
    member.records.push(record);
    saveData();
    
    closeModal('addRecordModal');
    render();
}

// Delete record
function deleteRecord(recordId) {
    if (!data.selectedMemberId) return;
    
    const member = data.members.find(m => m.id === data.selectedMemberId);
    if (!member) return;
    
    if (!confirm('確定要刪除這筆紀錄嗎？')) return;
    
    member.records = member.records.filter(r => r.id !== recordId);
    saveData();
    render();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadData);

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});
