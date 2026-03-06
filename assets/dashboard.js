let allIssues = [];

async function fetchIssues() {
    const loader = document.getElementById('loader');
    try {
        const response = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const data = await response.json();
        allIssues = data.data; 
        
        // Initial render with all issues
        updateIssueHeader(allIssues.length);
        renderIssues(allIssues);
    } catch (error) {
        console.error("Failed to fetch:", error);
        document.getElementById('issuesContainer').innerHTML = `<p class="col-span-full text-center py-10 text-red-400">Error loading data.</p>`;
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

/* Filters issues based on tab switch (all, Open, and Closed) */
function filterIssues(status) {
    let filtered;
    
    if (status === 'all') {
        filtered = allIssues;
    } else {
        filtered = allIssues.filter(issue => issue.status.toLowerCase() === status.toLowerCase());
    }

    // Update UI components
    updateIssueHeader(filtered.length);
    renderIssues(filtered);
    updateTabUI(status);
}

/* Update the visual active state of the filter buttons */
function updateTabUI(activeStatus) {
    const tabs = ['all', 'open', 'closed'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        if (btn) {
            if (tab === activeStatus) {
                btn.classList.add('active-tab');
            } else {
                btn.classList.remove('active-tab');
            }
        }
    });
}

function updateIssueHeader(count) {
    const countText = document.getElementById('issueCountText');
    if (countText) {
        countText.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="Aperture.png" alt="Aperture Icon" class="w-10 h-10 object-contain">
                <h2 class="text-xl font-bold text-[#111827] leading-none">${count} Issues</h2>
            </div>
        `;
    }
}

function renderIssues(issues) {
    const container = document.getElementById('issuesContainer');
    container.innerHTML = '';

    if (issues.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center py-20 text-gray-400">No issues found for this category.</p>`;
        return;
    }

    issues.forEach(issue => {
        const isOpen = issue.status.toLowerCase() === 'open';
        const statusIconSrc = isOpen ? 'Open-Status.png' : 'Closed-Status.png';
        const topBorderColor = isOpen ? 'border-t-[#10B981]' : 'border-t-[#8B5CF6]';
        
        let priorityStyle = "";
        const priority = issue.priority.toUpperCase();
        
        if (priority === "HIGH") {
            priorityStyle = "bg-[#FEECEC] text-[#EF4444]"; 
        } else if (priority === "MEDIUM") {
            priorityStyle = "bg-[#FFF6D1] text-[#F59E0B]"; 
        } else {
            priorityStyle = "bg-[#EEEFF2] text-[#9CA3AF]"; 
        }

        const card = document.createElement('div');
        card.className = `w-full bg-white border-t-4 ${topBorderColor} rounded-lg px-6 py-7 flex flex-col justify-between cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300`;
        card.onclick = () => showModal(issue);

        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <div class="w-10 h-10">
                        <img src="${statusIconSrc}" alt="${issue.status}" class="w-full h-full object-contain">
                    </div>
                    <span class="text-[11px] font-bold uppercase px-4 py-2 rounded-full ${priorityStyle}">
                        ${issue.priority}
                    </span>
                </div>
                <h3 class="font-bold text-[#111827] text-lg mb-3 leading-tight">${issue.title}</h3>
                <p class="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">${issue.description}</p>
                
                <div class="flex flex-wrap gap-2 mb-8">
                    <span class="flex items-center gap-1.5 bg-[#FFF1F2] text-[#E11D48] text-[10px] px-3 py-1.5 rounded-full font-bold border border-[#FECDD3]">
                        <i class="fa-solid fa-bug text-[11px]"></i> BUG
                    </span>
                    <span class="flex items-center gap-1.5 bg-[#FFF6D1] text-[#F59E0B] text-[10px] px-3 py-1.5 rounded-full font-bold border border-[#FEF3C7]">
                        <i class="fa-solid fa-life-ring text-[11px]"></i> HELP WANTED
                    </span>
                </div>
            </div>
            <div class="border-t border-gray-100 pt-6 mt-auto">
                <p class="text-gray-400 text-[11px] font-medium tracking-tight">#${issue.id.toString().slice(-4)} by ${issue.author}</p>
                <p class="text-gray-400 text-[11px] mt-1">${new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// fetch call
fetchIssues();