// ...existing code...
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("calendar-grid");
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
    let tasks = {}; // { "YYYY-MM-DD": [{name, detail}, ...] }

    function renderCalendar() {
        grid.innerHTML = "";

        const year = current.getFullYear();
        const month = current.getMonth();

        monthTitle.textContent = `${year}年 ${month + 1}月`;

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // 空白マス（先頭のズレ）
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.className = "date-cell empty";
            grid.appendChild(empty);
        }

        // 日付マス
        for (let date = 1; date <= lastDate; date++) {
            const cell = document.createElement("div");
            cell.className = "day";

            // 曜日クラス（日曜・土曜の色付け用）
            const dayOfWeek = new Date(year, month, date).getDay();
            if (dayOfWeek === 0) cell.classList.add("sunday");
            if (dayOfWeek === 6) cell.classList.add("saturday");

            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
            const tasksForCell = tasks[key] || [];

            const dn = document.createElement("div");
            dn.className = "day-number";
            dn.textContent = date;
            cell.appendChild(dn);

            const tdiv = document.createElement("div");
            tdiv.className = "task-item";
            tdiv.innerHTML = tasksForCell.slice(0, 4).map(t => "・" + (t.name || "(無題)")).join("<br>");
            cell.appendChild(tdiv);

            if (tasksForCell.length > 4) {
                const etc = document.createElement("div");
                etc.className = "etc-indicator";
                etc.textContent = "…etc";
                cell.appendChild(etc);
            }

            cell.addEventListener("click", () => openModal(key));
            grid.appendChild(cell);
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
            tasks[dateKey].push({ name, detail });

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