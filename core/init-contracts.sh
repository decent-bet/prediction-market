#!/usr/bin/env bash

rm -rf ./build
truffle migrate
mkdir -p ../cli/build && cp -r ./build/contracts ../cli/build
mkdir -p ../relayer/build && cp -r ./build/contracts ../relayer/build
mkdir -p ../poc-frontend/src/Contracts/build && cp -r ./build/contracts ../poc-frontend/src/Contracts/build