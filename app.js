var appState = {
    currentSection: 'dashboard',
    btrContent: {
        nationalCircumstances: {},
        ghgInventory: {},
        mitigationActions: {},
        vulnerabilityAssessment: {},
        supportInformation: {},
        otherInformation: {},
        methodologicalParameters: {}
    },
    ghgInventory: {
        timeSeries: {
            2015: { energy: 0.82, afolu: 2.15, waste: 0.25, ipuu: 0.05, total: 3.27 },
            2020: { energy: 0.89, afolu: 2.30, waste: 0.28, ipuu: 0.07, total: 3.54 }
        },
        sectorData: {
            energy: { activityData: '', emissionFactors: '' },
            afolu: { activityData: '', emissionFactors: '' },
            waste: { activityData: '', emissionFactors: '' },
            ipuu: { activityData: '', emissionFactors: '' }
        }
    },
    dataRepository: {
        activityData: [],
        emissionFactors: [],
        supportData: []
    },
    ndcTracking: {
        targets: {
            2025: { reduction: 50.7, currentProgress: 38, targetEmissions: 1.796 },
            2030: { reduction: 105.7, currentProgress: 18, targetEmissions: -0.203 }
        },
        sectorContributions: {
            afolu: 60,
            energy: 30,
            waste: 10
        }
    },
    recentActivities: [
        'Platform initialized with complete BTR framework',
        'GHG Inventory data structure established',
        'Data repository functionality added',
        'NDC progress tracking implemented',
        'Report generation capabilities enhanced'
    ]
};

function initApp() {
    console.log('The Gambia BTR Platform initialized');
    loadSavedData();
    updateRecentActivities();
    updateAllProgressIndicators();
    setupEventListeners();
    populateDataTables();
    showSection('dashboard');
}

function setupEventListeners() {
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('input', handleGlobalInput);
    
    // Data repository event listeners
    var addActivityDataBtn = document.getElementById('add-activity-data');
    if (addActivityDataBtn) {
        addActivityDataBtn.addEventListener('click', showActivityDataModal);
    }
    
    var addEmissionFactorBtn = document.getElementById('add-emission-factor');
    if (addEmissionFactorBtn) {
        addEmissionFactorBtn.addEventListener('click', showEmissionFactorModal);
    }
    
    var generateRoadmapBtn = document.getElementById('generate-roadmap');
    if (generateRoadmapBtn) {
        generateRoadmapBtn.addEventListener('click', generateImplementationRoadmap);
    }
    
    var generateGapReportBtn = document.getElementById('generate-gap-report');
    if (generateGapReportBtn) {
        generateGapReportBtn.addEventListener('click', generateGapAnalysisReport);
    }
}

function handleGlobalClick(e) {
    var navLink = e.target.closest('[data-section]');
    if (navLink) {
        e.preventDefault();
        var sectionId = navLink.getAttribute('data-section');
        showSection(sectionId);
        return;
    }
    
    var quickActionBtn = e.target.closest('.quick-action-btn');
    if (quickActionBtn && quickActionBtn.getAttribute('data-action')) {
        var action = quickActionBtn.getAttribute('data-action');
        handleQuickAction(action);
        return;
    }
    
    var saveBtn = e.target.closest('.save-section-btn');
    if (saveBtn) {
        var section = saveBtn.getAttribute('data-section');
        saveBTRSection(section);
        return;
    }
    
    var tabBtn = e.target.closest('.tab-btn');
    if (tabBtn) {
        var tabId = tabBtn.getAttribute('data-tab');
        var tabContainer = tabBtn.closest('.tab-nav');
        if (tabContainer) {
            showContentTab(tabId, tabContainer);
        }
        return;
    }
    
    if (e.target.id === 'generate-btr-report') {
        generateBTRReport();
        return;
    }
    
    if (e.target.classList.contains('notification-close')) {
        var notification = e.target.closest('.notification');
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
        return;
    }
    
    // Data repository delete buttons
    if (e.target.classList.contains('delete-data-btn')) {
        var row = e.target.closest('tr');
        var dataType = e.target.getAttribute('data-type');
        var dataId = e.target.getAttribute('data-id');
        deleteDataRecord(dataType, dataId, row);
        return;
    }
}

