#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
exec node node_modules/next/dist/bin/next dev --port 3000 --webpack
