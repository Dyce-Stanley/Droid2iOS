
const apkInput = document.getElementById("apkInput");
const uploadButton = document.getElementById("uploadButton");
const results = document.getElementById("results");
const fileInfo = document.getElementById("fileInfo");
const analysis = document.getElementById("analysis");
const resetButton = document.getElementById("resetButton");

uploadButton.addEventListener("click", () => {
    apkInput.click();
});

apkInput.addEventListener("change", async () => {
    const file = apkInput.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".apk")) {
        alert("Please select a valid APK file.");
        return;
    }

    uploadButton.textContent = "Analyzing APK...";
    uploadButton.disabled = true;

    try {
        if (typeof JSZip === "undefined") {
            throw new Error("ZIP engine failed to load.");
        }

        const zip = await JSZip.loadAsync(file);

        const entries = Object.keys(zip.files).filter(
            name => !zip.files[name].dir
        );

        if (!zip.files["AndroidManifest.xml"]) {
            throw new Error("AndroidManifest.xml was not found.");
        }

        const dexFiles = entries.filter(
            name => /^classes\d*\.dex$/i.test(name)
        );

        const nativeLibraries = entries.filter(
            name => name.startsWith("lib/") &&
                    name.endsWith(".so")
        );

        const resources = entries.filter(
            name => name.startsWith("res/")
        );

        const assets = entries.filter(
            name => name.startsWith("assets/")
        );

        const icons = entries.filter(
            name => /(^|\/)(ic_launcher|icon)\.(png|webp)$/i.test(name)
        );

        const manifest = zip.files["AndroidManifest.xml"];

        let manifestType = "Binary or unrecognized XML";

        const manifestText = await manifest.async("text");

        if (manifestText.trim().startsWith("<")) {
            manifestType = "Readable XML";
        }

        fileInfo.innerHTML = `
            <div class="result-item">
                <span>APK filename</span>
                <strong>${escapeHTML(file.name)}</strong>
            </div>
            <div class="result-item">
                <span>File size</span>
                <strong>${(file.size / 1024 / 1024).toFixed(2)} MB</strong>
            </div>
        `;

        const checks = [
            ["ZIP archive", "Valid"],
            ["Android manifest", "Found"],
            ["Manifest format", manifestType],
            ["DEX files", dexFiles.length],
            ["Native libraries", nativeLibraries.length],
            ["Resource files", resources.length],
            ["Asset files", assets.length],
            ["Potential icons", icons.length],
            ["Total archive entries", entries.length]
        ];

        analysis.innerHTML = checks.map(([name, value]) => `
            <div class="result-item">
                <span>${escapeHTML(String(name))}</span>
                <strong>${escapeHTML(String(value))}</strong>
            </div>
        `).join("");

        results.classList.remove("hidden");

        results.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        alert("APK analysis failed: " + error.message);
    } finally {
        uploadButton.textContent = "Choose APK File";
        uploadButton.disabled = false;
    }
});

resetButton.addEventListener("click", () => {
    apkInput.value = "";
    results.classList.add("hidden");
});

function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}
