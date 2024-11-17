// script.js

const coordinates = {
    "Women's Hospital": { x: 650, y: 340 },
    "Emergency Room": { x: 350, y: 340 },
    "Medical Office Building": { x: 1240, y: 525 },
    "Plastics and Reconstructive Surgery": { x: 1230, y: 510 },
    "Orthopedic Sports and Therapy Institute Clinic": { x: 1020, y: 350 },
    "Oncology Institute": { x: 720, y: 160 },
    "GME Family Medicine": { x:940, y: 510},
    "Women's Cafeteria": { x: 610, y: 340 },
    "Human Resources": { x: 700, y: 50 },
    "Diabetes and Endocrinology Institute": { x: 910, y: 200 }
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

            tickets.forEach(ticket => {
                const locationName = ticket["Location"];
                const ticketID = ticket["Ticket ID"];

                if (coordinates[locationName]) {
                    if (!locationTickets[locationName]) {
                        locationTickets[locationName] = [];
                    }
                    locationTickets[locationName].push(ticketID);
                }
            });

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
    pin.dataset.locationName = locationName; // Store Location Name
    pin.dataset.tickets = JSON.stringify(ticketIDs);

    pin.setAttribute("aria-label", `Location: ${locationName}, Tickets: ${ticketIDs.join(", ")}`);
    pin.setAttribute("role", "button");

    pin.addEventListener("click", () => {
        showTicketInfo(locationName, ticketIDs);
    });

    document.getElementById("pins-container").appendChild(pin);
}

function updatePinPositions() {
    const map = document.getElementById("campus-map");
    const mapWidth = map.offsetWidth;
    const mapHeight = map.offsetHeight;
    const originalMapWidth = 1399; // Adjust to your original map's width
    const originalMapHeight = 683; // Adjust to your original map's height

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

    locationNameElement.textContent = `Location: ${locationName}`; // Display Location

    ticketIDs.forEach(id => {
        const listItem = document.createElement("li");
        listItem.textContent = `Ticket ID: ${id}`;
        ticketList.appendChild(listItem);
    });

    document.getElementById("ticket-info-modal").style.display = "block";
}