function handleGlobalInput(e) {
    if (e.target.matches('input, textarea, select')) {
        var form = e.target.closest('form');
        if (form) {
            var section = form.getAttribute('data-section');
            if (section) {
                if (window.autoSaveTimeout) {
                    clearTimeout(window.autoSaveTimeout);
                }
                window.autoSaveTimeout = setTimeout(function() {
                    saveBTRSection(section);
                }, 1000);
            }
        }
    }
}

function showSection(sectionId) {
    var sections = document.querySelectorAll('.section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
    }
    
    var targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.remove('active');
    }
    
    var activeNav = document.querySelector('[data-section="' + sectionId + '"]');
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    addActivity('Navigated to ' + sectionId);
}

function showContentTab(tabId, tabContainer) {
    var tabPanes = tabContainer.parentElement.querySelectorAll('.tab-pane');
    for (var i = 0; i < tabPanes.length; i++) {
        tabPanes[i].classList.remove('active');
    }
    
    var tabButtons = tabContainer.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    var targetTab = document.getElementById(tabId + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    var activeBtn = tabContainer.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update GHG inventory summary when that tab is shown
    if (tabId === 'inventory-summary') {
        updateGHGInventorySummary();
    }
}

function handleQuickAction(action) {
    if (action === 'gap-analysis') {
        window.location.href = 'gap-analysis.html';
    } else {
        showSection(action);
    }
}

function saveBTRSection(section) {
    var form = document.querySelector('form[data-section="' + section + '"]');
    if (!form) {
        appState.btrContent[section] = { saved: true, timestamp: new Date().toISOString() };
    } else {
        var inputs = form.querySelectorAll('input, select, textarea');
        var sectionData = {};
        
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.type === 'checkbox') {
                sectionData[input.id] = input.checked;
            } else {
                sectionData[input.id] = input.value;
            }
        }
        
        appState.btrContent[section] = sectionData;
    }
    
    saveToLocalStorage();
    updateAllProgressIndicators();
    addActivity('Saved ' + section + ' data');
    showNotification(section + ' data saved successfully!', 'success');
}

function updateAllProgressIndicators() {
    var btrProgress = updateBTRContentProgress();
    var ghgProgress = updateGHGInventoryProgress();
    var dataProgress = updateDataCompleteness();
    var ndcProgress = appState.ndcTracking.targets[2025].currentProgress;
    
    // Update dashboard stats
    var btrProgressElement = document.getElementById('btr-content-progress');
    if (btrProgressElement) btrProgressElement.textContent = btrProgress + '%';
    
    var ghgProgressElement = document.getElementById('ghg-inventory-progress');
    if (ghgProgressElement) ghgProgressElement.textContent = ghgProgress + '%';
    
    var ndcProgressElement = document.getElementById('ndc-2025-progress');
    if (ndcProgressElement) ndcProgressElement.textContent = ndcProgress + '%';
    
    var dataProgressElement = document.getElementById('data-completeness');
    if (dataProgressElement) dataProgressElement.textContent = dataProgress + '%';
    
    // Update overall progress
    var overallProgress = Math.round((btrProgress + ghgProgress + dataProgress) / 3);
    var overallProgressBar = document.getElementById('overall-progress');
    var overallProgressText = document.getElementById('overall-progress-text');
    
    if (overallProgressBar) overallProgressBar.style.width = overallProgress + '%';
    if (overallProgressText) overallProgressText.textContent = 'Overall Progress: ' + overallProgress + '%';
}

