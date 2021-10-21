#!/usr/bin/env bash

set -e

# TODO: There is a bug in @formatjs/intl
#   fractionalSecondDigits is missing in dateTime.ts DATE_TIME_FORMAT_OPTIONS
#   see https://github.com/formatjs/formatjs/blob/main/packages/intl/src/dateTime.ts#L7

# This is temporary patch script working only for @formatjs/intl version 1.14.3
# This script must be run from the frontend root

if ! grep '"version": "1.14.3"' "node_modules/@formatjs/intl/package.json" 1>/dev/null; then
	echo "@formatjs/intl version 1.14.3 not found (node_modules/@formatjs/intl/package.json)"
	exit 1
fi

if grep "fractionalSecondDigits" "node_modules/@formatjs/intl/lib/src/dateTime.js" 1>/dev/null && grep "fractionalSecondDigits" "node_modules/@formatjs/intl/src/dateTime.js" 1>/dev/null; then
	echo "skipping @formatjs/intl version 1.14.3 patching (already patched)"
	exit 0
fi

if [[ $(uname) == "Linux" ]]; then
	sed -i "24i\    'fractionalSecondDigits'," "node_modules/@formatjs/intl/lib/src/dateTime.js"
	sed -i "27i\    'fractionalSecondDigits'," "node_modules/@formatjs/intl/src/dateTime.js"
elif [[ $(uname) == "Darwin" ]]; then
	# on macOS, there is a BSD sed which is different from GNU sed
	nl=$'\n'
	sed -i '' "24i\\${nl}    'fractionalSecondDigits',${nl}" "node_modules/@formatjs/intl/lib/src/dateTime.js"
	sed -i '' "27i\\${nl}    'fractionalSecondDigits',${nl}" "node_modules/@formatjs/intl/src/dateTime.js"
else
	echo "unsupported system '$(uname)'"
	exit 1
fi
