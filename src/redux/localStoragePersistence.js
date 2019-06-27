export { save } from 'redux-localstorage-simple';

// Constants
const VERSION_NAMESPACE = 'BurndownChartist_VERSION';
const VERSION = '1';
export const LOCAL_STORAGE_NAMESPACE = 'BurndownChartist';

// Deserializes the initial state from localStorage.
export function load() {
    const loadedState = {};
    if (localStorage[LOCAL_STORAGE_NAMESPACE]) {
        const jsState = JSON.parse(localStorage[LOCAL_STORAGE_NAMESPACE]);

        // Versioning - by bumping the version number I can force a clean load when someone visits the site.
        // TODO: maintain the user so another login isn't required.
        const localVersion = localStorage[VERSION_NAMESPACE];
        if (!localVersion || localVersion !== VERSION) {
            console.warn('Version bump, clearing localStorage...');
            localStorage.clear();
            localStorage[VERSION_NAMESPACE] = VERSION;
            return {};
        }

        // User
        loadedState.user = jsState.user;

        // ui
        loadedState.ui = jsState.ui;
    }

    return loadedState;
}
