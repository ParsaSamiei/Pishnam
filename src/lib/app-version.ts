import packageJson from "../../package.json";

/** Semver from package.json — shown in the site footer for deploy verification. */
export const APP_VERSION = packageJson.version;
