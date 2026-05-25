let rowCount = 1;
const MAX_MEMBERS = 6;

function addMemberRow() {

    const table = document.querySelector("#memberTable tbody");
    const currentRows = table.querySelectorAll("tr").length;

    // ✅ Check max limit
    if (currentRows >= MAX_MEMBERS) {
        showToastPage("Maximum 6 performers allowed!", "error");
        return;
    }

    rowCount++;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="text" class="p-name" placeholder="Performer Name"></td>
        <td><input type="number" class="p-age" placeholder="Age" min="1" max="18" oninput="if(this.value > 18) this.value = 18; if(this.value < 1) this.value = 1;"></td>
        <td><input type="text" class="p-instrument" placeholder="Instrument"></td>
        <td>
            <label class="upload-label" id="proof-label-${rowCount}">
                <input type="file" class="p-proof" accept=".pdf,.jpg,.jpeg,.png"
                       onchange="handleFileUpload(this, 'proof-label-${rowCount}')">
                <span class="upload-text">
                    <i class="ri-upload-2-line"></i> Upload Proof
                </span>
            </label>
        </td>
        <td>
            <label class="upload-label" id="consent-label-${rowCount}">
                <input type="file" class="p-consent" accept=".pdf,.jpg,.jpeg,.png"
                       onchange="handleFileUpload(this, 'consent-label-${rowCount}')">
                <span class="upload-text">
                    <i class="ri-upload-2-line"></i> Upload Consent
                </span>
            </label>
        </td>
        <td>
            <button type="button" class="delete-btn" onclick="deleteRow(this)">
                <i class="ri-delete-bin-6-line"></i>
            </button>
        </td>
    `;

    table.appendChild(row);

    // ✅ Hide button when max reached
    updateAddButton();
}

function deleteRow(btn) {
    btn.closest("tr").remove();

    // ✅ Show button again when row deleted
    updateAddButton();
}

function updateAddButton() {
    const table       = document.querySelector("#memberTable tbody");
    const currentRows = table.querySelectorAll("tr").length;
    const addBtn      = document.querySelector(".add-member-btn");

    if (currentRows >= MAX_MEMBERS) {
        addBtn.disabled = true;
        addBtn.style.opacity = "0.5";
        addBtn.style.cursor  = "not-allowed";
    } else {
        addBtn.disabled = false;
        addBtn.style.opacity = "1";
        addBtn.style.cursor  = "pointer";
    }
}

// function handleFileUpload(input, labelId) {
//     const label = document.getElementById(labelId);
//     const span  = label.querySelector(".upload-text");

//     if (input.files && input.files[0]) {
//         const file     = input.files[0];
//         const fileName = file.name;

//         // Trim long file names
//         const shortName = fileName.length > 15 
//             ? fileName.substring(0, 12) + "..." 
//             : fileName;

//         // Update label to show uploaded state
//         span.innerHTML = `<i class="ri-checkbox-circle-fill"></i> ${shortName}`;
//         label.classList.add("uploaded");
//     }
// }

function handleFileUpload(input, labelId) {
    const label = document.getElementById(labelId);
    const span  = label.querySelector(".upload-text");

    if (input.files && input.files[0]) {
        const file = input.files[0];

        // If image, compress it
        if (file.type.startsWith("image/")) {
            compressImage(file, 2).then(compressedFile => {
                // Replace file in input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(compressedFile);
                input.files = dataTransfer.files;

                updateLabel(label, span, compressedFile.name, compressedFile.size);
            });
        } else {
            // PDF or video — just show name
            updateLabel(label, span, file.name, file.size);
        }
    }
}

// ✅ Compress image under 2MB
function compressImage(file, maxSizeMB) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                const canvas  = document.createElement("canvas");
                let width     = img.width;
                let height    = img.height;

                // Resize if too large
                const MAX_DIM = 1920;
                if (width > MAX_DIM || height > MAX_DIM) {
                    if (width > height) {
                        height = Math.round((height * MAX_DIM) / width);
                        width  = MAX_DIM;
                    } else {
                        width  = Math.round((width * MAX_DIM) / height);
                        height = MAX_DIM;
                    }
                }

                canvas.width  = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Compress quality
                let quality = 0.9;
                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File(
                            [blob],
                            file.name,
                            { type: file.type, lastModified: Date.now() }
                        );
                        resolve(compressedFile);
                    },
                    file.type,
                    quality
                );
            };
        };
    });
}

// ✅ Update label UI
function updateLabel(label, span, fileName, fileSize) {
    const shortName = fileName.length > 15
        ? fileName.substring(0, 12) + "..."
        : fileName;

    const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    span.innerHTML = `<i class="ri-checkbox-circle-fill"></i> ${shortName} (${sizeMB}MB)`;
    label.classList.add("uploaded");
}



let submitCallback = null;

function confirmSubmission(){

    document.getElementById("confirmModal").style.display = "flex";

    return new Promise((resolve) => {
        submitCallback = resolve;
    });

}

function closeConfirm(result){

    document.getElementById("confirmModal").style.display = "none";

    if(submitCallback){
        submitCallback(result);
    }

}

function showToastPage(message,type){

    const toast = document.getElementById("toast");

    toast.className = "";

    toast.classList.add("show");
    toast.classList.add(type);

    toast.innerText = message;

    setTimeout(()=>{
        toast.classList.remove("show");
    },3000);

}

// document.addEventListener("DOMContentLoaded", function () {

//     const form = document.getElementById("bandForm");

//     if (!form) {
//         console.error("❌ bandForm not found");
//         return;
//     }

//     form.addEventListener("submit", async function (e) {

//         e.preventDefault();

//         const checkboxes = document.querySelectorAll(".declaration-checkbox");

//         const allChecked = [...checkboxes].every(cb => cb.checked);

//         if (!allChecked) {

//             showToastPage(
//                 "Please accept all declarations",
//                 "error"
//             );

//             return;
//         }

//         const confirmed = await confirmSubmission();
//         if (!confirmed) return;
//         console.log("Submitting form...");

//         // -------------------------
//         // 1. Collect performers
//         // -------------------------
//         let performers = [];

//         document.querySelectorAll("#memberTable tbody tr").forEach(row => {

//             const name = row.querySelector(".p-name").value;
//             const age = row.querySelector(".p-age").value;
//             const instrument = row.querySelector(".p-instrument").value;
//             const proof      = row.querySelector(".p-proof")?.files[0];
//             const consent    = row.querySelector(".p-consent")?.files[0];

//             if (name || age || instrument) {
//                 performers.push({
//                     name,
//                     age,
//                     instrument
//                 });
//                 if (proof)   formData.append(`proof_${index}`, proof);
//                 if (consent) formData.append(`consent_${index}`, consent);
//             }

//         });

//         // -------------------------
//         // 2. FormData
//         // -------------------------
//         const btn =
//         document.querySelector(".submit-btn");

//         btn.disabled = true;
//         btn.innerText = "Submitting...";
//         btn.disabled = false;
//         btn.innerText = "Submit Entry Form";

//         const formData = new FormData(form);
//         // const docs = document.getElementById("documents").files;
//         const video = document.getElementById("songVideo").files[0];
//         const schoolType =
//         document.querySelector(
//         'input[name="school_type"]:checked'
//         )?.value;

//         const zone =
//         document.querySelector(
//         'input[name="zone"]:checked'
//         )?.value;

//         const song1 =
//         document.getElementById("song1").value;

//         const song2 =
//         document.getElementById("song2").value;

//         const composer =
//         document.getElementById("composer").value;

//         formData.append("school_name", document.getElementById("schoolName").value);
//         formData.append("city", document.getElementById("city").value);
//         formData.append("address", document.getElementById("Address").value);
//         formData.append("contact_person", document.getElementById("contactPerson").value);
//         formData.append("designation", document.getElementById("designation").value);
//         formData.append("contact_number", document.getElementById("contactNumber").value);
//         formData.append("contact_email", document.getElementById("contactEmail").value);
//         formData.append("total_members", document.getElementById("totalMembers").value);
//         formData.append("performance_duration", document.getElementById("performanceDuration").value);
//         formData.append("school_type", schoolType);
//         formData.append("zone", zone);

//         formData.append("song1", song1);
//         formData.append("song2", song2);

//         formData.append("composer", composer);

//         // files

//         // for (let i = 0; i < docs.length; i++) {
//         //     formData.append("documents", docs[i]);
//         // }

//         formData.append("song_video", video);

//         // performers JSON
//         formData.append("performers", JSON.stringify(performers));
//         if(!song1 && !song2){

//             showToastPage(
//             "Please select Song 1 or enter Song 2",
//             "error"
//             );

//             return;
//         }
//         if(song2 && !composer){

//             showToastPage(
//             "Please enter composer name",
//             "error"
//             );

//             return;
//         }

//         // -------------------------
//         // 3. API CALL
//         // -------------------------
//         try {

//             const response = await fetch(`${CONFIG.API_BASE_URL}/api/band-submit/`, {
//                 method: "POST",
//                 body: formData
//             });

//             const data = await response.json();

//             console.log(data);

//             if (data.status === "success") {
//                 // alert("Submitted Successfully");
//                 showToastPage(
//                     "Entry submitted successfully",
//                     "success"
//                 );

//                 form.reset();
//             } else {
//                 // alert("Error submitting form");
//                 showToastPage(
//                     "Submission failed",
//                     "error"
//                 );
//             }

//         } catch (err) {
//             console.error(err);
//             showToastPage(
//                 "Server error",
//                 "error"
//             );

//         }

//     });

// });
// document.addEventListener("DOMContentLoaded", function () {

//     const form = document.getElementById("bandForm");  // ✅ form defined here

//     if (!form) {
//         console.error("❌ bandForm not found");
//         return;
//     }
//     form.addEventListener("submit", async function (e) {

//         e.preventDefault();

//         const checkboxes = document.querySelectorAll(".declaration-checkbox");
//         const allChecked = [...checkboxes].every(cb => cb.checked);

//         if (!allChecked) {
//             showToastPage("Please accept all declarations", "error");
//             return;
//         }

//         const confirmed = await confirmSubmission();
//         if (!confirmed) return;

//         console.log("Submitting form...");

//         // ✅ Move formData to TOP before performers loop
//         const formData = new FormData(form);

//         // -------------------------
//         // 1. Collect performers
//         // -------------------------
//         let performers = [];

//         document.querySelectorAll("#memberTable tbody tr").forEach((row, index) => {  // ✅ Add index here

//             const name       = row.querySelector(".p-name").value;
//             const age        = row.querySelector(".p-age").value;
//             const instrument = row.querySelector(".p-instrument").value;
//             const proof      = row.querySelector(".p-proof")?.files[0];
//             const consent    = row.querySelector(".p-consent")?.files[0];

//             if (name || age || instrument) {
//                 performers.push({ name, age, instrument });

//                 if (proof)   formData.append(`proof_${index}`, proof);
//                 if (consent) formData.append(`consent_${index}`, consent);
//             }
//         });

//         // -------------------------
//         // 2. FormData — rest of your fields
//         // -------------------------
//         const btn = document.querySelector(".submit-btn");
//         btn.disabled = true;
//         btn.innerText = "Submitting...";

//         const video      = document.getElementById("songVideo").files[0];
//         if (video) {
//             const videoSizeMB = video.size / (1024 * 1024);
//             if (videoSizeMB > 100) {
//                 showToastPage(`Video is ${videoSizeMB.toFixed(0)}MB. Please upload under 100MB`, "error");
//                 btn.disabled = false;
//                 btn.innerText = "Submit Entry Form";
//                 return;
//             }
//         }
//         const schoolType = document.querySelector('input[name="school_type"]:checked')?.value;
//         const zone       = document.querySelector('input[name="zone"]:checked')?.value;
//         const song1      = document.getElementById("song1").value;
//         const song2      = document.getElementById("song2").value;
//         const composer   = document.getElementById("composer").value;

//         formData.append("school_name",          document.getElementById("schoolName").value);
//         formData.append("state",                document.getElementById("state").value);
//         formData.append("city",                 document.getElementById("city").value);
//         formData.append("address",              document.getElementById("Address").value);
//         formData.append("contact_person",       document.getElementById("contactPerson").value);
//         formData.append("designation",          document.getElementById("designation").value);
//         formData.append("contact_number",       document.getElementById("contactNumber").value);
//         formData.append("contact_email",        document.getElementById("contactEmail").value);
//         formData.append("total_members",        document.getElementById("totalMembers").value);
//         // formData.append("performance_duration", document.getElementById("performanceDuration").value);
//         formData.append("school_type",          schoolType);
//         formData.append("zone",                 zone);
//         formData.append("song1",                song1);
//         formData.append("song2",                song2);
//         formData.append("composer",             composer);
//         formData.append("song_video",           video);
//         formData.append("performers",           JSON.stringify(performers));

//         // Validation
//         if (!song1 && !song2) {
//             showToastPage("Please select Song 1 or enter Song 2", "error");
//             btn.disabled = false;
//             btn.innerText = "Submit Entry Form";
//             return;
//         }

//         if (song2 && !composer) {
//             showToastPage("Please enter composer name", "error");
//             btn.disabled = false;
//             btn.innerText = "Submit Entry Form";
//             return;
//         }

//         // -------------------------
//         // 3. API CALL
//         // -------------------------
//         try {
//             const response = await fetch(`${CONFIG.API_BASE_URL}/api/band-submit/`, {
//                 method: "POST",
//                 body: formData
//             });

//             const data = await response.json();
//             console.log(data);

//             if (data.status === "success") {
//                 showToastPage("Entry submitted successfully", "success");
//                 form.reset();
//             } else {
//                 showToastPage("Submission failed", "error");
//             }

//         } catch (err) {
//             console.error(err);
//             showToastPage("Server error", "error");

//         } finally {
//             // ✅ Always re-enable button
//             btn.disabled = false;
//             btn.innerText = "Submit Entry Form";
//         }

//     });
// });

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("bandForm");

    if (!form) {
        console.error("❌ bandForm not found");
        return;
    }

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        // -------------------------
        // 1. Declaration Check
        // -------------------------
        const checkboxes = document.querySelectorAll(".declaration-checkbox");
        const allChecked = [...checkboxes].every(cb => cb.checked);

        if (!allChecked) {
            showToastPage("Please accept all declarations", "error");
            return;
        }

        // -------------------------
        // 2. Collect Field Values FIRST
        // -------------------------
        const schoolName    = document.getElementById("schoolName").value.trim();
        const state         = document.getElementById("state").value.trim();
        const city          = document.getElementById("city").value.trim();
        const address       = document.getElementById("Address").value.trim();
        const contactPerson = document.getElementById("contactPerson").value.trim();
        const designation   = document.getElementById("designation").value.trim();
        const contactNumber = document.getElementById("contactNumber").value.trim();
        const contactEmail  = document.getElementById("contactEmail").value.trim();
        const totalMembers  = document.getElementById("totalMembers").value.trim();
        const schoolType    = document.querySelector('input[name="school_type"]:checked')?.value;
        const zone          = document.querySelector('input[name="zone"]:checked')?.value;
        const song1         = document.getElementById("song1").value.trim();
        const song2         = document.getElementById("song2").value.trim();
        const composer      = document.getElementById("composer").value.trim();
        const video         = document.getElementById("songVideo").files[0];

        // -------------------------
        // 3. Validate BEFORE confirm popup
        // -------------------------
        if (!schoolName) {
            showToastPage("School Name is required", "error"); return;
        }
        if (!state) {
            showToastPage("State is required", "error"); return;
        }
        if (!city) {
            showToastPage("City is required", "error"); return;
        }
        if (!address) {
            showToastPage("Address is required", "error"); return;
        }
        if (!contactPerson) {
            showToastPage("Contact Person is required", "error"); return;
        }
        if (!designation) {
            showToastPage("Designation is required", "error"); return;
        }
        if (!contactNumber || contactNumber.length !== 10) {
            showToastPage("Valid 10 digit Contact Number is required", "error"); return;
        }
       
        if (!totalMembers) {
            showToastPage("Total Members is required", "error"); return;
        }
        if (!schoolType) {
            showToastPage("Please select School Type", "error"); return;
        }
        if (!zone) {
            showToastPage("Please select Zone", "error"); return;
        }
        if (!song1) {
            showToastPage("Please select Song 1", "error"); return;
        }
        if (!song2) {
            showToastPage("Please enter Song 2", "error"); return;
        }
        if (!composer) {
            showToastPage("Please enter Composer name", "error"); return;
        }
        if (!video) {
            showToastPage("Please upload Song Video", "error"); return;
        }

        // Video size check
        // const videoSizeMB = video.size / (1024 * 1024);
        // if (videoSizeMB > 100) {
        //     showToastPage(`Video is ${videoSizeMB.toFixed(0)}MB. Please upload under 100MB`, "error"); return;
        // }
        // Video format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!contactEmail) {
            showToastPage("Contact Email is required", "error"); return;
        }
        if (!emailRegex.test(contactEmail)) {
            showToastPage("Please enter a valid Email address", "error"); return;
        }
        const allowedVideoFormats = ["video/mp4", "video/avi", "video/mkv", "video/mov", "video/wmv", "video/webm"];

        if (!allowedVideoFormats.includes(video.type)) {
            showToastPage("Invalid video format. Allowed: MP4, AVI, MKV, MOV, WMV, WEBM", "error"); return;
        }

        // Video size check
        const videoSizeMB = video.size / (1024 * 1024);
        if (videoSizeMB > 100) {
            showToastPage(`Video is ${videoSizeMB.toFixed(0)}MB. Please upload under 100MB`, "error"); return;
        }

        // Performer validation
        let performerError = false;
        document.querySelectorAll("#memberTable tbody tr").forEach((row, i) => {
            if (performerError) return;
            const pName       = row.querySelector(".p-name").value.trim();
            const pAge        = row.querySelector(".p-age").value;
            const pInstrument = row.querySelector(".p-instrument").value.trim();
            const pProof = row.querySelector(".p-proof")?.files[0];
            const pConsent = row.querySelector(".p-consent")?.files[0];

            if (!pName) {
                showToastPage(`Performer ${i + 1}: Name is required`, "error");
                performerError = true;
            } else if (!pAge) {
                showToastPage(`Performer ${i + 1}: Age is required`, "error");
                performerError = true;
            } else if (pAge > 18) {
                showToastPage(`Performer ${i + 1}: Age must be below 18`, "error");
                performerError = true;
            } else if (!pInstrument) {
                showToastPage(`Performer ${i + 1}: Instrument is required`, "error");
                performerError = true;
            } else if (!pProof) {
                showToastPage(`Performer ${i + 1}: ID Proof is required`, "error");
                performerError = true;
            } else if (!pConsent) {
                showToastPage(`Performer ${i + 1}: ID Consent Form is required`, "error");
                performerError = true;
            }
        });

        if (performerError) return;

        // -------------------------
        // 4. Confirm Submission AFTER validation
        // -------------------------
        const confirmed = await confirmSubmission();
        if (!confirmed) return;

        console.log("Submitting form...");

        // -------------------------
        // 5. Button Disable
        // -------------------------
        const btn = document.querySelector(".submit-btn");
        btn.disabled = true;
        btn.innerText = "Submitting...";

        // -------------------------
        // 6. Build FormData
        // -------------------------
        const formData = new FormData(form);

        let performers = [];
        document.querySelectorAll("#memberTable tbody tr").forEach((row, index) => {
            const name    = row.querySelector(".p-name").value;
            const age     = row.querySelector(".p-age").value;
            const instrument = row.querySelector(".p-instrument").value;
            const proof   = row.querySelector(".p-proof")?.files[0];
            const consent = row.querySelector(".p-consent")?.files[0];

            if (name || age || instrument) {
                performers.push({ name, age, instrument });
                if (proof)   formData.append(`proof_${index}`, proof);
                if (consent) formData.append(`consent_${index}`, consent);
            }
        });

        formData.append("school_name",    schoolName);
        formData.append("state",          state);
        formData.append("city",           city);
        formData.append("address",        address);
        formData.append("contact_person", contactPerson);
        formData.append("designation",    designation);
        formData.append("contact_number", contactNumber);
        formData.append("contact_email",  contactEmail);
        formData.append("total_members",  totalMembers);
        formData.append("school_type",    schoolType);
        formData.append("zone",           zone);
        formData.append("song1",          song1);
        formData.append("song2",          song2);
        formData.append("composer",       composer);
        formData.append("song_video",     video);
        formData.append("performers",     JSON.stringify(performers));

        // -------------------------
        // 7. API Call
        // -------------------------
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/band-submit/`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            console.log(data);

            if (data.status === "success") {
                showToastPage("Entry submitted successfully", "success");
                sessionStorage.setItem("submitted", "true");
                window.location.href = "thankyou.html";
                form.reset();
            } else {
                showToastPage(data.message || "Submission failed", "error");
            }

        } catch (err) {
            console.error(err);
            showToastPage("Server error. Please try again", "error");

        } finally {
            btn.disabled = false;
            btn.innerText = "Submit Entry Form";
        }

    });

});