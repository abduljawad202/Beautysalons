document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let checklistResults = {};
    
    // Set today's date as default for inspection date
    document.getElementById('inspection-date').valueAsDate = new Date();
    
    // Initialize tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current button and pane
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            // Update results if results tab is clicked
            if (tabName === 'results') {
                updateResults();
            }
        });
    });
    
    // Generate checklist immediately after DOM is loaded
    generateChecklist();
    
    // Generate checklist
    function generateChecklist() {
        const container = document.getElementById('checklist-container');
        container.innerHTML = '';
        
        checklistData.categories.forEach((category, categoryIndex) => {
            // Create category element
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';
            
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.innerHTML = `
                <div class="category-title">${category.title}</div>
                <div class="category-progress">0%</div>
            `;
            categoryElement.appendChild(categoryHeader);
            
            // Create category content
            const categoryContent = document.createElement('div');
            categoryContent.className = 'category-content';
            
            // Add subcategories
            category.subcategories.forEach((subcategory, subcategoryIndex) => {
                // Create subcategory element
                const subcategoryElement = document.createElement('div');
                subcategoryElement.className = 'subcategory';
                
                // Create subcategory header
                const subcategoryHeader = document.createElement('div');
                subcategoryHeader.className = 'subcategory-header';
                subcategoryHeader.innerHTML = `
                    <div class="subcategory-title">${subcategory.title}</div>
                    <div class="subcategory-progress">0%</div>
                `;
                subcategoryElement.appendChild(subcategoryHeader);
                
                // Create checklist items container
                const checklistItems = document.createElement('div');
                checklistItems.className = 'checklist-items';
                
                // Add items
                subcategory.items.forEach((item, itemIndex) => {
                    const itemId = item.id;
                    const itemElement = document.createElement('div');
                    itemElement.className = 'checklist-item';
                    itemElement.id = `item-${itemId}`;
                    
                    // Create item content
                    itemElement.innerHTML = `
                        <div class="item-text">${item.text}</div>
                        <div class="item-actions">
                            <div class="item-status">
                                <button class="status-btn compliant-btn" data-status="compliant">
                                    <i class="fas fa-check"></i> مطابق
                                </button>
                                <button class="status-btn non-compliant-btn" data-status="non-compliant">
                                    <i class="fas fa-times"></i> غير مطابق
                                </button>
                                <button class="status-btn not-applicable-btn" data-status="not-applicable">
                                    <i class="fas fa-ban"></i> غير منطبق
                                </button>
                            </div>
                            <div class="item-notes-container">
                                <div class="notes-label">ملاحظات</div>
                                <textarea class="item-notes" placeholder="أضف ملاحظاتك هنا..."></textarea>
                            </div>
                        </div>
                    `;
                    
                    checklistItems.appendChild(itemElement);
                    
                    // Initialize result for this item
                    if (!checklistResults[itemId]) {
                        checklistResults[itemId] = {
                            status: null,
                            notes: ''
                        };
                    }
                });
                
                subcategoryElement.appendChild(checklistItems);
                categoryContent.appendChild(subcategoryElement);
            });
            
            categoryElement.appendChild(categoryContent);
            container.appendChild(categoryElement);
        });
        
        // Add event listeners to status buttons
        document.querySelectorAll('.status-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemElement = this.closest('.checklist-item');
                const itemId = itemElement.id.replace('item-', '');
                const status = this.getAttribute('data-status');
                
                // Remove selected class from all status buttons in this item
                itemElement.querySelectorAll('.status-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Add selected class to clicked button
                this.classList.add('selected');
                
                // Update result for this item
                checklistResults[itemId].status = status;
                
                // Update progress
                updateProgress();
            });
        });
        
        // Add event listeners to notes textareas
        document.querySelectorAll('.item-notes').forEach(textarea => {
            textarea.addEventListener('input', function() {
                const itemElement = this.closest('.checklist-item');
                const itemId = itemElement.id.replace('item-', '');
                
                // Update notes for this item
                checklistResults[itemId].notes = this.value;
            });
        });
        
        // Add event listeners to category headers (for collapsing)
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            });
        });
        
        // Add event listeners to subcategory headers (for collapsing)
        document.querySelectorAll('.subcategory-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            });
        });
        
        // Load saved results if available
        loadSavedResults();
        
        // Update progress
        updateProgress();
    }
    
    // Update progress
    function updateProgress() {
        let totalItems = 0;
        let completedItems = 0;
        
        // Count total and completed items
        checklistData.categories.forEach((category, categoryIndex) => {
            let categoryTotalItems = 0;
            let categoryCompletedItems = 0;
            
            category.subcategories.forEach((subcategory, subcategoryIndex) => {
                let subcategoryTotalItems = 0;
                let subcategoryCompletedItems = 0;
                
                subcategory.items.forEach((item) => {
                    const itemId = item.id;
                    totalItems++;
                    categoryTotalItems++;
                    subcategoryTotalItems++;
                    
                    if (checklistResults[itemId] && checklistResults[itemId].status) {
                        completedItems++;
                        categoryCompletedItems++;
                        subcategoryCompletedItems++;
                    }
                });
                
                // Update subcategory progress
                const subcategoryProgress = subcategoryTotalItems > 0 
                    ? Math.round((subcategoryCompletedItems / subcategoryTotalItems) * 100) 
                    : 0;
                
                const subcategoryElements = document.querySelectorAll('.subcategory-progress');
                if (subcategoryElements && subcategoryElements.length > 0) {
                    const subcategoryElement = subcategoryElements[subcategoryIndex];
                    if (subcategoryElement) {
                        subcategoryElement.textContent = `${subcategoryProgress}%`;
                    }
                }
            });
            
            // Update category progress
            const categoryProgress = categoryTotalItems > 0 
                ? Math.round((categoryCompletedItems / categoryTotalItems) * 100) 
                : 0;
            
            const categoryElements = document.querySelectorAll('.category-progress');
            if (categoryElements && categoryElements.length > 0) {
                const categoryElement = categoryElements[categoryIndex];
                if (categoryElement) {
                    categoryElement.textContent = `${categoryProgress}%`;
                }
            }
        });
        
        // Update overall progress
        const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        document.getElementById('completed-items').textContent = completedItems;
        document.getElementById('total-items').textContent = totalItems;
        document.getElementById('completion-percentage').textContent = `${progressPercentage}%`;
        document.getElementById('progress-bar').style.width = `${progressPercentage}%`;
    }
    
    // Update results
    function updateResults() {
        let totalItems = 0;
        let compliantItems = 0;
        let nonCompliantItems = 0;
        let notApplicableItems = 0;
        
        // Count items by status
        Object.entries(checklistResults).forEach(([itemId, result]) => {
            if (result.status) {
                totalItems++;
                
                if (result.status === 'compliant') {
                    compliantItems++;
                } else if (result.status === 'non-compliant') {
                    nonCompliantItems++;
                } else if (result.status === 'not-applicable') {
                    notApplicableItems++;
                }
            }
        });
        
        // Calculate compliance percentage (excluding not applicable items)
        const relevantItems = compliantItems + nonCompliantItems;
        const compliancePercentage = relevantItems > 0 
            ? Math.round((compliantItems / relevantItems) * 100) 
            : 0;
        
        // Update results summary
        document.getElementById('compliant-items').textContent = compliantItems;
        document.getElementById('non-compliant-items').textContent = nonCompliantItems;
        document.getElementById('not-applicable-items').textContent = notApplicableItems;
        document.getElementById('total-items-result').textContent = totalItems;
        document.getElementById('final-percentage').textContent = `${compliancePercentage}%`;
        
        // Update visit recommendation
        const recommendationElement = document.getElementById('visit-frequency');
        let recommendation = '';
        let recommendationClass = '';
        
        for (let i = 0; i < checklistData.visitFrequency.length; i++) {
            const threshold = checklistData.visitFrequency[i].threshold;
            if (compliancePercentage <= threshold) {
                recommendation = checklistData.visitFrequency[i].frequency;
                recommendationClass = `priority-${i+1}`;
                break;
            }
        }
        
        recommendationElement.textContent = recommendation;
        recommendationElement.className = recommendationClass;
        
        // Generate category results
        generateCategoryResults();
    }
    
    // Generate category results
    function generateCategoryResults() {
        const categoryResultsContainer = document.getElementById('category-results');
        categoryResultsContainer.innerHTML = '';
        
        checklistData.categories.forEach((category, categoryIndex) => {
            let categoryCompliantItems = 0;
            let categoryNonCompliantItems = 0;
            let categoryNotApplicableItems = 0;
            let categoryTotalItems = 0;
            
            // Count items by status for this category
            category.subcategories.forEach((subcategory) => {
                subcategory.items.forEach((item) => {
                    const itemId = item.id;
                    
                    if (checklistResults[itemId] && checklistResults[itemId].status) {
                        categoryTotalItems++;
                        
                        if (checklistResults[itemId].status === 'compliant') {
                            categoryCompliantItems++;
                        } else if (checklistResults[itemId].status === 'non-compliant') {
                            categoryNonCompliantItems++;
                        } else if (checklistResults[itemId].status === 'not-applicable') {
                            categoryNotApplicableItems++;
                        }
                    }
                });
            });
            
            // Calculate category compliance percentage (excluding not applicable items)
            const categoryRelevantItems = categoryCompliantItems + categoryNonCompliantItems;
            const categoryCompliancePercentage = categoryRelevantItems > 0 
                ? Math.round((categoryCompliantItems / categoryRelevantItems) * 100) 
                : 0;
            
            // Create category result element
            const categoryResultElement = document.createElement('div');
            categoryResultElement.className = 'category-result';
            
            categoryResultElement.innerHTML = `
                <div class="category-result-header">
                    <div class="category-result-title">${category.title}</div>
                    <div class="category-result-percentage ${getCategoryComplianceClass(categoryCompliancePercentage)}">
                        ${categoryCompliancePercentage}%
                    </div>
                </div>
                <div class="category-result-details">
                    <p>عناصر متوافقة: ${categoryCompliantItems}</p>
                    <p>عناصر غير متوافقة: ${categoryNonCompliantItems}</p>
                    <p>عناصر غير منطبقة: ${categoryNotApplicableItems}</p>
                </div>
                <div class="category-result-items">
                    <button class="toggle-items-btn" data-category="${categoryIndex}">
                        عرض التفاصيل <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="category-items-details hidden">
                        <!-- Items details will be added here -->
                    </div>
                </div>
            `;
            
            categoryResultsContainer.appendChild(categoryResultElement);
        });
        
        // Add event listeners to toggle items buttons
        document.querySelectorAll('.toggle-items-btn').forEach(button => {
            button.addEventListener('click', function() {
                const categoryIndex = this.getAttribute('data-category');
                const itemsDetails = this.nextElementSibling;
                
                if (itemsDetails.classList.contains('hidden')) {
                    // Show items details
                    itemsDetails.classList.remove('hidden');
                    this.innerHTML = `إخفاء التفاصيل <i class="fas fa-chevron-up"></i>`;
                    
                    // Generate items details if empty
                    if (itemsDetails.innerHTML === '') {
                        generateItemsDetails(itemsDetails, categoryIndex);
                    }
                } else {
                    // Hide items details
                    itemsDetails.classList.add('hidden');
                    this.innerHTML = `عرض التفاصيل <i class="fas fa-chevron-down"></i>`;
                }
            });
        });
    }
    
    // Generate items details for a category
    function generateItemsDetails(container, categoryIndex) {
        const category = checklistData.categories[categoryIndex];
        
        category.subcategories.forEach((subcategory) => {
            const subcategoryElement = document.createElement('div');
            subcategoryElement.className = 'subcategory-details';
            
            subcategoryElement.innerHTML = `
                <div class="subcategory-details-title">${subcategory.title}</div>
                <div class="subcategory-details-items"></div>
            `;
            
            const itemsContainer = subcategoryElement.querySelector('.subcategory-details-items');
            
            subcategory.items.forEach((item) => {
                const itemId = item.id;
                const result = checklistResults[itemId] || { status: null, notes: '' };
                
                const itemElement = document.createElement('div');
                itemElement.className = 'item-details';
                
                let statusClass = '';
                let statusText = 'لم يتم التقييم';
                
                if (result.status === 'compliant') {
                    statusClass = 'compliant';
                    statusText = 'مطابق';
                } else if (result.status === 'non-compliant') {
                    statusClass = 'non-compliant';
                    statusText = 'غير مطابق';
                } else if (result.status === 'not-applicable') {
                    statusClass = 'not-applicable';
                    statusText = 'غير منطبق';
                }
                
                itemElement.innerHTML = `
                    <div class="item-details-text">${item.text}</div>
                    <div class="item-details-status ${statusClass}">${statusText}</div>
                    ${result.notes ? `<div class="item-details-notes">ملاحظات: ${result.notes}</div>` : ''}
                `;
                
                itemsContainer.appendChild(itemElement);
            });
            
            container.appendChild(subcategoryElement);
        });
    }
    
    // Get category compliance class based on percentage
    function getCategoryComplianceClass(percentage) {
        if (percentage < 70) {
            return 'low-compliance';
        } else if (percentage < 85) {
            return 'medium-compliance';
        } else {
            return 'high-compliance';
        }
    }
    
    // Save results
    function saveResults() {
        const salonName = document.getElementById('salon-name').value;
        const licenseNumber = document.getElementById('license-number').value;
        const inspectionDate = document.getElementById('inspection-date').value;
        const inspectorName = document.getElementById('inspector-name').value;
        
        const data = {
            salonName,
            licenseNumber,
            inspectionDate,
            inspectorName,
            results: checklistResults,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('salonChecklistData', JSON.stringify(data));
        
        alert('تم حفظ النتائج بنجاح!');
    }
    
    // Load saved results
    function loadSavedResults() {
        const savedData = localStorage.getItem('salonChecklistData');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Restore salon info
            document.getElementById('salon-name').value = data.salonName || '';
            document.getElementById('license-number').value = data.licenseNumber || '';
            document.getElementById('inspection-date').value = data.inspectionDate || '';
            document.getElementById('inspector-name').value = data.inspectorName || '';
            
            // Restore results
            checklistResults = data.results || {};
            
            // Update UI to reflect loaded results
            Object.entries(checklistResults).forEach(([itemId, result]) => {
                const itemElement = document.getElementById(`item-${itemId}`);
                
                if (itemElement && result.status) {
                    // Update status button
                    const statusButton = itemElement.querySelector(`.status-btn[data-status="${result.status}"]`);
                    if (statusButton) {
                        itemElement.querySelectorAll('.status-btn').forEach(btn => {
                            btn.classList.remove('selected');
                        });
                        statusButton.classList.add('selected');
                    }
                    
                    // Update notes
                    const notesTextarea = itemElement.querySelector('.item-notes');
                    if (notesTextarea) {
                        notesTextarea.value = result.notes || '';
                    }
                }
            });
            
            // Update progress
            updateProgress();
            
            alert('تم استعادة النتائج المحفوظة!');
        }
    }
    
    // Reset checklist
    function resetChecklist() {
        if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط قائمة التحقق؟ سيتم مسح جميع النتائج.')) {
            // Clear results
            checklistResults = {};
            
            // Clear salon info
            document.getElementById('salon-name').value = '';
            document.getElementById('license-number').value = '';
            document.getElementById('inspection-date').valueAsDate = new Date();
            document.getElementById('inspector-name').value = '';
            
            // Reset UI
            document.querySelectorAll('.status-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            document.querySelectorAll('.item-notes').forEach(textarea => {
                textarea.value = '';
            });
            
            // Update progress
            updateProgress();
            
            alert('تم إعادة ضبط قائمة التحقق!');
        }
    }
    
    // Export results as PDF
    function exportPDF() {
        const { jsPDF } = window.jspdf;
        
        // Get salon info
        const salonName = document.getElementById('salon-name').value || 'غير محدد';
        const licenseNumber = document.getElementById('license-number').value || 'غير محدد';
        const inspectionDate = document.getElementById('inspection-date').value || 'غير محدد';
        const inspectorName = document.getElementById('inspector-name').value || 'غير محدد';
        
        // Get compliance stats
        let totalItems = 0;
        let compliantItems = 0;
        let nonCompliantItems = 0;
        let notApplicableItems = 0;
        
        Object.entries(checklistResults).forEach(([itemId, result]) => {
            if (result.status) {
                totalItems++;
                
                if (result.status === 'compliant') {
                    compliantItems++;
                } else if (result.status === 'non-compliant') {
                    nonCompliantItems++;
                } else if (result.status === 'not-applicable') {
                    notApplicableItems++;
                }
            }
        });
        
        const relevantItems = compliantItems + nonCompliantItems;
        const compliancePercentage = relevantItems > 0 
            ? Math.round((compliantItems / relevantItems) * 100) 
            : 0;
        
        // Create PDF
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true
        });
        
        // Add title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('تقرير تفتيش الصالونات النسائية', 105, 20, { align: 'center' });
        
        // Add salon info
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.text(`اسم الصالون: ${salonName}`, 190, 40, { align: 'right' });
        pdf.text(`رقم الرخصة: ${licenseNumber}`, 190, 50, { align: 'right' });
        pdf.text(`تاريخ التفتيش: ${inspectionDate}`, 190, 60, { align: 'right' });
        pdf.text(`اسم المفتش: ${inspectorName}`, 190, 70, { align: 'right' });
        
        // Add compliance summary
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('ملخص النتائج', 105, 90, { align: 'center' });
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.text(`نسبة المطابقة: ${compliancePercentage}%`, 190, 100, { align: 'right' });
        pdf.text(`عناصر متوافقة: ${compliantItems}`, 190, 110, { align: 'right' });
        pdf.text(`عناصر غير متوافقة: ${nonCompliantItems}`, 190, 120, { align: 'right' });
        pdf.text(`عناصر غير منطبقة: ${notApplicableItems}`, 190, 130, { align: 'right' });
        
        // Add visit recommendation
        let recommendation = '';
        
        for (let i = 0; i < checklistData.visitFrequency.length; i++) {
            const threshold = checklistData.visitFrequency[i].threshold;
            if (compliancePercentage <= threshold) {
                recommendation = checklistData.visitFrequency[i].frequency;
                break;
            }
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('توصية الزيارات:', 190, 150, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        pdf.text(recommendation, 150, 150, { align: 'right' });
        
        // Add detailed results
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('تفاصيل النتائج', 105, 170, { align: 'center' });
        
        let yPos = 180;
        
        checklistData.categories.forEach((category) => {
            // Add page if needed
            if (yPos > 270) {
                pdf.addPage();
                yPos = 20;
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(13);
            pdf.text(category.title, 190, yPos, { align: 'right' });
            yPos += 10;
            
            category.subcategories.forEach((subcategory) => {
                // Add page if needed
                if (yPos > 270) {
                    pdf.addPage();
                    yPos = 20;
                }
                
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(12);
                pdf.text(subcategory.title, 185, yPos, { align: 'right' });
                yPos += 10;
                
                subcategory.items.forEach((item) => {
                    // Add page if needed
                    if (yPos > 270) {
                        pdf.addPage();
                        yPos = 20;
                    }
                    
                    const itemId = item.id;
                    const result = checklistResults[itemId] || { status: null, notes: '' };
                    
                    let statusText = 'لم يتم التقييم';
                    
                    if (result.status === 'compliant') {
                        statusText = 'مطابق';
                    } else if (result.status === 'non-compliant') {
                        statusText = 'غير مطابق';
                    } else if (result.status === 'not-applicable') {
                        statusText = 'غير منطبق';
                    }
                    
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(10);
                    
                    // Wrap text if needed
                    const textLines = pdf.splitTextToSize(item.text, 150);
                    pdf.text(textLines, 180, yPos, { align: 'right' });
                    
                    pdf.text(statusText, 20, yPos);
                    
                    yPos += textLines.length * 5 + 2;
                    
                    if (result.notes) {
                        // Add page if needed
                        if (yPos > 270) {
                            pdf.addPage();
                            yPos = 20;
                        }
                        
                        pdf.setFont('helvetica', 'italic');
                        pdf.text('ملاحظات:', 180, yPos, { align: 'right' });
                        
                        const notesLines = pdf.splitTextToSize(result.notes, 150);
                        pdf.text(notesLines, 170, yPos, { align: 'right' });
                        
                        yPos += notesLines.length * 5 + 5;
                    } else {
                        yPos += 5;
                    }
                });
                
                yPos += 5;
            });
            
            yPos += 10;
        });
        
        // Add footer
        const totalPages = pdf.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.text(`الصفحة ${i} من ${totalPages}`, 105, 290, { align: 'center' });
            pdf.text(`تم إنشاؤه بواسطة: تطبيق قائمة تحقق اشتراطات الصالونات النسائية - Abduljawad2025`, 105, 295, { align: 'center' });
        }
        
        // Save PDF
        pdf.save(`تقرير_تفتيش_${salonName}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    // Export results as CSV
    function exportCSV() {
        // Get salon info
        const salonName = document.getElementById('salon-name').value || 'غير محدد';
        const licenseNumber = document.getElementById('license-number').value || 'غير محدد';
        const inspectionDate = document.getElementById('inspection-date').value || 'غير محدد';
        const inspectorName = document.getElementById('inspector-name').value || 'غير محدد';
        
        // Prepare CSV content
        let csvContent = 'الفئة,العنصر الفرعي,البند,الحالة,الملاحظات\n';
        
        checklistData.categories.forEach((category) => {
            category.subcategories.forEach((subcategory) => {
                subcategory.items.forEach((item) => {
                    const itemId = item.id;
                    const result = checklistResults[itemId] || { status: null, notes: '' };
                    
                    let statusText = 'لم يتم التقييم';
                    
                    if (result.status === 'compliant') {
                        statusText = 'مطابق';
                    } else if (result.status === 'non-compliant') {
                        statusText = 'غير مطابق';
                    } else if (result.status === 'not-applicable') {
                        statusText = 'غير منطبق';
                    }
                    
                    // Escape quotes in text fields
                    const escapedItemText = item.text.replace(/"/g, '""');
                    const escapedNotes = result.notes.replace(/"/g, '""');
                    
                    csvContent += `"${category.title}","${subcategory.title}","${escapedItemText}","${statusText}","${escapedNotes}"\n`;
                });
            });
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `تقرير_تفتيش_${salonName}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Print results
    function printResults() {
        window.print();
    }
    
    // Add event listeners to action buttons
    document.getElementById('save-results').addEventListener('click', saveResults);
    document.getElementById('load-results').addEventListener('click', loadSavedResults);
    document.getElementById('reset-checklist').addEventListener('click', resetChecklist);
    document.getElementById('export-pdf').addEventListener('click', exportPDF);
    document.getElementById('export-csv').addEventListener('click', exportCSV);
    document.getElementById('print-results').addEventListener('click', printResults);
});
