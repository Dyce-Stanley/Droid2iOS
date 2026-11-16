(function () {
    "use strict";

    const ANDROID_NS = "http://schemas.android.com/apk/res/android";

    function androidAttr(element, name) {
        return element.getAttributeNS(ANDROID_NS, name) ||
            element.getAttribute("android:" + name) ||
            "";
    }

    function parseAndroidManifest(xmlText) {
        const document = new DOMParser().parseFromString(xmlText, "application/xml");
        const parserError = document.querySelector("parsererror");

        if (parserError || !document.documentElement ||
            document.documentElement.localName !== "manifest") {
            throw new Error("The manifest is not readable XML. Binary Android manifests are not supported by this parser yet.");
        }

        const manifest = document.documentElement;
        const sdk = document.querySelector("uses-sdk");
        const application = document.querySelector("application");

        const permissions = Array.from(document.querySelectorAll(
            "uses-permission, uses-permission-sdk-23, uses-permission-sdk-m"
        )).map(element => androidAttr(element, "name")).filter(Boolean);

        return {
            packageName: manifest.getAttribute("package") || "Not declared",
            versionCode: androidAttr(manifest, "versionCode") || "Not declared",
            versionName: androidAttr(manifest, "versionName") || "Not declared",
            minSdk: sdk ? androidAttr(sdk, "minSdkVersion") || "Not declared" : "Not declared",
            targetSdk: sdk ? androidAttr(sdk, "targetSdkVersion") || "Not declared" : "Not declared",
            appLabel: application ? androidAttr(application, "label") || "Not declared" : "Not declared",
            appIcon: application ? androidAttr(application, "icon") || "Not declared" : "Not declared",
            permissions: Array.from(new Set(permissions))
        };
    }

    window.Droid2iOSManifestParser = { parse: parseAndroidManifest };
})();
