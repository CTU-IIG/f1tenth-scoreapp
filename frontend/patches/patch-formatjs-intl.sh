#!/usr/bin/env bash

set -e

# Note: This patch is no longer used.
#
#   The bug in @formatjs/intl (see below) was fixed in https://github.com/formatjs/formatjs/commit/a2b7bc6ea8426ee1ea76066fd5da6df8ebe7c153
#   and released in version 2.2.5 (https://github.com/formatjs/formatjs/commit/3e1aa52c32f93bc50efd46827f3c99e2bfac6d7b#diff-39e08eee7d3c98debef85452029a97969432268dcc763e7696e98ca81933d2ce).
#
#   The bug: fractionalSecondDigits was missing in dateTime.ts DATE_TIME_FORMAT_OPTIONS
#            see https://github.com/formatjs/formatjs/blob/main/packages/intl/src/dateTime.ts#L28
#

# This is a temporary patch script working only for @formatjs/intl version <version>
# This script must be run from the frontend root

version="2.2.1"

if ! grep "\"version\": \"$version\"" "node_modules/@formatjs/intl/package.json" 1>/dev/null; then
	echo "@formatjs/intl version $version not found (node_modules/@formatjs/intl/package.json)"
	exit 1
fi

if grep "fractionalSecondDigits" "node_modules/@formatjs/intl/lib/src/dateTime.js" 1>/dev/null && grep "fractionalSecondDigits" "node_modules/@formatjs/intl/src/dateTime.js" 1>/dev/null; then
	echo "skipping @formatjs/intl version $version patching (already patched)"
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
