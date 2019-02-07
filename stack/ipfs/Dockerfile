FROM ipfs/go-ipfs:latest

RUN ipfs init --profile=test \
    && ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:5001", "http://localhost:4200"]' \
    && ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]' \
    && ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'