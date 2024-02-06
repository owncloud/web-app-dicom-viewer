OC_CI_NODEJS = "owncloudci/nodejs:18"
OC_CI_BUILDIFIER = "owncloudci/bazel-buildifier:latest"
SONARSOURCE_SONAR_SCANNER_CLI = "sonarsource/sonar-scanner-cli:5.0"

def main(ctx):
    return checkStarlark() + unitTestPipeline(ctx)

def checkStarlark():
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "check-starlark",
        "steps": [
            {
                "name": "format-check-starlark",
                "image": OC_CI_BUILDIFIER,
                "commands": [
                    "buildifier --mode=check .drone.star",
                ],
            },
            {
                "name": "show-diff",
                "image": OC_CI_BUILDIFIER,
                "commands": [
                    "buildifier --mode=fix .drone.star",
                    "git diff",
                ],
                "when": {
                    "status": [
                        "failure",
                    ],
                },
            },
        ],
        "depends_on": [],
        "trigger": {
            "ref": [
                "refs/pull/**",
            ],
        },
    }]

def unitTestPipeline(ctx):
    sonar_env = {
        "SONAR_TOKEN": {
            "from_secret": "sonar_token",
        },
    }
    if ctx.build.event == "pull_request":
        sonar_env.update({
            "SONAR_PULL_REQUEST_BASE": "%s" % (ctx.build.target),
            "SONAR_PULL_REQUEST_BRANCH": "%s" % (ctx.build.source),
            "SONAR_PULL_REQUEST_KEY": "%s" % (ctx.build.ref.replace("refs/pull/", "").split("/")[0]),
        })
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "unit-tests",
        "steps": installPnpm() +
                 [
                     {
                         "name": "unit-tests",
                         "image": OC_CI_NODEJS,
                         "commands": [
                             "pnpm run coverage",
                         ],
                     },
                     {
                         "name": "sonarcloud",
                         "image": SONARSOURCE_SONAR_SCANNER_CLI,
                         "environment": sonar_env,
                     },
                 ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/pull/**",
            ],
        },
    }]

def installPnpm():
    return [{
        "name": "pnpm-install",
        "image": OC_CI_NODEJS,
        "commands": [
            'npm install --silent --global --force "$(jq -r ".packageManager" < package.json)"',
            "pnpm config set store-dir ./.pnpm-store",
            "pnpm install",
        ],
    }]
