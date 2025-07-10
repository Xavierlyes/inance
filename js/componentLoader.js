/**
 * Fetches an HTML component and injects it into a placeholder element.
 * @param {string} componentPath - The path to the HTML component file.
 * @param {string} placeholderId - The ID of the element to inject the component into.
 * @returns {Promise<void>} A promise that resolves when the component is loaded.
 */
async function loadComponent(componentPath, placeholderId) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to fetch component: ${componentPath}, status: ${response.status}`);
        }
        const componentHtml = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.outerHTML = componentHtml;
        } else {
            console.warn(`Placeholder with ID "${placeholderId}" not found.`);
        }
    } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
    }
}

/**
 * Loads all essential UI components like header and sidebar.
 * @returns {Promise<void>} A promise that resolves when all components are loaded.
 */
export async function loadUIComponents() {
    await Promise.all([
        loadComponent('components/sidebar.html', 'sidebar-placeholder'),
        loadComponent('components/header.html', 'header-placeholder')
    ]);
}