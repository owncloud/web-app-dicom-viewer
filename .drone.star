OC_CI_NODEJS = "owncloudci/nodejs:18"
OC_CI_BUILDIFIER = "owncloudci/bazel-buildifier:latest"
SONARSOURCE_SONAR_SCANNER_CLI = "sonarsource/sonar-scanner-cli:5.0"
OC_CI_WAIT_FOR = "owncloudci/wait-for:latest"
OCIS_IMAGE = "owncloud/ocis:5.0"

dir = {
    "webConfig": "/drone/src/tests/drone/web.config.json",
}

def main(ctx):
    return checkStarlark() + \
           pnpmlint(ctx) + \
           unitTestPipeline(ctx) + \
           e2eTests()

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
        "depends_on": ["check-starlark", "lint"],
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
                "refs/heads/main",
                "refs/pull/**",
            ],
        },
    }]

def pnpmlint(ctx):
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "lint",
        "steps": installPnpm() +
                 [
                     {
                         "name": "lint",
                         "image": OC_CI_NODEJS,
                         "commands": [
                             "pnpm lint",
                         ],
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

def serveExtension():
    return [
        {
            "name": "generate-certs",
            "image": OC_CI_NODEJS,
            "commands": [
                "mkdir -p dev/docker/traefik/certificates",
                "cd dev/docker/traefik/certificates",
                "openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -nodes -days 365 -subj '/CN=extension'",
            ],
        },
        {
            "name": "extension",
            "image": OC_CI_NODEJS,
            "detach": True,
            "commands": [
                "pnpm build:w",
            ],
        },
    ]

def installBrowsers():
    return [{
        "name": "install-browsers",
        "image": OC_CI_NODEJS,
        "environment": {
            "PLAYWRIGHT_BROWSERS_PATH": ".playwright",
        },
        "commands": [
            "pnpm exec playwright install --with-deps chromium",
        ],
    }]

def e2eTests():
    environment = {
        "HEADLESS": "true",
        "retry": "1",
        "BASE_URL_OCIS": "https://ocis:9200",
    }

    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "e2e-tests",
        "depends_on": ["unit-tests"],
        "steps": installPnpm() +
                 installBrowsers() +
                 serveExtension() +
                 ocisService() +
                 [
                     {
                         "name": "e2e-tests",
                         "image": OC_CI_NODEJS,
                         "environment": environment,
                         "commands": [
                             "pnpm run test:e2e tests/e2e/features/*.feature",
                         ],
                     },
                 ],
        "trigger": {
            "ref": [
                "refs/heads/main",
                "refs/pull/**",
            ],
        },
    }]

def ocisService():
    environment = {
        "IDM_ADMIN_PASSWORD": "admin",
        "OCIS_INSECURE": True,
        "OCIS_LOG_LEVEL": "error",
        "OCIS_URL": "https://ocis:9200",
        "PROXY_ENABLE_BASIC_AUTH": True,
        "WEB_UI_CONFIG_FILE": "%s" % dir["webConfig"],
    }

    return [
        {
            "type": "docker",
            "name": "ocis",
            "image": OCIS_IMAGE,
            "detach": True,
            "environment": environment,
            "commands": [
                "cd /usr/bin",
                "ocis init",
                "ocis server",
            ],
        },
        {
            "name": "wait-for-ocis-server",
            "image": OC_CI_WAIT_FOR,
            "commands": [
                "wait-for -it ocis:9200 -t 300",
            ],
        },
    ]