function updateBTRContentProgress() {
    var sections = Object.keys(appState.btrContent);
    var totalFields = 0;
    var completedFields = 0;
    
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionData = appState.btrContent[section];
        if (sectionData && Object.keys(sectionData).length > 0) {
            var values = Object.values(sectionData);
            
            for (var j = 0; j < values.length; j++) {
                totalFields++;
                var value = values[j];
                if (value !== '' && value !== null && value !== undefined && value !== false) {
                    completedFields++;
                }
            }
        }
    }
    
    var progress = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    return progress;
}

function updateGHGInventoryProgress() {
    var sectors = Object.keys(appState.ghgInventory.sectorData);
    var totalFields = sectors.length * 3; // emissions, activity data, emission factors for each sector
    var completedFields = 0;
    
    for (var i = 0; i < sectors.length; i++) {
        var sector = sectors[i];
        var sectorData = appState.ghgInventory.sectorData[sector];
        
        // Check emissions value (from form inputs)
        var emissionsInput = document.getElementById(sector + 'Emissions');
        if (emissionsInput && emissionsInput.value !== '') {
            completedFields++;
        }
        
        // Check activity data
        if (sectorData.activityData && sectorData.activityData !== '') {
            completedFields++;
        }
        
        // Check emission factors
        if (sectorData.emissionFactors && sectorData.emissionFactors !== '') {
            completedFields++;
        }
    }
    
    var progress = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    return progress;
}

function updateDataCompleteness() {
    var totalDataPoints = appState.dataRepository.activityData.length + 
                         appState.dataRepository.emissionFactors.length + 
                         appState.dataRepository.supportData.length;
    
    // Consider data complete if we have at least some data in each category
    var completenessScore = 0;
    if (appState.dataRepository.activityData.length > 0) completenessScore += 33;
    if (appState.dataRepository.emissionFactors.length > 0) completenessScore += 33;
    if (appState.dataRepository.supportData.length > 0) completenessScore += 34;
    
    return completenessScore;
}

function updateGHGInventorySummary() {
    var totalEmissions = document.getElementById('total-emissions');
    var largestSector = document.getElementById('largest-sector');
    var inventoryYear = document.getElementById('inventory-year');
    
    if (totalEmissions) totalEmissions.textContent = appState.ghgInventory.timeSeries[2020].total.toFixed(2);
    if (largestSector) largestSector.textContent = 'AFOLU';
    if (inventoryYear) inventoryYear.textContent = '2020';
    
    // Update sector breakdown bars
    var sectors = ['energy', 'afolu', 'waste', 'ipuu'];
    for (var i = 0; i < sectors.length; i++) {
        var sector = sectors[i];
        var percentage = Math.round((appState.ghgInventory.timeSeries[2020][sector] / appState.ghgInventory.timeSeries[2020].total) * 100);
        var sectorBar = document.querySelector('.sector-bar[data-sector="' + sector + '"]');
        var sectorPercentage = document.querySelector('.sector-bar[data-sector="' + sector + '"]').parentElement.nextElementSibling;
        
        if (sectorBar) sectorBar.style.width = percentage + '%';
        if (sectorPercentage) sectorPercentage.textContent = percentage + '%';
    }
}

