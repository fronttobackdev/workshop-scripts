import * as path from "node:path";
import * as fs from "node:fs";

/**
 *
 * @param {fs.Stats | string | null | undefined} pathname
 * @returns
 */
export async function isDirectory(pathname) {
	if (!pathname) return false;
	try {
		let stats =
			typeof pathname === "string"
				? await fs.promises.stat(pathname)
				: pathname;
		return stats.isDirectory();
	} catch (err) {
		return false;
	}
}

/**
 *
 * @param {fs.Stats | string | null | undefined} pathname
 * @returns
 */
export async function isFile(pathname) {
	if (!pathname) return false;
	try {
		let stats =
			typeof pathname === "string"
				? await fs.promises.stat(pathname)
				: pathname;
		return stats.isFile();
	} catch (err) {
		return false;
	}
}

/**
 * @param {fs.Stats | string | null | undefined} pathname
 * @returns {Promise<boolean>}
 */
export async function pathExists(pathname) {
	if (!pathname) return false;
	try {
		let stats =
			typeof pathname === "string"
				? await fs.promises.stat(pathname)
				: pathname;
		return stats.isFile() || stats.isDirectory();
	} catch (err) {
		return false;
	}
}

/**
 * @param {string} rootPath
 * @param {{ recursive?: string }} [opts]
 * @returns {Promise<string[]>}
 */
export async function getSubDirectories(rootPath, opts = {}) {
	let recursive = opts?.recursive || false;
	let contents = await fs.promises.readdir(rootPath, { withFileTypes: true });
	/** @type {string[]} */
	let paths = [];
	for (let stat of contents) {
		if (!stat.isDirectory()) continue;
		let fullPath = path.resolve(rootPath, stat.name);
		paths.push(fullPath);
		if (recursive) {
			let subdirs = await getSubDirectories(fullPath, opts);
			paths.push(...subdirs);
		}
	}
	return paths;
}

/**
 * @param {string} [cwd] Defaults to process.cwd()
 * @returns {Promise<string[]>}
 */
export async function getExercisePaths(cwd) {
	cwd ??= process.cwd();
	return await getSubDirectories(path.join(cwd, "exercise"));
}

/**
 * @param {string} [cwd] Defaults to process.cwd()
 * @returns {Promise<string[]>}
 */
export async function getFinalPaths(cwd) {
	cwd ??= process.cwd();
	return await getSubDirectories(path.join(cwd, "final"));
}

/**
 * @param {string} [cwd] Defaults to process.cwd()
 * @returns {Promise<string[]>}
 */
export async function getAppPaths(cwd) {
	let dirs = await Promise.all([getExercisePaths(cwd), getFinalPaths(cwd)]);
	return dirs.flat();
}

/**
 * @param {string} pathStart
 * @param {string} [cwd] Defaults to process.cwd()
 * @returns {Promise<string|undefined>}
 */
export async function resolveAppPath(pathStart, cwd) {
	return (await getAppPaths(cwd)).find((dir) =>
		path.resolve(dir).startsWith(path.resolve(pathStart)),
	);
}

/**
 * @param {string} pathname
 */
export async function ensureDir(pathname) {
	if (!(await isDirectory(pathname))) {
		await fs.promises.mkdir(pathname, { recursive: true });
	}
}
