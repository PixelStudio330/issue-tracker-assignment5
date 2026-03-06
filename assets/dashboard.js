let allIssues = [];

async function fetchIssues() {
    const loader = document.getElementById('loader');
    try {
        const response = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const data = await response.json();
        allIssues = data.data; 
        updateIssueHeader(allIssues.length);
        renderIssues(allIssues);
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById('issuesContainer').innerHTML = `<p class="col-span-full text-center py-10 text-red-400">Error loading data.</p>`;
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

function filterIssues(status) {
    let filtered = status === 'all' ? allIssues : allIssues.filter(issue => issue.status.toLowerCase() === status.toLowerCase());
    updateIssueHeader(filtered.length);
    renderIssues(filtered);
    updateTabUI(status);
}

function updateTabUI(activeStatus) {
    const tabs = ['all', 'open', 'closed'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        if (btn) {
            // We use px-8 to keep them consistently sized but not full-width
            if (tab === activeStatus) {
                btn.className = "tab-btn px-8 py-2.5 rounded-lg font-bold transition-all bg-[#4A00FF] text-white";
            } else {
                btn.className = "tab-btn px-8 py-2.5 rounded-lg font-bold transition-all text-gray-500 hover:bg-gray-50";
            }
        }
    });
}

function getPriorityStyle(priority) {
    const p = priority.toUpperCase();
    if (p === "HIGH") return "bg-[#FEECEC] text-[#EF4444]"; 
    if (p === "MEDIUM") return "bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]";
    return "bg-[#F3F4F6] text-[#6B7280] border border-gray-200";
}

function getModalPriorityStyle(priority) {
    const p = priority.toUpperCase();
    if (p === "HIGH") return "bg-[#EF4444] text-white border-none"; 
    if (p === "MEDIUM") return "bg-[#D97706] text-white border-none"; 
    return "bg-[#4B5563] text-white border-none"; 
}

async function showModal(issueSnippet) {
    const modal = document.getElementById('issueModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `<div class="flex justify-center py-20"><span class="loading loading-spinner loading-lg text-[#4A00FF]"></span></div>`;
    modal.showModal();

    try {
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${issueSnippet.id}`);
        const result = await response.json();
        const issue = result.data;

        const isOpen = issue.status.toLowerCase() === 'open';
        const statusBadge = isOpen ? 'bg-[#00BA71]' : 'bg-[#6366F1]';
        const modalPriorityStyle = getModalPriorityStyle(issue.priority);

        content.innerHTML = `
            <div class="space-y-6">
                <div>
                    <h2 class="text-3xl font-extrabold text-[#1F2937] mb-3">${issue.title}</h2>
                    <div class="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <span class="px-3 py-1 rounded-full text-white text-[12px] font-bold ${statusBadge}">
                            ${isOpen ? 'Opened' : 'Closed'}
                        </span>
                        <span>• Opened by <span class="text-gray-700 font-semibold">${issue.author}</span> • ${new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <span class="bg-[#FFF1F2] text-[#E11D48] text-[11px] px-3 py-1 rounded-full font-bold border border-[#FECDD3] flex items-center gap-1">
                        <i class="fa-solid fa-bug text-[10px]"></i> BUG
                    </span>
                    <span class="bg-[#FFFBEB] text-[#D97706] text-[11px] px-3 py-1 rounded-full font-bold border border-[#FEF3C7] flex items-center gap-1">
                        <i class="fa-solid fa-life-ring text-[10px]"></i> HELP WANTED
                    </span>
                </div>

                <div class="text-[#4B5563] text-lg leading-relaxed py-2">
                    ${issue.description}
                </div>

                <div class="bg-[#F9FAFB] rounded-2xl p-6 flex items-center border border-gray-100">
                    <div class="flex-1 space-y-1">
                        <p class="text-[12px] font-bold text-gray-400 uppercase tracking-tight">Assignee:</p>
                        <p class="text-[#111827] font-extrabold text-xl">${issue.author}</p>
                    </div>
                    
                    <div class="flex-1 flex flex-col items-center space-y-2">
                        <p class="text-[12px] font-bold text-gray-400 uppercase tracking-tight">Priority:</p>
                        <span class="px-5 py-1.5 rounded-full text-[12px] font-black uppercase ${modalPriorityStyle}">
                            ${issue.priority}
                        </span>
                    </div>

                    <div class="flex-1"></div> 
                </div>

                <div class="flex justify-end pt-2">
                    <form method="dialog">
                        <button class="bg-[#4A00FF] hover:bg-indigo-700 text-white px-10 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95">
                            Close
                        </button>
                    </form>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<p class="text-red-500 text-center py-10 font-bold">Error loading details.</p>`;
    }
}

function updateIssueHeader(count) {
    const countText = document.getElementById('issueCountText');
    if (countText) {
        countText.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="p-2 bg-indigo-50 rounded-full">
                    <img src="Aperture.png" alt="Icon" class="w-6 h-6 object-contain">
                </div>
                <div>
                    <h2 class="text-xl font-bold text-[#111827] leading-none">${count} Issues</h2>
                    <p class="text-xs text-gray-400 font-medium mt-1">Track and manage your project issues</p>
                </div>
            </div>
        `;
    }
}

function renderIssues(issues) {
    const container = document.getElementById('issuesContainer');
    container.innerHTML = '';

    issues.forEach(issue => {
        const isOpen = issue.status.toLowerCase() === 'open';
        const topBorder = isOpen ? 'border-t-[#10B981]' : 'border-t-[#8B5CF6]';
        const statusIcon = isOpen ? 'Open-Status.png' : 'Closed-Status.png';
        const priorityStyle = getPriorityStyle(issue.priority);

        const card = document.createElement('div');
        card.className = `w-full bg-white border-t-4 ${topBorder} rounded-xl px-6 py-7 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100`;
        card.onclick = () => showModal(issue);

        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-6">
                    <div class="w-6 h-6"><img src="${statusIcon}" class="w-full h-full object-contain opacity-80"></div>
                    <span class="text-[10px] font-bold uppercase px-3 py-1 rounded-full ${priorityStyle}">${issue.priority}</span>
                </div>
                <h3 class="font-extrabold text-[#111827] text-lg mb-2 leading-tight">${issue.title}</h3>
                <p class="text-gray-500 text-sm line-clamp-2 mb-6 font-medium">${issue.description}</p>
                <div class="flex flex-wrap gap-2 mb-8">
                    <span class="flex items-center gap-1 bg-[#FFF1F2] text-[#E11D48] text-[10px] px-3 py-1 rounded-full font-bold border border-[#FECDD3]"><i class="fa-solid fa-bug"></i> BUG</span>
                    <span class="flex items-center gap-1 bg-[#FFFBEB] text-[#D97706] text-[10px] px-3 py-1 rounded-full font-bold border border-[#FEF3C7]"><i class="fa-solid fa-life-ring"></i> HELP WANTED</span>
                </div>
            </div>
            <div class="border-t border-gray-100 pt-5 mt-auto">
                <p class="text-gray-400 text-[11px] font-bold tracking-tight mb-0.5">#${issue.id.toString().slice(-4)} by ${issue.author}</p>
                <p class="text-gray-400 text-[10px] font-medium">${new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

fetchIssues();