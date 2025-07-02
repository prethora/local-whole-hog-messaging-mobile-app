import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync, cpSync, statSync } from "fs";
import { resolve, join } from "path";
import { exit, chdir } from "process";

function main(): void {
    const projectDirPath = resolve(__dirname, "..");
    console.info(`ℹ️  Project directory: ${projectDirPath}`);

    const distRoot = join(projectDirPath, "dist");
    try {
        mkdirSync(distRoot, { recursive: true });
        console.info(`✔️  Ensured dist directory exists: ${distRoot}`);
    } catch (err) {
        console.error(`❌  Failed to create dist directory at ${distRoot}:`, err);
        exit(1);
    }

    const frontendDir = process.env.WH_MESSENGER_FRONTEND_DIR;
    if (!frontendDir) {
        console.error("❌  Environment variable WH_MESSENGER_FRONTEND_DIR is not set");
        exit(1);
    }
    if (!existsSync(frontendDir) || !statSync(frontendDir).isDirectory()) {
        console.error(`❌  Frontend directory missing or not a directory: ${frontendDir}`);
        exit(1);
    }
    console.info(`ℹ️  Frontend directory: ${frontendDir}`);

    chdir(frontendDir);
    console.info("ℹ️  Running build: npm run build (in Frontend directory)");
    try {
        execSync("npm run build", { stdio: "inherit" });
        console.info("✔️  Build completed successfully");
    } catch (err) {
        console.error("❌  Build failed:", err);
        exit(1);
    }

    const sourceDir = join(frontendDir, "dist");
    if (!existsSync(sourceDir) || !statSync(sourceDir).isDirectory()) {
        console.error(`❌  Source directory missing or not a directory: ${sourceDir}`);
        exit(1);
    }

    const destDir = join(distRoot, "whm_app");
    if (existsSync(destDir)) {
        try {
            rmSync(destDir, { recursive: true, force: true });
            console.info(`✔️  Removed existing destination directory: ${destDir}`);
        } catch (err) {
            console.error(`❌  Failed to remove existing destination directory ${destDir}:`, err);
            exit(1);
        }
    }

    try {
        cpSync(sourceDir, destDir, { recursive: true });
        console.info(`✔️  Copied build output from ${sourceDir} to ${destDir}`);
    } catch (err) {
        console.error(`❌  Failed to copy files from ${sourceDir} to ${destDir}:`, err);
        exit(1);
    }
}

main();
