    / 12か月分のデータ（簡易例）
    const months = [
        {name:"1月", days:31},
        {name:"2月", days:28},
        {name:"3月", days:31},
        {name:"4月", days:30},
        {name:"5月", days:31},
        {name:"6月", days:30},
        {name:"7月", days:31},
        {name:"8月", days:31},
        {name:"9月", days:30},
        {name:"10月", days:31},
        {name:"11月", days:30},
        {name:"12月", days:31},
    ];

    let currentMonth = 0; // 0=1月

    function renderCalendar(monthIndex){
        const calendar = document.getElementById("calendar");
        const month = months[monthIndex];
        document.getElementById("monthTitle").textContent = month.name;

        // 日付部分クリア
        calendar.querySelectorAll("tr:not(:first-child)").forEach(tr => tr.remove());

        let day = 1;
        while(day <= month.days){
            const row = document.createElement("tr");
            for(let i=0;i<7;i++){
                const cell = document.createElement("td");
                if(day <= month.days){
                    // TODO書くためのテキストエリア
                    const textarea = document.createElement("textarea");
                    textarea.placeholder = "TODO";
                    textarea.style.width = "50px";
                    textarea.style.height = "30px";
                    cell.appendChild(document.createTextNode(day));
                    cell.appendChild(document.createElement("br"));
                    cell.appendChild(textarea);
                    day++;
                }
                row.appendChild(cell);
            }
            calendar.appendChild(row);
        }
    }

    // 初回描画
    renderCalendar(currentMonth);

    // ページネーション
    document.getElementById("prevMonth").addEventListener("click", () => {
        if(currentMonth>0) currentMonth--;
        renderCalendar(currentMonth);
    });
    document.getElementById("nextMonth").addEventListener("click", () => {
        if(currentMonth<11) currentMonth++;
        renderCalendar(currentMonth);
    });