function populateDataTables() {
    // Populate activity data table with sample data
    var activityDataBody = document.getElementById('activity-data-body');
    if (activityDataBody) {
        var sampleActivityData = [
            { id: 1, sector: 'Energy', category: 'Fuel Combustion', year: 2020, value: '125.6', unit: 'TJ', source: 'National Energy Statistics' },
            { id: 2, sector: 'AFOLU', category: 'Enteric Fermentation', year: 2020, value: '45.2', unit: 'Head', source: 'Agricultural Census' },
            { id: 3, sector: 'Waste', category: 'Solid Waste Disposal', year: 2020, value: '320', unit: 'kt', source: 'Waste Management Authority' }
        ];
        
        appState.dataRepository.activityData = sampleActivityData;
        
        var html = '';
        for (var i = 0; i < sampleActivityData.length; i++) {
            var item = sampleActivityData[i];
            html += '<tr>' +
                    '<td>' + item.sector + '</td>' +
                    '<td>' + item.category + '</td>' +
                    '<td>' + item.year + '</td>' +
                    '<td>' + item.value + '</td>' +
                    '<td>' + item.unit + '</td>' +
                    '<td>' + item.source + '</td>' +
                    '<td><button class="btn-secondary delete-data-btn" data-type="activity" data-id="' + item.id + '">Delete</button></td>' +
                    '</tr>';
        }
        activityDataBody.innerHTML = html;
    }
    
    // Populate emission factors table with sample data
    var emissionFactorsBody = document.getElementById('emission-factors-body');
    if (emissionFactorsBody) {
        var sampleEmissionFactors = [
            { id: 1, sector: 'Energy', category: 'Diesel Combustion', factor: '74.1', unit: 'kg CO₂/TJ', source: 'IPCC 2006', tier: '1' },
            { id: 2, sector: 'AFOLU', category: 'Enteric Fermentation', factor: '56', unit: 'kg CH₄/head/year', source: 'IPCC 2006', tier: '1' },
            { id: 3, sector: 'Waste', category: 'Solid Waste Disposal', factor: '0.9', unit: 'g CH₄/g waste', source: 'IPCC 2006', tier: '1' }
        ];
        
        appState.dataRepository.emissionFactors = sampleEmissionFactors;
        
        var html = '';
        for (var i = 0; i < sampleEmissionFactors.length; i++) {
            var item = sampleEmissionFactors[i];
            html += '<tr>' +
                    '<td>' + item.sector + '</td>' +
                    '<td>' + item.category + '</td>' +
                    '<td>' + item.factor + '</td>' +
                    '<td>' + item.unit + '</td>' +
                    '<td>' + item.source + '</td>' +
                    '<td>' + item.tier + '</td>' +
                    '<td><button class="btn-secondary delete-data-btn" data-type="emissionFactors" data-id="' + item.id + '">Delete</button></td>' +
                    '</tr>';
        }
        emissionFactorsBody.innerHTML = html;
    }
}

function showActivityDataModal() {
    // In a real implementation, this would show a modal for adding activity data
    // For this example, we'll add a sample record directly
    var newId = appState.dataRepository.activityData.length + 1;
    var newRecord = {
        id: newId,
        sector: 'IPPU',
        category: 'Cement Production',
        year: 2020,
        value: '150',
        unit: 'kt',
        source: 'Industry Statistics'
    };
    
    appState.dataRepository.activityData.push(newRecord);
    saveToLocalStorage();
    populateDataTables();
    updateAllProgressIndicators();
    showNotification('Activity data added successfully!', 'success');
    addActivity('Added new activity data for ' + newRecord.category);
}

function showEmissionFactorModal() {
    // In a real implementation, this would show a modal for adding emission factors
    // For this example, we'll add a sample record directly
    var newId = appState.dataRepository.emissionFactors.length + 1;
    var newRecord = {
        id: newId,
        sector: 'IPPU',
        category: 'Cement Production',
        factor: '0.5',
        unit: 't CO₂/t cement',
        source: 'IPCC 2006',
        tier: '1'
    };
    
    appState.dataRepository.emissionFactors.push(newRecord);
    saveToLocalStorage();
    populateDataTables();
    updateAllProgressIndicators();
    showNotification('Emission factor added successfully!', 'success');
    addActivity('Added new emission factor for ' + newRecord.category);
}

function deleteDataRecord(dataType, dataId, row) {
    if (confirm('Are you sure you want to delete this record?')) {
        var index = -1;
        for (var i = 0; i < appState.dataRepository[dataType].length; i++) {
            if (appState.dataRepository[dataType][i].id == dataId) {
                index = i;
                break;
            }
        }
        
        if (index !== -1) {
            appState.dataRepository[dataType].splice(index, 1);
            saveToLocalStorage();
            if (row && row.parentNode) {
                row.parentNode.removeChild(row);
            }
            updateAllProgressIndicators();
            showNotification('Record deleted successfully!', 'success');
            addActivity('Deleted ' + dataType + ' record');
        }
    }
}

