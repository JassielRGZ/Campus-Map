// script.js

const coordinates = {
    "Women's Hospital": { x: 115, y: 260 },
    "Emergency Room": { x: 480, y: 445 },
    "Medical Office Building": { x: 240, y: 360},
    "Plastics and Reconstructive Surgery": { x: 1000, y: 70 },
    "Orthopedic Sports and Therapy Institute Clinic": { x: 1270, y: 205},
    "Oncology Institute": { x: 280, y: 130 },
    "GME Family Medicine": { x:880, y: 510},
    "Women's Cafeteria": { x: 610, y: 340 },
    "Human Resources": { x: 500, y: 30 },
    "Diabetes and Endocrinology Institute": { x: 1140, y: 130},
    "Urology Institute": { x: 880, y: 400 },
    "Radiology - Main Hospital": { x: 450, y: 230 },
    "Medical Office Building 1st Floor": { x: 1250, y: 520 },
    "Pediatric Clinic": { x: 1000, y: 350 }
    // ...other locations
};

document.addEventListener('DOMContentLoaded', () => {
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

    window.addEventListener('resize', updatePinPositions);
});

function fetchExcelData() {
    fetch('ExportData.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const tickets = XLSX.utils.sheet_to_json(worksheet);

            const locationTickets = {};
            let totalTickets = 0;

            tickets.forEach(ticket => {
                const locationName = ticket["Location"];
                const ticketID = ticket["Ticket ID"];

                if (coordinates[locationName]) {
                    if (!locationTickets[locationName]) {
                        locationTickets[locationName] = [];
                    }
                    locationTickets[locationName].push(ticketID);
                    totalTickets++; // Increment total tickets
                }
            });

            // Update the total tickets card
            document.getElementById("total-tickets").textContent = totalTickets;

            Object.entries(locationTickets).forEach(([locationName, ticketIDs]) => {
                const { x, y } = coordinates[locationName];
                createPin(locationName, x, y, ticketIDs);
            });

            updatePinPositions();
        })
        .catch(error => console.error("Error loading Excel data:", error));
}

function createPin(locationName, originalX, originalY, ticketIDs) {
    const pin = document.createElement("img");
    pin.src = "pin.png";
    pin.classList.add("pin");
    pin.dataset.originalX = originalX;
    pin.dataset.originalY = originalY;
    pin.dataset.locationName = locationName;
    pin.dataset.tickets = JSON.stringify(ticketIDs);

    pin.addEventListener("click", () => {
        showTicketInfo(locationName, ticketIDs);
    });

    document.getElementById("pins-container").appendChild(pin);
}

function updatePinPositions() {
    const map = document.getElementById("campus-map");
    const mapWidth = map.offsetWidth;
    const mapHeight = map.offsetHeight;
    const originalMapWidth = 1399;
    const originalMapHeight = 683;

    const scaleX = mapWidth / originalMapWidth;
    const scaleY = mapHeight / originalMapHeight;

    document.querySelectorAll(".pin").forEach(pin => {
        const originalX = parseFloat(pin.dataset.originalX);
        const originalY = parseFloat(pin.dataset.originalY);

        pin.style.left = `${originalX * scaleX}px`;
        pin.style.top = `${originalY * scaleY}px`;
    });
}

function showTicketInfo(locationName, ticketIDs) {
    const ticketList = document.getElementById("ticket-list");
    const locationNameElement = document.getElementById("location-name");
    ticketList.innerHTML = "";

    locationNameElement.textContent = `Location: ${locationName}`;

    ticketIDs.forEach(id => {
        const listItem = document.createElement("li");
        listItem.textContent = `Ticket ID: ${id}`;
        ticketList.appendChild(listItem);
    });

    document.getElementById("ticket-info-modal").style.display = "block";
}
