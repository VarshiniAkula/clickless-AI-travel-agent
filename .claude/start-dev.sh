#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
exec node node_modules/next/dist/bin/next dev --webpack
