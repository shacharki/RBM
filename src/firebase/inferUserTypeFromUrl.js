

/**
 * Try to infer the type of the user from the url.
 * @returns { 'Manager' | 'Researcher' } The type of user.
 */
function inferUserTypeFromUrl() {
    return window.location.href.indexOf("Manager") === -1 ? "Researcher" : "Manager"
}

export default inferUserTypeFromUrl;