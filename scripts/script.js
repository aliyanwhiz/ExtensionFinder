document.addEventListener("DOMContentLoaded", function () {
    const dataTable = document.getElementById("dataTable");
    const editModule = document.getElementById("editModule");
    const addModule = document.getElementById("addModule");
    const uploadModule = document.getElementById("uploadModule");
    const myInput = document.getElementById("myInput");

    const Inputfocus = () => {
        myInput.focus();
    };


    Inputfocus();
    let currentData = [];
    let selectedItemId = null;

    function generateTableRows(data) {
        const tableBody = dataTable.querySelector("tbody");
        tableBody.innerHTML = "";

        data.forEach((item) => {
            if (item && typeof item === 'object' && item.extension !== undefined && item.department !== undefined && item.user !== undefined) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><span class="rounded rounded-pill px-2 py-1 bg-dark">${item.extension}</span></td>
                    <td><span class="rounded rounded-pill px-2 py-1 bg-dark">${item.department}</span></td>
                    <td><span class="rounded rounded-pill px-2 py-1 bg-dark">${item.user}</span></td>
                    <td class="d-flex">
                        <button class="edit-btn btn btn-sm rounded rounded-circle bg-dark mx-2 text-warning" data-id="${item.id}"><i class="fa fa-edit"></i></button>
                        <button class="delete-btn btn btn-sm rounded rounded-circle bg-dark mx-2 text-danger" data-id="${item.id}"><i class="fa fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            } else {
                console.error("Invalid data item:", item);
            }
        });

        dataTable.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", function () {
                selectedItemId = this.dataset.id;
                const selectedItem = currentData.find(
                    (item) => item.id == selectedItemId
                );
                if (selectedItem) {
                    document.getElementById("editExtension").value = selectedItem.extension;
                    document.getElementById("editDepartment").value = selectedItem.department;
                    document.getElementById("editUser").value = selectedItem.user;
                    editModule.style.display = "block";
                }
            });
        });

        dataTable.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", function () {
                const id = this.dataset.id;
                if (confirm("Are you sure you want to delete this contact?")) {
                    fetch(`http://172.16.200.235:8082/api/data/${id}`, {
                        method: "DELETE",
                    })
                        .then((response) => {
                            if (response.ok) {
                                fetchData();
                            } else {
                                alert("Failed to delete contact.");
                            }
                        })
                        .catch((error) => console.error("Error deleting data:", error));
                }
            });
        });
    }

    function dataSort(data) {
        return data.sort((a, b) => parseInt(a.extension) - parseInt(b.extension));
    }

    function fetchData() {
        fetch("http://172.16.200.235:8082/api/data")
            .then((response) => response.json())
            .then((data) => {
                currentData = data;
                generateTableRows(dataSort(data));
            })
            .catch((error) => console.error("Error fetching data:", error));
    }

    myInput.addEventListener("keyup", function () {
        const value = this.value.toLowerCase();
        const filteredData = currentData.filter((item) => {
            return Object.entries(item)
                .filter(([key]) => key !== "id")
                .some(([, val]) => String(val).toLowerCase().includes(value));
        });
        generateTableRows(filteredData);
    });

    document.getElementById("addButton").addEventListener("click", function () {
        addModule.style.display = "block";
    });
    document.getElementById("uploadButton").addEventListener("click", function () {
        uploadModule.style.display = "block";
    });

    document
        .getElementById("editForm")
        .addEventListener("submit", function (event) {
            debugger
            event.preventDefault();
            const extension = document.getElementById("editExtension").value;
            const department = document.getElementById("editDepartment").value;
            const user = document.getElementById("editUser").value;

            fetch(`http://172.16.200.235:8082/api/data/${selectedItemId}`,
                {
                
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: parseInt(selectedItemId),
                    extension,
                    department,
                    user,
                }),
            })
            .then((response) => {
                    debugger
                    if (response.ok) {
                        editModule.style.display = "none";
                        fetchData();
                    } else {
                        alert("Failed to update contact.");
                    }
                })
                .catch((error) => console.error("Error updating data:", error));
        });

    document.getElementById("uploadForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        const fileInput = document.getElementById("UploadExtension");
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        fetch("http://172.16.200.235:8082/api/excel/upload", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    uploadModule.style.display = "none";
                    fetchData();
                } else {
                    alert("Failed to upload file.");
                }
            })
            .catch((error) => console.error("Error uploading file:", error));
    });

    document
        .getElementById("addForm")
        .addEventListener("submit", function (event) {
            event.preventDefault();
            const extension = document.getElementById("addExtension").value;
            const department = document.getElementById("addDepartment").value;
            user = document.getElementById("addUser").value;

            fetch("http://172.16.200.235:8082/api/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ extension, department, user }),
            })
                .then((response) => {
                    if (response.ok) {
                        addModule.style.display = "none";
                        fetchData();
                    } else {
                        alert("Failed to add contact.");
                    }
                })
                .catch((error) => console.error("Error adding data:", error));
        });

    document.getElementById("cancelEdit").addEventListener("click", function () {
        editModule.style.display = "none";
    });

    document.getElementById("cancelAdd").addEventListener("click", function () {
        addModule.style.display = "none";
    });
    document.getElementById("cancelupload").addEventListener("click", function () {
        uploadModule.style.display = "none";
    });

    fetchData();
});