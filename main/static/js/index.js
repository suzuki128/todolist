document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar");
    const monthTitle = document.getElementById("monthTitle");

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    const taskModal = document.getElementById("taskModal");
    const closeBtn = document.getElementById("closeBtn");
    const modalDate = document.getElementById("modalDate");
    const taskList = document.getElementById("taskList");
    const taskInput = document.getElementById("taskInput");
    const detailInput = document.getElementById("detailInput");
    const addTaskButton = document.getElementById("addTaskButton");

    let current = new Date();
    let tasks = {};
    // { "2025-12-01": [{name:"タスク名", detail:"詳細"}] }

    function renderCalendar() {
        calendar.innerHTML = "";

        const year = current.getFullYear();
        const month = current.getMonth();

        monthTitle.textContent = `${year}年 ${month + 1}月`;

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // 空白マス
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            calendar.appendChild(empty);
        }

        // 日付マス
        for (let date = 1; date <= lastDate; date++) {
            const cell = document.createElement("div");
            cell.className = "day";

            const key = `${year}-${month + 1}-${date}`;
            const tasksForCell = tasks[key] || [];

            // タスク4つまで表示
            const visibleTasks = tasksForCell.slice(0, 4);

            const taskDiv = document.createElement("div");
            taskDiv.className = "task-item";
            taskDiv.innerHTML = visibleTasks.map(t => `・${t.name || "(無題)"}`).join("<br>");

            cell.appendChild(document.createElement("div")).className = "day-number";
            cell.querySelector(".day-number").textContent = date;
            cell.appendChild(taskDiv);

            // 5個以上なら右下に …etc
            if (tasksForCell.length > 4) {
                const etcDiv = document.createElement("div");
                etcDiv.className = "etc-indicator";
                etcDiv.textContent = "…etc";
                cell.appendChild(etcDiv);
            }
        
            cell.addEventListener("click", () => openModal(key));
            calendar.appendChild(cell);
        }
    }

    function openModal(dateKey) {
        taskModal.style.display = "block";
        modalDate.textContent = dateKey;

        renderTaskList(dateKey);

        addTaskButton.onclick = () => {
            const name = taskInput.value.trim();
            const detail = detailInput.value.trim();

            if (!tasks[dateKey]) tasks[dateKey] = [];
            tasks[dateKey].push({ name: name, detail: detail });

            taskInput.value = "";
            detailInput.value = "";

            renderCalendar();
            renderTaskList(dateKey);
        };
    }

    function renderTaskList(dateKey) {
        taskList.innerHTML = "";

        (tasks[dateKey] || []).forEach((task, index) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.flexDirection = "column";
            li.style.marginBottom = "4px";

            const taskSpan = document.createElement("span");
            taskSpan.textContent = task.name || "(無題)";
            taskSpan.style.fontWeight = "bold";
            taskSpan.style.cursor = "pointer";

            // 詳細表示欄
            const detailDiv = document.createElement("div");
            detailDiv.textContent = task.detail || "";
            detailDiv.style.fontSize = "12px";
            detailDiv.style.color = "#555";
            detailDiv.style.display = "none";

            taskSpan.onclick = () => {
                detailDiv.style.display = detailDiv.style.display === "none" ? "block" : "none";
            };

            const delBtn = document.createElement("button");
            delBtn.textContent = "×";
            delBtn.style.color = "red";
            delBtn.style.border = "none";
            delBtn.style.background = "transparent";
            delBtn.style.cursor = "pointer";
            delBtn.onclick = () => {
                tasks[dateKey].splice(index, 1);
                if (tasks[dateKey].length === 0) delete tasks[dateKey];
                renderCalendar();
                renderTaskList(dateKey);
            };

            li.appendChild(taskSpan);
            li.appendChild(detailDiv);
            li.appendChild(delBtn);

            taskList.appendChild(li);
        });
    }

    closeBtn.onclick = () => {
        taskModal.style.display = "none";
        taskInput.value = "";
        detailInput.value = "";
    };

    prevBtn.onclick = () => {
        current.setMonth(current.getMonth() - 1);
        renderCalendar();
    };

    nextBtn.onclick = () => {
        current.setMonth(current.getMonth() + 1);
        renderCalendar();
    };

    renderCalendar();
});

