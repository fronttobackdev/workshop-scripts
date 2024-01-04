import path from "node:path";
import { pathExists, resolveAppPath } from "./utils.js";
import spawn from "cross-spawn";

/**
 * @param {string} cwd
 * @param {string[]} args
 * @returns
 */
export async function dev(cwd, ...args) {
	if (!args[0]) {
		console.error("You forgot to pass the exercise you want to run!");
		return;
	}
	let appDir = await resolveAppPath(args[0], cwd);
	if (!(await pathExists(appDir))) {
		console.log(`${args[0]} is not a valid app`);
		return;
	}

	let [, category, numberAndName] = path.relative("..", appDir).split(path.sep);
	let [number] = numberAndName.split("-");
	let port = { exercise: 4000, final: 5000 }[category] + Number(number);

	spawn(`npm run dev`, {
		cwd: appDir,
		shell: true,
		stdio: "inherit",
		env: {
			PORT: String(port),
			...process.env,
		},
	});
}
