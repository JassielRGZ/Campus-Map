document.addEventListener('DOMContentLoaded', () => {
    // Load Excel data
    fetchExcelData();

    const modal = document.getElementById("ticket-info-modal");
    const closeButton = document.querySelector(".close-button");

    closeButton.onclick = () => {
        modal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Adjust pin positions on window resize
    window.addEventListener('resize', updatePinPositions);
});

function fetchExcelData() {
    fetch('tickets.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const tickets = XLSX.utils.sheet_to_json(worksheet);

            tickets.forEach(ticket => {
                if (ticket.x && ticket.y) {
                    createPin(ticket.x, ticket.y, ticket.TicketID);
                }
            });

            updatePinPositions(); // Initial positioning based on current window size
        });
}

function createPin(originalX, originalY, ticketID) {
    const pin = document.createElement("img");
    pin.src = "pin.png";
    pin.classList.add("pin");
    pin.dataset.ticketId = ticketID;
    pin.dataset.originalX = originalX; // Store original coordinates for scaling
    pin.dataset.originalY = originalY;

    pin.addEventListener("click", () => {
        showTicketInfo([ticketID]); // Modify to show all tickets at that location
    });

    document.getElementById("pins-container").appendChild(pin);
}

function updatePinPositions() {
    const map = document.getElementById("campus-map");
    const mapWidth = map.offsetWidth;
    const mapHeight = map.offsetHeight;
    const originalMapWidth = 800; // Replace with original width of your map image
    const originalMapHeight = 600; // Replace with original height of your map image

    const scaleX = mapWidth / originalMapWidth;
    const scaleY = mapHeight / originalMapHeight;

    document.querySelectorAll(".pin").forEach(pin => {
        const originalX = parseFloat(pin.dataset.originalX);
        const originalY = parseFloat(pin.dataset.originalY);
        
        pin.style.left = `${originalX * scaleX}px`;
        pin.style.top = `${originalY * scaleY}px`;
    });
}

function showTicketInfo(ticketIDs) {
    const ticketList = document.getElementById("ticket-list");
    ticketList.innerHTML = "";

    ticketIDs.forEach(id => {
        const listItem = document.createElement("li");
        listItem.textContent = `Ticket ID: ${id}`;
        ticketList.appendChild(listItem);
    });

    document.getElementById("ticket-info-modal").style.display = "block";
}
