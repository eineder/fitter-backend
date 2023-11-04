const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

module.exports = async function processManifest(manifestData) {
  const stageName = Object.keys(manifestData);
  const { outputs } = manifestData[stageName];

  const dotEnvFile = path.resolve(".env");
  const keyValues = {};
  for (const output of outputs) {
    const key = camelToSnakeCase(output.OutputKey);
    const value = output.OutputValue;
    keyValues[key] = value;
  }

  await updateDotEnv(dotEnvFile, keyValues);
};

/* Utils, typically this would be a package includes from NPM */
async function updateDotEnv(filePath, env) {
  // Merge with existing values
  try {
    const existing = dotenv.parse(
      await promisify(fs.readFile)(filePath, "utf-8")
    );
    env = Object.assign(existing, env);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  env = Object.keys(env)
    .sort()
    .reduce(function (accumulator, currentValue) {
      return { ...accumulator, [currentValue]: env[currentValue] };
    }, {});

  const contents = Object.keys(env)
    .map((key) => format(key, env[key]))
    .join("\n");
  await promisify(fs.writeFile)(filePath, contents);

  return env;
}

function escapeNewlines(str) {
  return str.replace(/\n/g, "\\n");
}

function format(key, value) {
  return `${key}=${escapeNewlines(value)}`;
}

function camelToSnakeCase(str) {
  return str
    .replace(/[A-Z]/g, (letter, index) => `${index > 0 ? "_" : ""}${letter}`)
    .toUpperCase();
}
