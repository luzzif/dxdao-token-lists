import path from "path";
import fs from "fs";
import { glob } from "glob";
import { TokenInfo } from "@uniswap/token-lists";

const [, , target, logoURI, version] = process.argv;
if (!target) throw new Error("undefined target");
if (!version) throw new Error("undefined version");
if (!logoURI) throw new Error("undefined logo URI");
if (!/\d+\.\d+\.\d+/.test(version)) throw new Error("invalid version");

console.log(`Using target ${target}`);
console.log(`Using version ${version}`);

const splitVersion = version.split(".");
glob(path.join(__dirname, `../tokens/${target}/*.json`), (error, matches) => {
    if (error) throw error;
    const tokens = matches.reduce((tokens, match) => {
        return tokens.concat(require(match));
    }, []) as TokenInfo[];
    const list = {
        name: `${target.charAt(0).toUpperCase() + target.slice(1)} token list`,
        timestamp: new Date().toISOString(),
        version: {
            major: Number(splitVersion[0]),
            minor: Number(splitVersion[1]),
            patch: Number(splitVersion[2]),
        },
        tags: {},
        logoURI,
        keywords: [target, "default"],
        tokens: tokens.sort((t1, t2) => {
            if (t1.chainId === t2.chainId) {
                return t1.symbol.toLowerCase() < t2.symbol.toLowerCase()
                    ? -1
                    : 1;
            }
            return t1.chainId < t2.chainId ? -1 : 1;
        }),
    };

    const destinationPath = path.join(__dirname, "../lists");
    if (!fs.existsSync(destinationPath)) fs.mkdirSync(destinationPath);
    fs.writeFileSync(
        `${destinationPath}/${target}-list.json`,
        JSON.stringify(list)
    );
    console.log(`List correctly written at ${destinationPath}`);
});
