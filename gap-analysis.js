// Add these enhancements to the existing gap-analysis.js

function updateGapAnalysisSummary() {
    var scores = calculateGapAnalysisScores();
    
    var totalScore = 0;
    var totalCount = 0;
    
    var scoreKeys = Object.keys(scores);
    for (var i = 0; i < scoreKeys.length; i++) {
        var category = scoreKeys[i];
        if (scores[category].count > 0) {
            totalScore += scores[category].total;
            totalCount += scores[category].count;
        }
    }
    
    var overallCompliance = totalCount > 0 ? Math.round((totalScore / (totalCount * 100)) * 100) : 0;
    
    var complianceScore = document.getElementById('compliance-score');
    if (complianceScore) {
        complianceScore.querySelector('.score-value').textContent = overallCompliance + '%';
        complianceScore.style.background = getComplianceColor(overallCompliance);
    }
    
    // Update category scores
    for (var i = 0; i < scoreKeys.length; i++) {
        var category = scoreKeys[i];
        var categoryScore = scores[category].count > 0 ? 
            Math.round((scores[category].total / (scores[category].count * 100)) * 100) : 0;
        
        var scoreElement = document.getElementById(category + '-score');
        if (scoreElement) {
            scoreElement.textContent = categoryScore + '%';
            scoreElement.className = 'breakdown-score ' + getScoreClass(categoryScore);
        }
    }
    
    updatePriorityActions();
    updateRecommendations();
}

function getComplianceColor(percentage) {
    if (percentage < 40) return '#dc3545';
    if (percentage < 70) return '#ffc107';
    return '#28a745';
}

function getScoreClass(score) {
    if (score < 40) return 'low';
    if (score < 70) return 'medium';
    return 'high';
}

function updatePriorityActions() {
    var scores = calculateGapAnalysisScores();
    var priorityList = document.getElementById('priority-actions-list');
    
    if (!priorityList) return;
    
    var priorities = [];
    
    // Check institutional structures
    var institutionalScore = scores.institutional.count > 0 ? 
        Math.round((scores.institutional.total / (scores.institutional.count * 100)) * 100) : 0;
    if (institutionalScore < 50) {
        priorities.push('Establish clear institutional mandates and coordination mechanisms');
    }
    
    // Check technical capacities
    var technicalScore = scores.technical.count > 0 ? 
        Math.round((scores.technical.total / (scores.technical.count * 100)) * 100) : 0;
    if (technicalScore < 50) {
        priorities.push('Build technical capacity for GHG inventory development and sectoral expertise');
    }
    
    // Check data systems
    var dataSystemsScore = scores.dataSystems.count > 0 ? 
        Math.round((scores.dataSystems.total / (scores.dataSystems.count * 100)) * 100) : 0;
    if (dataSystemsScore < 50) {
        priorities.push('Improve data collection systems and develop country-specific emission factors');
    }
    
    // Check financial resources
    var financialScore = scores.financial.count > 0 ? 
        Math.round((scores.financial.total / (scores.financial.count * 100)) * 100) : 0;
    if (financialScore < 50) {
        priorities.push('Secure sustainable funding for ETF implementation');
    }
    
    // Default priority if no specific gaps identified
    if (priorities.length === 0) {
        priorities.push('Continue current implementation efforts and focus on sustainability');
    }
    
    var html = '<ul>';
    for (var i = 0; i < priorities.length; i++) {
        html += '<li>' + priorities[i] + '</li>';
    }
    html += '</ul>';
    
    priorityList.innerHTML = html;
}

function updateRecommendations() {
    var scores = calculateGapAnalysisScores();
    var recommendationsList = document.getElementById('recommendations-list');
    
    if (!recommendationsList) return;
    
    var recommendations = [];
    
    // Institutional recommendations
    var institutionalScore = scores.institutional.count > 0 ? 
        Math.round((scores.institutional.total / (scores.institutional.count * 100)) * 100) : 0;
    if (institutionalScore < 70) {
        recommendations.push('Formalize MECCNAR\'s mandate for BTR coordination through official documentation');
        recommendations.push('Establish regular inter-ministerial coordination meetings with clear agendas');
        recommendations.push('Develop Terms of Reference for institutional working groups');
    }
    
    // Technical recommendations
    var technicalScore = scores.technical.count > 0 ? 
        Math.round((scores.technical.total / (scores.technical.count * 100)) * 100) : 0;
    if (technicalScore < 70) {
        recommendations.push('Develop comprehensive training program on IPCC methodologies');
        recommendations.push('Establish sectoral expert groups for key emission categories');
        recommendations.push('Create knowledge sharing platform for technical staff');
    }
    
    // Data systems recommendations
    var dataSystemsScore = scores.dataSystems.count > 0 ? 
        Math.round((scores.dataSystems.total / (scores.dataSystems.count * 100)) * 100) : 0;
    if (dataSystemsScore < 70) {
        recommendations.push('Develop standardized data collection templates for all sectors');
        recommendations.push('Establish data quality assurance/quality control procedures');
        recommendations.push('Create centralized data repository with metadata documentation');
    }
    
    // Financial recommendations
    var financialScore = scores.financial.count > 0 ? 
        Math.round((scores.financial.total / (scores.financial.count * 100)) * 100) : 0;
    if (financialScore < 70) {
        recommendations.push('Develop sustainable funding strategy for ETF implementation');
        recommendations.push('Integrate transparency activities into national budgeting processes');
        recommendations.push('Explore innovative financing mechanisms for climate transparency');
    }
    
    var html = '<ul>';
    for (var i = 0; i < recommendations.length; i++) {
        html += '<li>' + recommendations[i] + '</li>';
    }
    html += '</ul>';
    
    recommendationsList.innerHTML = html;
}

function exportGapAnalysis() {
    var scores = calculateGapAnalysisScores();
    var overallCompliance = document.getElementById('compliance-score').querySelector('.score-value').textContent;
    
    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ETF Gap Analysis Export - The Gambia\r\n";
    csvContent += "Generated: " + new Date().toLocaleDateString() + "\r\n\r\n";
    
    csvContent += "Category,Score,Status\r\n";
    csvContent += "Overall Compliance," + overallCompliance + "," + getStatusText(parseInt(overallCompliance)) + "\r\n";
    
    var categories = ['institutional', 'technical', 'dataSystems', 'financial'];
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var categoryScore = scores[category].count > 0 ? 
            Math.round((scores[category].total / (scores[category].count * 100)) * 100) : 0;
        csvContent += category + "," + categoryScore + "%," + getStatusText(categoryScore) + "\r\n";
    }
    
    csvContent += "\r\nPriority Actions:\r\n";
    var priorityItems = document.querySelectorAll('#priority-actions-list li');
    for (var i = 0; i < priorityItems.length; i++) {
        csvContent += priorityItems[i].textContent + "\r\n";
    }
    
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gambia_etf_gap_analysis.csv");
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
    
    showNotification('Gap analysis exported to CSV successfully!', 'success');
}

function getStatusText(score) {
    if (score < 40) return 'Critical Gap';
    if (score < 70) return 'Partial Compliance';
    return 'Substantial Compliance';
}

// Enhanced initialization
function initGapAnalysis() {
    loadGapAnalysisData();
    updateGapAnalysisSummary();
    setupGapAnalysisEventListeners();
    
    // Add notification styles if not present
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
}

function showNotification(message, type) {
    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.innerHTML = '<span class="notification-message">' + message + '</span><button class="notification-close">&times;</button>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

document.addEventListener('DOMContentLoaded', initGapAnalysis);