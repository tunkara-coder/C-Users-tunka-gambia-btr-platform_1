// New file: scripts/data-repository.js
const dataRepository = {
    activityData: [],
    emissionFactors: [],
    mitigationData: [],
    adaptationData: [],
    supportData: []
};

function initDataRepository() {
    loadDataRepository();
    showDataTab('activity-data');
    populateActivityDataTable();
    populateEmissionFactorsTable();
    setupDataRepositoryEventListeners();
}

function setupDataRepositoryEventListeners() {
    // Add event listeners for data repository functionality
    const navButtons = document.querySelectorAll('.data-nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.textContent.toLowerCase().replace(/\s+/g, '-');
            showDataTab(tabName);
        });
    });
}

function showDataTab(tabName) {
    const tabs = document.querySelectorAll('.data-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const navButtons = document.querySelectorAll('.data-nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    const activeBtn = Array.from(navButtons).find(btn => 
        btn.textContent.toLowerCase().replace(/\s+/g, '-').includes(tabName)
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function loadDataRepository() {
    const savedData = localStorage.getItem('gambiaDataRepository');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            Object.assign(dataRepository, parsed);
        } catch (error) {
            console.log('No previous data repository found, initializing with empty data');
        }
    }
}

function saveDataRepository() {
    localStorage.setItem('gambiaDataRepository', JSON.stringify(dataRepository));
}

function populateActivityDataTable() {
    const tbody = document.getElementById('activity-data-body');
    if (!tbody) return;
    
    if (dataRepository.activityData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No activity data available. Import data or generate synthetic data to get started.</td></tr>';
        return;
    }
    
    let html = '';
    dataRepository.activityData.forEach(item => {
        html += `
            <tr>
                <td>${item.sector || ''}</td>
                <td>${item.subsector || ''}</td>
                <td>${item.activity || ''}</td>
                <td>${item.year || ''}</td>
                <td>${item.value || ''}</td>
                <td>${item.unit || ''}</td>
                <td>
                    <span class="data-quality-indicator ${getQualityClass(item.quality)}"></span>
                    ${item.quality || 'Unknown'}
                </td>
                <td>
                    <button class="btn-secondary small" onclick="editActivityData('${item.id}')">Edit</button>
                    <button class="btn-secondary small" onclick="deleteActivityData('${item.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function populateEmissionFactorsTable() {
    const tbody = document.getElementById('emission-factors-body');
    if (!tbody) return;
    
    if (dataRepository.emissionFactors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No emission factors available. Add factors or generate synthetic data to get started.</td></tr>';
        return;
    }
    
    let html = '';
    dataRepository.emissionFactors.forEach(item => {
        html += `
            <tr>
                <td>${item.id || ''}</td>
                <td>${item.sourceCategory || ''}</td>
                <td>${item.fuelActivityType || ''}</td>
                <td>${item.emissionFactor || ''}</td>
                <td>${item.unit || ''}</td>
                <td><span class="tier-badge tier-${item.tier || 1}">Tier ${item.tier || 1}</span></td>
                <td>${item.reference || ''}</td>
                <td>
                    <button class="btn-secondary small" onclick="editEmissionFactor('${item.id}')">Edit</button>
                    <button class="btn-secondary small" onclick="deleteEmissionFactor('${item.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function getQualityClass(quality) {
    if (!quality) return 'quality-unknown';
    
    const qualityMap = {
        'high': 'quality-high',
        'medium': 'quality-medium',
        'low': 'quality-low'
    };
    
    return qualityMap[quality.toLowerCase()] || 'quality-unknown';
}

function generateSyntheticData(type) {
    switch(type) {
        case 'activity':
            generateSyntheticActivityData();
            break;
        case 'emission':
            generateSyntheticEmissionFactors();
            break;
        default:
            console.log('Unknown data type for synthetic generation');
    }
}

function generateSyntheticActivityData() {
    const sectors = ['Energy', 'AFOLU', 'Waste', 'IPPU'];
    const subsectors = {
        'Energy': ['Electricity Generation', 'Transport', 'Residential', 'Commercial'],
        'AFOLU': ['Livestock', 'Crop Residues', 'Forest Land', 'Cropland'],
        'Waste': ['Solid Waste', 'Wastewater', 'Industrial Waste'],
        'IPPU': ['Cement Production', 'Lime Production', 'Ammonia Production']
    };
    
    const activities = {
        'Electricity Generation': ['Fuel combustion', 'Grid electricity'],
        'Transport': ['Road transport', 'Aviation', 'Navigation'],
        'Livestock': ['Enteric fermentation', 'Manure management'],
        'Solid Waste': ['Landfill', 'Incineration']
    };
    
    dataRepository.activityData = [];
    
    for (let i = 0; i < 50; i++) {
        const sector = sectors[Math.floor(Math.random() * sectors.length)];
        const subsectorList = subsectors[sector] || ['General'];
        const subsector = subsectorList[Math.floor(Math.random() * subsectorList.length)];
        
        const activityList = activities[subsector] || ['General activity'];
        const activity = activityList[Math.floor(Math.random() * activityList.length)];
        
        dataRepository.activityData.push({
            id: 'ACT_' + Math.random().toString(36).substr(2, 9),
            sector: sector,
            subsector: subsector,
            activity: activity,
            year: 2015 + Math.floor(Math.random() * 6),
            value: (Math.random() * 1000).toFixed(2),
            unit: 'TJ',
            quality: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
        });
    }
    
    saveDataRepository();
    populateActivityDataTable();
    showNotification('Synthetic activity data generated successfully!', 'success');
}

function generateSyntheticEmissionFactors() {
    const sourceCategories = [
        'Energy - Stationary Combustion',
        'Energy - Mobile Combustion', 
        'Industrial Processes',
        'Agriculture',
        'Waste'
    ];
    
    const fuelTypes = [
        'Diesel', 'Gasoline', 'Natural Gas', 'Coal', 'Biomass',
        'Aviation Fuel', 'Residual Fuel Oil', 'LPG'
    ];
    
    dataRepository.emissionFactors = [];
    
    for (let i = 0; i < 30; i++) {
        const category = sourceCategories[Math.floor(Math.random() * sourceCategories.length)];
        const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
        
        dataRepository.emissionFactors.push({
            id: 'EF_' + Math.random().toString(36).substr(2, 9),
            sourceCategory: category,
            fuelActivityType: fuelType,
            emissionFactor: (Math.random() * 100).toFixed(4),
            unit: 'kg CO2/TJ',
            tier: Math.floor(Math.random() * 3) + 1,
            reference: 'IPCC 2006 Guidelines'
        });
    }
    
    saveDataRepository();
    populateEmissionFactorsTable();
    showNotification('Synthetic emission factors generated successfully!', 'success');
}

function importActivityData() {
    // In a real implementation, this would handle file upload
    // For now, we'll simulate importing data
    showNotification('Data import functionality would be implemented here', 'info');
}

function exportActivityData() {
    // In a real implementation, this would export to Excel
    // For now, we'll simulate the export
    showNotification('Data export functionality would be implemented here', 'info');
}

function addEmissionFactor() {
    // In a real implementation, this would open a form to add a new emission factor
    showNotification('Add emission factor form would open here', 'info');
}

function editActivityData(id) {
    // In a real implementation, this would open an edit form
    showNotification(`Edit activity data with ID: ${id}`, 'info');
}

function deleteActivityData(id) {
    if (confirm('Are you sure you want to delete this activity data?')) {
        dataRepository.activityData = dataRepository.activityData.filter(item => item.id !== id);
        saveDataRepository();
        populateActivityDataTable();
        showNotification('Activity data deleted successfully', 'success');
    }
}

function editEmissionFactor(id) {
    // In a real implementation, this would open an edit form
    showNotification(`Edit emission factor with ID: ${id}`, 'info');
}

function deleteEmissionFactor(id) {
    if (confirm('Are you sure you want to delete this emission factor?')) {
        dataRepository.emissionFactors = dataRepository.emissionFactors.filter(item => item.id !== id);
        saveDataRepository();
        populateEmissionFactorsTable();
        showNotification('Emission factor deleted successfully', 'success');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

document.addEventListener('DOMContentLoaded', initDataRepository);