function saveToLocalStorage() {
    var dataToSave = {
        btrContent: appState.btrContent,
        ghgInventory: appState.ghgInventory,
        dataRepository: appState.dataRepository,
        ndcTracking: appState.ndcTracking,
        recentActivities: appState.recentActivities
    };
    
    try {
        localStorage.setItem('gambiaBTRData', JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadSavedData() {
    var savedData = localStorage.getItem('gambiaBTRData');
    if (savedData) {
        try {
            var parsed = JSON.parse(savedData);
            appState.btrContent = parsed.btrContent || appState.btrContent;
            appState.ghgInventory = parsed.ghgInventory || appState.ghgInventory;
            appState.dataRepository = parsed.dataRepository || appState.dataRepository;
            appState.ndcTracking = parsed.ndcTracking || appState.ndcTracking;
            appState.recentActivities = parsed.recentActivities || appState.recentActivities;
            loadFormData();
            addActivity('Loaded saved data from previous session');
        } catch (error) {
            console.log('Error loading saved data:', error);
        }
    }
}

function loadFormData() {
    var sections = Object.keys(appState.btrContent);
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionData = appState.btrContent[section];
        if (!sectionData) continue;
        
        var fields = Object.keys(sectionData);
        for (var j = 0; j < fields.length; j++) {
            var fieldId = fields[j];
            var field = document.getElementById(fieldId);
            if (field && sectionData[fieldId]) {
                if (field.type === 'checkbox') {
                    field.checked = sectionData[fieldId];
                } else {
                    field.value = sectionData[fieldId];
                }
            }
        }
    }
    
    // Load GHG inventory sector data
    var sectors = Object.keys(appState.ghgInventory.sectorData);
    for (var i = 0; i < sectors.length; i++) {
        var sector = sectors[i];
        var sectorData = appState.ghgInventory.sectorData[sector];
        
        var activityDataField = document.getElementById(sector + 'ActivityData');
        var emissionFactorsField = document.getElementById(sector + 'EmissionFactors');
        
        if (activityDataField && sectorData.activityData) {
            activityDataField.value = sectorData.activityData;
        }
        
        if (emissionFactorsField && sectorData.emissionFactors) {
            emissionFactorsField.value = sectorData.emissionFactors;
        }
    }
}

function addActivity(activity) {
    var timestamp = new Date().toLocaleTimeString();
    appState.recentActivities.unshift(timestamp + ': ' + activity);
    
    if (appState.recentActivities.length > 20) {
        appState.recentActivities.pop();
    }
    
    updateRecentActivities();
    saveToLocalStorage();
}

function updateRecentActivities() {
    var activitiesList = document.getElementById('recent-activities');
    if (activitiesList) {
        var html = '';
        for (var i = 0; i < appState.recentActivities.length; i++) {
            html += '<li>' + appState.recentActivities[i] + '</li>';
        }
        activitiesList.innerHTML = html;
    }
}

function showNotification(message, type) {
    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.innerHTML = '<span class="notification-message">' + message + '</span><button class="notification-close">&times;</button>';
    
    if (!document.querySelector('#notification-styles')) {
        var styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification{position:fixed;top:20px;right:20px;padding:1rem 1.5rem;border-radius:8px;color:white;z-index:1000;max-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease}
            .notification-success{background:#27ae60}
            .notification-error{background:#e74c3c}
            .notification-info{background:#3498db}
            .notification-close{background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;margin-left:1rem}
            @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function generateBTRReport() {
    var output = document.getElementById('report-content');
    if (!output) {
        output = document.createElement('div');
        output.id = 'report-content';
        var reportsSection = document.querySelector('#reports .content-navigation');
        if (reportsSection) {
            reportsSection.appendChild(output);
        }
    }
    
    var reportPeriod = document.getElementById('report-period').value;
    var selectedSections = getSelectedReportSections();
    
    var report = '<div class="report-header"><h3>BTR Draft Report for The Gambia</h3><p><strong>Reporting Period:</strong> ' + reportPeriod + '</p><p><strong>Generated:</strong> ' + new Date().toLocaleDateString() + '</p></div>';
    report += '<hr>';
    
    report += '<h4>Executive Summary</h4>';
    report += '<p>The Gambia is making significant progress in implementing its Enhanced Transparency Framework under the Paris Agreement. This Biennial Transparency Report documents the country\'s climate actions, greenhouse gas inventory, and progress towards NDC targets.</p>';
    
    report += '<h4>Progress Summary</h4>';
    report += '<ul>';
    report += '<li><strong>BTR Content Completion:</strong> ' + updateBTRContentProgress() + '%</li>';
    report += '<li><strong>GHG Inventory Progress:</strong> ' + updateGHGInventoryProgress() + '%</li>';
    report += '<li><strong>NDC 2025 Target Progress:</strong> ' + appState.ndcTracking.targets[2025].currentProgress + '%</li>';
    report += '<li><strong>Data Completeness:</strong> ' + updateDataCompleteness() + '%</li>';
    report += '</ul>';
    
    if (selectedSections.includes('nationalCircumstances')) {
        report += '<h4>National Circumstances</h4>';
        var ncData = appState.btrContent.nationalCircumstances;
        report += '<p>' + (ncData.countryProfile || 'Country profile information to be completed.') + '</p>';
        report += '<p>' + (ncData.institutionalArrangements || 'Institutional arrangements information to be completed.') + '</p>';
    }
    
    if (selectedSections.includes('ghgInventory')) {
        report += '<h4>GHG Inventory</h4>';
        report += '<p><strong>Total GHG Emissions (2020):</strong> ' + appState.ghgInventory.timeSeries[2020].total + ' Mt CO₂eq</p>';
        report += '<p><strong>Methodology:</strong> ' + (appState.btrContent.ghgInventory.inventoryMethodology || 'IPCC 2006 Guidelines') + '</p>';
        
        report += '<h5>Sectoral Breakdown</h5>';
        report += '<ul>';
        report += '<li><strong>Energy:</strong> ' + appState.ghgInventory.timeSeries[2020].energy + ' Mt CO₂eq</li>';
        report += '<li><strong>AFOLU:</strong> ' + appState.ghgInventory.timeSeries[2020].afolu + ' Mt CO₂eq</li>';
        report += '<li><strong>Waste:</strong> ' + appState.ghgInventory.timeSeries[2020].waste + ' Mt CO₂eq</li>';
        report += '<li><strong>IPPU:</strong> ' + appState.ghgInventory.timeSeries[2020].ipuu + ' Mt CO₂eq</li>';
        report += '</ul>';
    }
    
    if (selectedSections.includes('mitigationActions')) {
        report += '<h4>Mitigation Actions and Effects</h4>';
        var maData = appState.btrContent.mitigationActions;
        report += '<p>' + (maData.mitigationPolicies || 'Mitigation policies and measures information to be completed.') + '</p>';
        report += '<p>' + (maData.mitigationEffects || 'Effects of mitigation actions information to be completed.') + '</p>';
    }
    
    if (selectedSections.includes('vulnerabilityAssessment')) {
        report += '<h4>Vulnerability Assessment and Adaptation</h4>';
        var vaData = appState.btrContent.vulnerabilityAssessment;
        report += '<p>' + (vaData.climateImpacts || 'Climate change impacts information to be completed.') + '</p>';
        report += '<p>' + (vaData.vulnerabilityAssessment || 'Vulnerability assessment information to be completed.') + '</p>';
    }
    
    if (selectedSections.includes('supportInformation')) {
        report += '<h4>Support Needed and Received</h4>';
        var siData = appState.btrContent.supportInformation;
        report += '<p>' + (siData.financialSupport || 'Financial support information to be completed.') + '</p>';
        report += '<p>' + (siData.technicalSupport || 'Technical support information to be completed.') + '</p>';
    }
    
    report += '<h4>Recent Activities</h4>';
    report += '<ul>';
    for (var i = 0; i < Math.min(appState.recentActivities.length, 5); i++) {
        report += '<li>' + appState.recentActivities[i] + '</li>';
    }
    report += '</ul>';
    
    output.innerHTML = report;
    addActivity('Generated BTR Draft Report');
    showNotification('BTR Report generated successfully!', 'success');
}

function generateImplementationRoadmap() {
    var output = document.getElementById('report-content');
    if (!output) {
        output = document.createElement('div');
        output.id = 'report-content';
        var reportsSection = document.querySelector('#reports .content-navigation');
        if (reportsSection) {
            reportsSection.appendChild(output);
        }
    }
    
    var btrProgress = updateBTRContentProgress();
    var ghgProgress = updateGHGInventoryProgress();
    var dataProgress = updateDataCompleteness();
    
    var roadmap = '<div class="report-header"><h3>BTR Implementation Roadmap - The Gambia</h3><p><strong>Generated:</strong> ' + new Date().toLocaleDateString() + '</p></div>';
    roadmap += '<hr>';
    
    roadmap += '<h4>Current Status Assessment</h4>';
    roadmap += '<ul>';
    roadmap += '<li><strong>BTR Content Framework:</strong> ' + btrProgress + '% complete</li>';
    roadmap += '<li><strong>GHG Inventory System:</strong> ' + ghgProgress + '% complete</li>';
    roadmap += '<li><strong>Data Repository:</strong> ' + dataProgress + '% complete</li>';
    roadmap += '<li><strong>NDC Tracking:</strong> ' + appState.ndcTracking.targets[2025].currentProgress + '% towards 2025 target</li>';
    roadmap += '</ul>';
    
    roadmap += '<h4>Priority Actions for Next 6 Months</h4>';
    roadmap += '<ol>';
    
    if (btrProgress < 80) {
        roadmap += '<li><strong>Complete BTR Content Framework:</strong> Finalize all mandatory BTR sections including mitigation actions, vulnerability assessment, and support information.</li>';
    }
    
    if (ghgProgress < 80) {
        roadmap += '<li><strong>Enhance GHG Inventory:</strong> Complete sectoral data collection, improve emission factors, and implement QA/QC procedures.</li>';
    }
    
    if (dataProgress < 80) {
        roadmap += '<li><strong>Expand Data Repository:</strong> Add missing activity data, country-specific emission factors, and methodological parameters.</li>';
    }
    
    roadmap += '<li><strong>Stakeholder Engagement:</strong> Conduct workshops with line ministries to validate data and ensure institutional ownership.</li>';
    roadmap += '<li><strong>Capacity Building:</strong> Train technical staff on ETF requirements and reporting methodologies.</li>';
    roadmap += '</ol>';
    
    roadmap += '<h4>Medium-Term Goals (6-12 months)</h4>';
    roadmap += '<ul>';
    roadmap += '<li>Establish institutionalized data collection processes</li>';
    roadmap += '<li>Develop country-specific emission factors for key categories</li>';
    roadmap += '<li>Implement advanced uncertainty assessment methods</li>';
    roadmap += '<li>Enhance IT infrastructure for data management</li>';
    roadmap += '</ul>';
    
    roadmap += '<h4>Long-Term Vision (12+ months)</h4>';
    roadmap += '<ul>';
    roadmap += '<li>Fully institutionalized ETF implementation</li>';
    roadmap += '<li>Sustainable domestic funding for transparency activities</li>';
    roadmap += '<li>Regular BTR submissions without external support</li>';
    roadmap += '<li>Integration with national planning and budgeting processes</li>';
    roadmap += '</ul>';
    
    output.innerHTML = roadmap;
    addActivity('Generated Implementation Roadmap');
    showNotification('Implementation Roadmap generated successfully!', 'success');
}

function generateGapAnalysisReport() {
    // This function would integrate with the gap analysis tool
    // For now, we'll create a simple report based on current progress
    var output = document.getElementById('report-content');
    if (!output) {
        output = document.createElement('div');
        output.id = 'report-content';
        var reportsSection = document.querySelector('#reports .content-navigation');
        if (reportsSection) {
            reportsSection.appendChild(output);
        }
    }
    
    var btrProgress = updateBTRContentProgress();
    var ghgProgress = updateGHGInventoryProgress();
    var dataProgress = updateDataCompleteness();
    
    var gapReport = '<div class="report-header"><h3>ETF Gap Analysis Report - The Gambia</h3><p><strong>Generated:</strong> ' + new Date().toLocaleDateString() + '</p></div>';
    gapReport += '<hr>';
    
    gapReport += '<h4>Overall ETF Compliance Status</h4>';
    var overallCompliance = Math.round((btrProgress + ghgProgress + dataProgress) / 3);
    gapReport += '<div style="text-align: center; margin: 20px 0;">';
    gapReport += '<div style="display: inline-block; padding: 2rem; border-radius: 50%; width: 150px; height: 150px; background: ' + getComplianceColor(overallCompliance) + '; color: white; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">';
    gapReport += '<div style="font-size: 2.5rem; font-weight: bold;">' + overallCompliance + '%</div>';
    gapReport += '<div style="font-size: 0.9rem;">Overall Compliance</div>';
    gapReport += '</div>';
    gapReport += '</div>';
    
    gapReport += '<h4>Key Gap Areas</h4>';
    gapReport += '<ul>';
    
    if (btrProgress < 70) {
        gapReport += '<li><strong>BTR Content Framework:</strong> Critical gaps in mitigation actions, vulnerability assessment, and support information sections.</li>';
    }
    
    if (ghgProgress < 70) {
        gapReport += '<li><strong>GHG Inventory:</strong> Need for improved activity data collection and country-specific emission factors.</li>';
    }
    
    if (dataProgress < 70) {
        gapReport += '<li><strong>Data Management:</strong> Insufficient data repository content and documentation.</li>';
    }
    
    gapReport += '<li><strong>Institutional Arrangements:</strong> Need for strengthened coordination mechanisms and clear mandates.</li>';
    gapReport += '<li><strong>Technical Capacity:</strong> Limited sector-specific expertise and GHG inventory experience.</li>';
    gapReport += '</ul>';
    
    gapReport += '<h4>Recommended Actions</h4>';
    gapReport += '<ol>';
    gapReport += '<li>Establish inter-institutional working groups for each BTR section</li>';
    gapReport += '<li>Develop standardized data collection templates for line ministries</li>';
    gapReport += '<li>Conduct capacity building workshops on ETF requirements</li>';
    gapReport += '<li>Secure sustainable funding for transparency activities</li>';
    gapReport += '<li>Develop country-specific emission factors for key categories</li>';
    gapReport += '</ol>';
    
    output.innerHTML = gapReport;
    addActivity('Generated Gap Analysis Report');
    showNotification('Gap Analysis Report generated successfully!', 'success');
}

function getComplianceColor(percentage) {
    if (percentage < 40) return '#dc3545';
    if (percentage < 70) return '#ffc107';
    return '#28a745';
}

function getSelectedReportSections() {
    var checkboxes = document.querySelectorAll('input[name="report-sections"]:checked');
    var selected = [];
    for (var i = 0; i < checkboxes.length; i++) {
        selected.push(checkboxes[i].value);
    }
    return selected;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

window.addEventListener('beforeunload', saveToLocalStorage);