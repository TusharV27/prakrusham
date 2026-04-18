const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const p = path.resolve(filePath);
    let content = fs.readFileSync(p, 'utf8');
    for (const [find, replace] of replacements) {
        content = content.replace(new RegExp(find, 'g'), replace);
    }
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${p}`);
}

replaceInFile('components/Header.jsx', [
    [': "Detect Location"', ': t("detect_location")'],
    ['aria-label="Login"', 'aria-label={t("login_btn")}'],
    ['>Login<', '>{t("login_btn")}<'],
    ['"Login"', 't("login_btn")'],
    ['>All Collections<', '>{t("all_collections")}<'],
    ['>Explore More<', '>{t("explore_more")}<'],
    ['>Login to your account<', '>{t("login_btn")}<']
]);

replaceInFile('components/LocationPopup.jsx', [
    ['Search delivery location', '{t("settings") || "Search delivery location"}'],
    ['Search your area or pincode', '{t("settings") || "Search your area or pincode"}'],
    ['Notification detected', '{t("detect_location") || "Notification detected"}'],
    ['>Detect my location<', '>{t("detect_location")}<'],
    ['>Popular Areas<', '>{t("popular_areas") || "Popular Areas"}<'],
    ['>No areas found<', '>{t("no_areas_found") || "No areas found"}<'],
    ['>Checking location<', '>{t("checking_location") || "Checking location"}<'],
    ['>Location permission denied<', '>{t("location_permission_denied") || "Location permission denied"}<']
]);

// Also ProductCard.jsx
replaceInFile('components/ProductCard.jsx', [
    ['>ADD TO CART<', '>{t("add_to_cart")}<'],
    ['>OUT OF STOCK<', '>{t("out_of_stock")}<'],
    ['>BY FARMER<', '>{t("local_farmers") || "BY FARMER"}<']
]);
